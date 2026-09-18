param(
    [string]$Target = "x86_64-pc-windows-msvc",
    [string]$OutputPath = "THIRD_PARTY_LICENSES/DEPENDENCY_LICENSES.txt"
)

$ErrorActionPreference = "Stop"

function Get-ReachableCargoPackages {
    param([string]$ManifestPath, [string]$TargetTriple)

    $raw = & cargo metadata --manifest-path $ManifestPath --format-version 1 --locked --filter-platform $TargetTriple 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ("cargo metadata failed for " + $ManifestPath + [Environment]::NewLine + ($raw -join [Environment]::NewLine))
    }

    $metadata = ($raw -join [Environment]::NewLine) | ConvertFrom-Json
    $packagesById = @{}
    foreach ($package in $metadata.packages) { $packagesById[$package.id] = $package }

    $nodesById = @{}
    foreach ($node in $metadata.resolve.nodes) { $nodesById[$node.id] = $node }

    $seen = [System.Collections.Generic.HashSet[string]]::new()
    $queue = [System.Collections.Generic.Queue[string]]::new()
    $queue.Enqueue([string]$metadata.resolve.root)

    while ($queue.Count -gt 0) {
        $id = $queue.Dequeue()
        if (-not $seen.Add($id)) { continue }
        if (-not $nodesById.ContainsKey($id)) { continue }
        foreach ($dependency in $nodesById[$id].deps) {
            $queue.Enqueue([string]$dependency.pkg)
        }
    }

    foreach ($id in $seen) {
        $package = $packagesById[$id]
        if ($null -eq $package.source) { continue }

        [PSCustomObject]@{
            Ecosystem = "Rust"
            Name = [string]$package.name
            Version = [string]$package.version
            License = if ($package.license) { [string]$package.license } else { "" }
            Root = Split-Path -Parent ([string]$package.manifest_path)
        }
    }
}

function Get-NpmRuntimePackages {
    $nodeScript = @'
const fs = require("fs");
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
const rows = Object.entries(lock.packages || {})
  .filter(([path, pkg]) => path && pkg && pkg.version && pkg.dev !== true)
  .map(([path, pkg]) => ({
    Ecosystem: "npm",
    Name: path.replace(/^node_modules\//, ""),
    Version: String(pkg.version),
    License: pkg.license ? String(pkg.license) : "",
    Root: path
  }));
process.stdout.write(JSON.stringify(rows));
'@

    $tempScript = Join-Path ([System.IO.Path]::GetTempPath()) "safex-mine-third-party-licenses.js"

    try {
        [System.IO.File]::WriteAllText(
            $tempScript,
            $nodeScript,
            [System.Text.UTF8Encoding]::new($false)
        )

        $raw = & node $tempScript 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw ("Node.js could not parse package-lock.json" + [Environment]::NewLine + ($raw -join [Environment]::NewLine))
        }
    }
    finally {
        if (Test-Path $tempScript) {
            Remove-Item $tempScript -Force -ErrorAction SilentlyContinue
        }
    }

    $rows = ($raw -join [Environment]::NewLine) | ConvertFrom-Json

    foreach ($package in @($rows)) {
        [PSCustomObject]@{
            Ecosystem = [string]$package.Ecosystem
            Name = [string]$package.Name
            Version = [string]$package.Version
            License = [string]$package.License
            Root = Join-Path (Get-Location) ([string]$package.Root)
        }
    }
}

function Get-LicenseFiles {
    param([string]$Root)

    if (-not (Test-Path -LiteralPath $Root)) {
        return @()
    }

    @(Get-ChildItem -LiteralPath $Root -File | Where-Object {
        $_.Name -match "^(?i)(LICENSE|LICENCE|COPYING|NOTICE|COPYRIGHT|UNLICENSE)([._-].*)?$"
    } | Sort-Object Name)
}

Write-Host "Collecting exact dependency licence files..." -ForegroundColor Cyan

$rust = @(
    Get-ReachableCargoPackages -ManifestPath "src-tauri/Cargo.toml" -TargetTriple $Target
    Get-ReachableCargoPackages -ManifestPath "src-tauri/helper/Cargo.toml" -TargetTriple $Target
) | Sort-Object Name, Version -Unique

$npm = @(Get-NpmRuntimePackages) | Sort-Object Name, Version -Unique
$packages = @($rust) + @($npm) | Sort-Object Ecosystem, Name, Version

$out = [System.Collections.Generic.List[string]]::new()
$out.Add("THE SAFEX MINE - THIRD-PARTY DEPENDENCY LICENCES")
$out.Add("================================================")
$out.Add("")
$out.Add("Generated from the exact locked dependency packages available on the release build machine.")
$out.Add("Target: " + $Target)
$out.Add("")
$out.Add("The Rust set is deliberately conservative and follows the resolved target graph, including build-time crates resolved for this target. Including an extra notice does not imply that the corresponding package is linked into the distributed executable.")
$out.Add("")

$withoutFiles = [System.Collections.Generic.List[string]]::new()
$fileCount = 0

foreach ($package in $packages) {
    $out.Add("")
    $out.Add("======================================================================")
    $out.Add($package.Ecosystem + ": " + $package.Name + " " + $package.Version)
    $declared = if ($package.License) { $package.License } else { "(not declared)" }
    $out.Add("Declared licence: " + $declared)
    $out.Add("======================================================================")

    $licenseFiles = @(Get-LicenseFiles -Root $package.Root)

    if ($licenseFiles.Count -eq 0) {
        $withoutFiles.Add(
            $package.Ecosystem + ": " + $package.Name + " " + $package.Version + " [" + $declared + "]"
        )
        $out.Add("")
        $out.Add("[No root-level licence/notice file was present in the installed package; see the declared licence expression above.]")
        continue
    }

    foreach ($file in $licenseFiles) {
        $fileCount++
        $out.Add("")
        $out.Add("--- " + $file.Name + " ---")
        $out.Add("")

        try {
            $text = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop
            $out.Add($text.TrimEnd())
        }
        catch {
            $out.Add("[Unable to read this notice file as text: " + $file.FullName + "]")
        }
    }
}

$out.Add("")
$out.Add("======================================================================")
$out.Add("PACKAGES WITHOUT A ROOT-LEVEL LICENCE/NOTICE FILE")
$out.Add("======================================================================")
$out.Add("")

if ($withoutFiles.Count -eq 0) {
    $out.Add("None.")
}
else {
    foreach ($item in $withoutFiles) {
        $out.Add($item)
    }
}

$directory = Split-Path -Parent $OutputPath
if ($directory -and -not (Test-Path $directory)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

$out | Set-Content -Path $OutputPath -Encoding utf8

Write-Host ""
Write-Host ("Dependency licence bundle written to " + $OutputPath) -ForegroundColor Green
Write-Host ("Packages examined          : " + $packages.Count)
Write-Host ("Licence/notice files copied: " + $fileCount)
Write-Host ("Packages without files     : " + $withoutFiles.Count)

if ($withoutFiles.Count -gt 0) {
    Write-Host "Those packages remain listed in the generated bundle with their declared licence expression." -ForegroundColor Yellow
}

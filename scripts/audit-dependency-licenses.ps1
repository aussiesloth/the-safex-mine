param(
    [string]$Target = "x86_64-pc-windows-msvc",
    [string]$OutputPath = "docs/DEPENDENCY_LICENSE_AUDIT.md"
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
            LicenseFile = if ($package.license_file) { [string]$package.license_file } else { "" }
            Source = [string]$package.source
        }
    }
}

function Get-NpmRuntimePackages {
    $lock = Get-Content "package-lock.json" -Raw | ConvertFrom-Json
    foreach ($property in $lock.packages.PSObject.Properties) {
        if ([string]::IsNullOrWhiteSpace($property.Name)) { continue }
        $package = $property.Value
        if ($package.dev -eq $true) { continue }
        if (-not $package.version) { continue }
        [PSCustomObject]@{
            Ecosystem = "npm"
            Name = $property.Name -replace "^node_modules/", ""
            Version = [string]$package.version
            License = if ($package.license) { [string]$package.license } else { "" }
            LicenseFile = ""
            Source = if ($package.resolved) { [string]$package.resolved } else { "" }
        }
    }
}

Write-Host "Collecting locked Windows dependency metadata..." -ForegroundColor Cyan

$rust = @(
    Get-ReachableCargoPackages -ManifestPath "src-tauri/Cargo.toml" -TargetTriple $Target
    Get-ReachableCargoPackages -ManifestPath "src-tauri/helper/Cargo.toml" -TargetTriple $Target
) | Sort-Object Name, Version -Unique

$npm = @(Get-NpmRuntimePackages) | Sort-Object Name, Version -Unique
$all = @($rust) + @($npm)

$missing = @($all | Where-Object {
    [string]::IsNullOrWhiteSpace($_.License) -and [string]::IsNullOrWhiteSpace($_.LicenseFile)
})

$reviewPattern = "(?i)(GPL|AGPL|LGPL|MPL|EPL|CDDL|OSL|EUPL|CC-BY|OpenSSL|Unicode|BSD|ISC|Zlib)"
$review = @($all | Where-Object {
    $_.License -match $reviewPattern -or -not [string]::IsNullOrWhiteSpace($_.LicenseFile)
} | Sort-Object Ecosystem, Name, Version)

$expressions = $all | Group-Object Ecosystem, License | Sort-Object Name

$report = [System.Collections.Generic.List[string]]::new()
$report.Add("# Dependency Licence Audit")
$report.Add("")
$report.Add("Generated from the exact locked dependency metadata for the Windows release target.")
$report.Add("")
$report.Add("- Target: " + $Target)
$report.Add("- Rust packages in target graph: " + $rust.Count)
$report.Add("- npm runtime packages: " + $npm.Count)
$report.Add("- Packages with missing licence metadata: " + $missing.Count)
$report.Add("")
$report.Add("Build/dev-only npm dependencies are excluded because they are not shipped as npm packages in the Windows application.")
$report.Add("")
$report.Add("## Licence expressions")
$report.Add("")
$report.Add("| Ecosystem | Licence expression | Packages |")
$report.Add("| --- | --- | ---: |")
foreach ($group in $expressions) {
    $parts = $group.Name -split ", ", 2
    $eco = $parts[0]
    $lic = if ($parts.Count -gt 1 -and -not [string]::IsNullOrWhiteSpace($parts[1])) { $parts[1] } else { "(missing)" }
    $report.Add("| " + $eco + " | " + $lic + " | " + $group.Count + " |")
}

$report.Add("")
$report.Add("## Packages requiring explicit review")
$report.Add("")
$report.Add("Flagged licence families may require preserved notices, source-availability handling, or closer review. A flag is not a finding of incompatibility.")
$report.Add("")
$report.Add("| Ecosystem | Package | Version | Licence | Licence file |")
$report.Add("| --- | --- | --- | --- | --- |")
if ($review.Count -eq 0) {
    $report.Add("| - | None | - | - | - |")
} else {
    foreach ($package in $review) {
        $lic = if ($package.License) { $package.License } else { "(missing)" }
        $lf = if ($package.LicenseFile) { $package.LicenseFile } else { "-" }
        $report.Add("| " + $package.Ecosystem + " | " + $package.Name + " | " + $package.Version + " | " + $lic + " | " + $lf + " |")
    }
}

$report.Add("")
$report.Add("## Missing licence metadata")
$report.Add("")
if ($missing.Count -eq 0) {
    $report.Add("No package in the audited target graph is missing both a licence expression and a licence-file declaration.")
} else {
    foreach ($package in $missing | Sort-Object Ecosystem, Name, Version) {
        $report.Add("- " + $package.Ecosystem + ": " + $package.Name + " " + $package.Version)
    }
}

$report.Add("")
$report.Add("## Full audited dependency inventory")
$report.Add("")
$report.Add("| Ecosystem | Package | Version | Licence |")
$report.Add("| --- | --- | --- | --- |")
foreach ($package in $all | Sort-Object Ecosystem, Name, Version) {
    $lic = if ($package.License) { $package.License } elseif ($package.LicenseFile) { "SEE LICENCE FILE: " + $package.LicenseFile } else { "(missing)" }
    $report.Add("| " + $package.Ecosystem + " | " + $package.Name + " | " + $package.Version + " | " + $lic + " |")
}

$directory = Split-Path -Parent $OutputPath
if ($directory -and -not (Test-Path $directory)) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }
$report | Set-Content -Path $OutputPath -Encoding utf8

Write-Host ""
Write-Host ("Dependency licence audit written to " + $OutputPath) -ForegroundColor Green
Write-Host ("Rust target packages : " + $rust.Count)
Write-Host ("npm runtime packages : " + $npm.Count)
Write-Host ("Missing metadata      : " + $missing.Count)
Write-Host ("Flagged for review    : " + $review.Count)

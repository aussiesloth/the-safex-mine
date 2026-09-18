fn main() {
    if std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default() == "windows" {
        let mut resource = winresource::WindowsResource::new();

        resource
            .set("ProductName", "The Safex Mine Helper")
            .set("FileDescription", "Privileged helper for The Safex Mine")
            .set("InternalName", "safex-mine-helper.exe")
            .set_manifest(
                r#"
<assembly
    xmlns="urn:schemas-microsoft-com:asm.v1"
    manifestVersion="1.0">

    <trustInfo
        xmlns="urn:schemas-microsoft-com:asm.v3">

        <security>
            <requestedPrivileges>
                <requestedExecutionLevel
                    level="requireAdministrator"
                    uiAccess="false"
                />
            </requestedPrivileges>
        </security>

    </trustInfo>

</assembly>
"#,
            );

        resource
            .compile()
            .expect("Failed to compile Windows helper resources");
    }
}

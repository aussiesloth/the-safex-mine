use std::{
    time::Duration,
    mem::size_of,
    path::PathBuf,
};

use tokio::{
    io::{
        AsyncBufReadExt,
        AsyncWriteExt,
        BufReader as TokioBufReader,
        ReadHalf,
        WriteHalf,
    },
    net::windows::named_pipe::{
        NamedPipeServer,
        ServerOptions,
    },
    sync::Mutex as AsyncMutex,
    time::timeout,
};

use uuid::Uuid;

use windows::{
    core::{
    PCWSTR,
    PWSTR,
    },
    Win32::{
        Foundation::{
            CloseHandle,
            HLOCAL,
            LocalFree,
        },
        Security::{
            Authorization::{
                ConvertSidToStringSidW,
                ConvertStringSecurityDescriptorToSecurityDescriptorW,
                SDDL_REVISION_1,
            },
            GetTokenInformation,
            PSECURITY_DESCRIPTOR,
            SECURITY_ATTRIBUTES,
            TOKEN_QUERY,
            TOKEN_USER,
            TokenUser,
        },
        System::Threading::{
            GetCurrentProcess,
            OpenProcessToken,
        },
        UI::{
            Shell::{
                ShellExecuteExW,
                SHELLEXECUTEINFOW,
                SEE_MASK_NOCLOSEPROCESS,
            },
            WindowsAndMessaging::{
                SW_HIDE,
            },
        },
    },
};

use tauri::{
    path::BaseDirectory,
    Manager,
    State,
};

type HelperPipeReader =
    TokioBufReader<
        ReadHalf<NamedPipeServer>
    >;

type HelperPipeWriter =
    WriteHalf<NamedPipeServer>;


struct HelperSession {
    reader: HelperPipeReader,
    writer: HelperPipeWriter,
}


struct HelperSessionState {
    session:
        AsyncMutex<
            Option<HelperSession>
        >,
}


impl Default
    for HelperSessionState
{
    fn default() -> Self {

        Self {
            session:
                AsyncMutex::new(
                    None,
                ),
        }
    }
}


fn safex_helper_path(
    app: &tauri::AppHandle,
) -> Result<PathBuf, String> {

    let packaged_path =
        app
            .path()
            .resolve(
                "runtime/safex-mine-helper.exe",
                BaseDirectory::Resource,
            );

    if let Ok(path) =
        &packaged_path
    {
        if path.exists() {
            return Ok(
                path.clone()
            );
        }
    }

    let development_path =
        PathBuf::from(
            env!("CARGO_MANIFEST_DIR"),
        )
        .join("helper")
        .join("target")
        .join("release")
        .join(
            "safex-mine-helper.exe",
        );

    if development_path.exists() {
        return Ok(
            development_path
        );
    }

    match packaged_path {
        Ok(path) => Err(
            format!(
                "Safex Mine helper not found. Checked packaged path {} and development path {}.",
                path.display(),
                development_path.display(),
            )
        ),

        Err(error) => Err(
            format!(
                "Safex Mine helper not found at development path {} and the packaged resource path could not be resolved: {error}",
                development_path.display(),
            )
        ),
    }
}

#[tauri::command]
fn backend_probe() -> String {
    format!(
        "Rust backend connected — v{}",
        env!("CARGO_PKG_VERSION")
    )
}

const SAFEX_MAINNET_ADDRESS_PREFIX: u64 = 268_449_688;

fn decode_varint(bytes: &[u8]) -> Option<(u64, usize)> {
    let mut value = 0u64;
    let mut shift = 0u32;

    for (index, byte) in bytes.iter().copied().enumerate().take(10) {
        let part = (byte & 0x7f) as u64;

        if shift >= 64 {
            return None;
        }

        value |= part.checked_shl(shift)?;

        if byte & 0x80 == 0 {
            return Some((value, index + 1));
        }

        shift += 7;
    }

    None
}

#[tauri::command]
fn validate_safex_address(address: String) -> bool {
    let address = address.trim();

    if address.is_empty() {
        return false;
    }

    let decoded =
        match base58_monero::decode_check(address) {
            Ok(decoded) => decoded,
            Err(_) => return false,
        };

    let (prefix, prefix_length) =
        match decode_varint(&decoded) {
            Some(result) => result,
            None => return false,
        };

    if prefix != SAFEX_MAINNET_ADDRESS_PREFIX {
        return false;
    }

    /*
       After the variable-length network prefix,
       a standard Safex address contains:

       32-byte public spend key
       32-byte public view key

       decode_check() has already removed and
       verified the 4-byte checksum.
    */
    decoded.len() == prefix_length + 64
}

#[derive(serde::Serialize)]
struct DaemonCheckResult {
    valid: bool,
    height: Option<u64>,
    message: String,
}

#[tauri::command]
async fn validate_safex_daemon(
    daemon: String,
) -> DaemonCheckResult {
    let daemon = daemon.trim();

    if daemon.is_empty() {
        return DaemonCheckResult {
            valid: false,
            height: None,
            message: "Daemon address is empty.".to_string(),
        };
    }

    let mut base_url =
        if daemon.starts_with("http://")
            || daemon.starts_with("https://")
        {
            daemon.to_string()
        } else {
            format!("http://{daemon}")
        };

    while base_url.ends_with('/') {
        base_url.pop();
    }

    let url =
        if base_url.ends_with("/get_info") {
            base_url
        } else {
            format!("{base_url}/get_info")
        };

    let client =
        match reqwest::Client::builder()
            .timeout(
                std::time::Duration::from_secs(4)
            )
            .build()
        {
            Ok(client) => client,

            Err(_) => {
                return DaemonCheckResult {
                    valid: false,
                    height: None,
                    message:
                        "Unable to create daemon connection."
                            .to_string(),
                };
            }
        };

    let response =
        match client.get(&url).send().await {
            Ok(response) => response,

            Err(_) => {
                return DaemonCheckResult {
                    valid: false,
                    height: None,
                    message:
                        "Daemon unavailable.".to_string(),
                };
            }
        };

    if !response.status().is_success() {
        return DaemonCheckResult {
            valid: false,
            height: None,
            message: format!(
                "Daemon returned HTTP {}.",
                response.status()
            ),
        };
    }

    let json: serde_json::Value =
        match response.json().await {
            Ok(json) => json,

            Err(_) => {
                return DaemonCheckResult {
                    valid: false,
                    height: None,
                    message:
                        "Invalid daemon response.".to_string(),
                };
            }
        };

    /*
       Safex /get_info normally returns these
       fields at the root. Supporting "result"
       as well makes the checker more tolerant.
    */
    let data =
        json.get("result").unwrap_or(&json);

    let height =
        data.get("height")
            .and_then(|value| {
                value.as_u64().or_else(|| {
                    value
                        .as_str()
                        .and_then(|text| {
                            text.parse::<u64>().ok()
                        })
                })
            });

    let status =
        data.get("status")
            .and_then(|value| value.as_str());

    if let Some(status) = status {
        if status != "OK" {
            return DaemonCheckResult {
                valid: false,
                height,
                message: format!(
                    "Daemon status: {status}"
                ),
            };
        }
    }

    let Some(height) = height else {
        return DaemonCheckResult {
            valid: false,
            height: None,
            message:
                "Response is not a valid Safex daemon."
                    .to_string(),
        };
    };

    DaemonCheckResult {
        valid: true,
        height: Some(height),
        message:
            "Safex daemon online.".to_string(),
    }
}

fn to_wide_null(
    value: &str,
) -> Vec<u16> {
    value
        .encode_utf16()
        .chain(std::iter::once(0))
        .collect()
}


fn launch_helper_with_arguments(
    helper_path: &PathBuf,
    parameters: &str,
) -> Result<(), String> {

    let helper_text =
        helper_path
            .to_str()
            .ok_or_else(|| {
                "Helper path contains invalid Unicode."
                    .to_string()
            })?;

    let verb =
        to_wide_null(
            "runas",
        );

    let file =
        to_wide_null(
            helper_text,
        );

    let parameters =
        to_wide_null(
            parameters,
        );

    let mut info:
        SHELLEXECUTEINFOW =
        unsafe {
            std::mem::zeroed()
        };

    info.cbSize =
        size_of::<SHELLEXECUTEINFOW>()
            as u32;

    info.fMask =
        SEE_MASK_NOCLOSEPROCESS;

    info.lpVerb =
        PCWSTR(
            verb.as_ptr(),
        );

    info.lpFile =
        PCWSTR(
            file.as_ptr(),
        );

    info.lpParameters =
        PCWSTR(
            parameters.as_ptr(),
        );

    info.nShow =
        SW_HIDE.0;


    unsafe {

        ShellExecuteExW(
            &mut info,
        )
        .map_err(|error| {
            format!(
                "Unable to launch elevated helper. \
                 The UAC request may have been cancelled. \
                 Error: {error}"
            )
        })?;


        /*
           For this handshake test we don't
           need to retain the process handle.

           The named pipe tells us whether
           the helper actually connected.
        */
        if !info.hProcess.is_invalid() {

            let _ =
                CloseHandle(
                    info.hProcess,
                );
        }
    }


    Ok(())
}

fn current_user_sid_string()
    -> Result<String, String>
{
    unsafe {

        let mut token =
            windows::Win32::Foundation::HANDLE::default();

        OpenProcessToken(
            GetCurrentProcess(),
            TOKEN_QUERY,
            &mut token,
        )
        .map_err(|error| {
            format!(
                "Unable to open current-user token: {error}"
            )
        })?;


        /*
           First call asks Windows how large
           the TOKEN_USER buffer must be.
        */
        let mut required =
            0u32;

        let _ =
            GetTokenInformation(
                token,
                TokenUser,
                None,
                0,
                &mut required,
            );


        if required == 0 {

            let _ =
                CloseHandle(
                    token,
                );

            return Err(
                "Windows returned no user-token size."
                    .to_string()
            );
        }


        let mut buffer =
            vec![
                0u8;
                required as usize
            ];


        let info_result =
            GetTokenInformation(
                token,
                TokenUser,
                Some(
                    buffer
                        .as_mut_ptr()
                        .cast(),
                ),
                required,
                &mut required,
            );


        let _ =
            CloseHandle(
                token,
            );


        info_result
            .map_err(|error| {
                format!(
                    "Unable to read current-user token: {error}"
                )
            })?;


        /*
           TOKEN_USER begins at the start of
           the returned buffer.

           read_unaligned avoids making any
           unnecessary Rust alignment
           assumption about that byte buffer.
        */
        let token_user =
            std::ptr::read_unaligned(
                buffer.as_ptr()
                    as *const TOKEN_USER,
            );


        let mut sid_text =
            PWSTR::default();


        ConvertSidToStringSidW(
            token_user.User.Sid,
            &mut sid_text,
        )
        .map_err(|error| {
            format!(
                "Unable to convert current-user SID: {error}"
            )
        })?;


        let sid_result =
            sid_text
                .to_string()
                .map_err(|error| {
                    format!(
                        "Unable to read current-user SID: {error}"
                    )
                });


        /*
           ConvertSidToStringSidW allocated
           this string with LocalAlloc.
        */
        let _ =
            LocalFree(
                Some(
                    HLOCAL(
                        sid_text
                            .0
                            .cast(),
                    ),
                ),
            );


        sid_result
    }
}

fn create_user_locked_pipe(
    pipe_name: &str,
) -> Result<
    tokio::net::windows::named_pipe::NamedPipeServer,
    String,
> {

    let user_sid =
        current_user_sid_string()?;


    /*
       D:P
         = protected DACL; do not inherit
           broader permissions.

       First ACE:
         full access for the user who
         launched The Safex Mine.

       Second ACE:
         full access for local
         Administrators, allowing a helper
         elevated using alternate admin
         credentials.

       The random handshake token remains
       the application-level authentication.
    */
    let sddl =
        format!(
            "D:P(A;;GA;;;{user_sid})(A;;GA;;;BA)"
        );


    let sddl_wide =
        to_wide_null(
            &sddl,
        );


    let mut descriptor =
        PSECURITY_DESCRIPTOR::default();


    unsafe {

        ConvertStringSecurityDescriptorToSecurityDescriptorW(
            PCWSTR(
                sddl_wide.as_ptr(),
            ),
            SDDL_REVISION_1,
            &mut descriptor,
            None,
        )
        .map_err(|error| {
            format!(
                "Unable to build named-pipe security descriptor: {error}"
            )
        })?;
    }


    let mut attributes =
        SECURITY_ATTRIBUTES {
            nLength:
                size_of::<SECURITY_ATTRIBUTES>()
                    as u32,

            lpSecurityDescriptor:
                descriptor.0,

            bInheritHandle:
                false.into(),
        };


    let mut options =
        ServerOptions::new();

    options
        .first_pipe_instance(
            true,
        )
        .reject_remote_clients(
            true,
        );


    /*
       Tokio passes this SECURITY_ATTRIBUTES
       object directly to CreateNamedPipe.

       Windows copies the descriptor while
       creating the pipe, so we can free our
       allocated descriptor immediately
       afterwards.
    */
    let create_result =
        unsafe {
            options
                .create_with_security_attributes_raw(
                    pipe_name,
                    (
                        &mut attributes
                            as *mut SECURITY_ATTRIBUTES
                    )
                    .cast(),
                )
        };


    unsafe {

        let _ =
            LocalFree(
                Some(
                    HLOCAL(
                        descriptor
                            .0
                            .cast(),
                    ),
                ),
            );
    }


    create_result
        .map_err(|error| {
            format!(
                "Unable to create secured Safex Mine pipe: {error}"
            )
        })
}

async fn helper_send_command(
    session: &mut HelperSession,
    command: &str,
) -> Result<String, String> {

    session
        .writer
        .write_all(
            format!(
                "{command}\n"
            )
            .as_bytes(),
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to send helper command: {error}"
            )
        })?;


    session
        .writer
        .flush()
        .await
        .map_err(|error| {
            format!(
                "Unable to flush helper command: {error}"
            )
        })?;


    let mut response =
        String::new();


    let count =
        timeout(
            Duration::from_secs(
                15,
            ),
            session
                .reader
                .read_line(
                    &mut response,
                ),
        )
        .await
        .map_err(|_| {
            "Timed out waiting for elevated helper."
                .to_string()
        })?
        .map_err(|error| {
            format!(
                "Unable to read helper response: {error}"
            )
        })?;


    if count == 0 {

        return Err(
            "Elevated helper disconnected."
                .to_string()
        );
    }


    Ok(
        response
            .trim()
            .to_string()
    )
}


#[tauri::command]
async fn start_helper_session(
    app: tauri::AppHandle,
    state:
        State<
            '_,
            HelperSessionState
        >,
) -> Result<String, String> {

    let mut session_guard =
        state
            .session
            .lock()
            .await;


    /*
       Important UX behaviour:
       once UAC has been approved, reuse
       the existing elevated helper.
    */
    if session_guard.is_some() {

        return Ok(
            "Elevated helper is already connected."
                .to_string()
        );
    }


    let helper_path =
        safex_helper_path(
            &app,
        )?;


    let pipe_id =
        Uuid::new_v4()
            .simple()
            .to_string();

    let token =
        Uuid::new_v4()
            .simple()
            .to_string();


    let pipe_name =
        format!(
            r"\\.\pipe\safex-mine-{pipe_id}"
        );


    /*
       Uses the Stage 3.5 secured pipe:
       local-only + explicit DACL.
    */
    let server =
        create_user_locked_pipe(
            &pipe_name,
        )?;


    let parameters =
        format!(
            "--pipe \"{pipe_name}\" --token \"{token}\" --persistent"
        );


    launch_helper_with_arguments(
        &helper_path,
        &parameters,
    )?;


    timeout(
        Duration::from_secs(
            60,
        ),
        server.connect(),
    )
    .await
    .map_err(|_| {
        "Timed out waiting for Administrator approval."
            .to_string()
    })?
    .map_err(|error| {
        format!(
            "Elevated helper could not connect: {error}"
        )
    })?;


    let (
        reader,
        mut writer,
    ) =
        tokio::io::split(
            server,
        );


    let mut reader =
        TokioBufReader::new(
            reader,
        );


    let mut hello =
        String::new();


    let hello_count =
        timeout(
            Duration::from_secs(
                5,
            ),
            reader.read_line(
                &mut hello,
            ),
        )
        .await
        .map_err(|_| {
            "Timed out waiting for helper handshake."
                .to_string()
        })?
        .map_err(|error| {
            format!(
                "Unable to read helper handshake: {error}"
            )
        })?;


    if hello_count == 0 {

        return Err(
            "Elevated helper disconnected during handshake."
                .to_string()
        );
    }


    let expected_hello =
        format!(
            "HELLO {token}"
        );


    if hello.trim()
        != expected_hello
    {
        return Err(
            "Elevated helper handshake token was invalid."
                .to_string()
        );
    }


    writer
        .write_all(
            b"SESSION\n",
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to start helper session: {error}"
            )
        })?;


    writer
        .flush()
        .await
        .map_err(|error| {
            format!(
                "Unable to flush helper session command: {error}"
            )
        })?;


    let mut ready =
        String::new();


    timeout(
        Duration::from_secs(
            5,
        ),
        reader.read_line(
            &mut ready,
        ),
    )
    .await
    .map_err(|_| {
        "Timed out waiting for helper session acknowledgement."
            .to_string()
    })?
    .map_err(|error| {
        format!(
            "Unable to read helper session acknowledgement: {error}"
        )
    })?;


    if ready.trim()
        != "SESSION READY ELEVATED"
    {
        return Err(
            format!(
                "Unexpected helper session response: {}",
                ready.trim()
            ),
        );
    }


    *session_guard =
        Some(
            HelperSession {
                reader,
                writer,
            },
        );


    Ok(
        "Persistent elevated helper connected."
            .to_string()
    )
}


#[tauri::command]
async fn start_xmrig_test(
    address: String,
    daemon: String,
    mode: String,
    state:
        State<
            '_,
            HelperSessionState
        >,
) -> Result<String, String> {

    let address =
        address.trim();

    let daemon =
        daemon.trim();

    let profile =
    match mode.as_str() {
        "Calm" =>
            "calm",

        "Balanced" =>
            "balanced",

        "Full Bore" =>
            "full",

        _ => {
            return Err(
                "Invalid mining mode."
                    .to_string()
            );
        }
    };

    if address.is_empty() {
        return Err(
            "Safex Address is empty."
                .to_string()
        );
    }


    if daemon.is_empty() {
        return Err(
            "Safex daemon is empty."
                .to_string()
        );
    }


    let mut guard =
        state
            .session
            .lock()
            .await;


    let session =
        guard
            .as_mut()
            .ok_or_else(|| {
                "Elevated helper is not connected."
                    .to_string()
            })?;


    let command =
        format!(
            "START {address} {daemon} {profile}"
        );


    helper_send_command(
        session,
        &command,
    )
    .await
}


#[tauri::command]
async fn xmrig_test_status(
    state:
        State<
            '_,
            HelperSessionState
        >,
) -> Result<String, String> {

    let mut guard =
        state
            .session
            .lock()
            .await;


let result = {

    let session =
        guard
            .as_mut()
            .ok_or_else(|| {
                "Elevated helper is not connected."
                    .to_string()
            })?;


    helper_send_command(
        session,
        "STATUS",
    )
    .await
};


if result.is_err() {

    /*
    The persistent helper connection is
    no longer usable. Discard it so the
    next Start can create a fresh elevated
    helper session.
    */
    *guard =
        None;
}


result
}


#[tauri::command]
async fn stop_xmrig_test(
    state:
        State<
            '_,
            HelperSessionState
        >,
) -> Result<String, String> {

    let mut guard =
        state
            .session
            .lock()
            .await;


    let session =
        guard
            .as_mut()
            .ok_or_else(|| {
                "Elevated helper is not connected."
                    .to_string()
            })?;


    helper_send_command(
        session,
        "STOP",
    )
    .await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(HelperSessionState::default())
        .invoke_handler(
            tauri::generate_handler![
                backend_probe,
                validate_safex_address,
                validate_safex_daemon,
                start_helper_session,
                start_xmrig_test,
                xmrig_test_status,
                stop_xmrig_test,
            ],
        )
        .run(tauri::generate_context!())
        .expect(
            "error while running The Safex Mine"
        );
}
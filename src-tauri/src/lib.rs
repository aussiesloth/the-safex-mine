use std::{
    io::{BufRead, BufReader},
    time::Duration,
    mem::size_of,
    path::PathBuf,
    process::{Child, Command, Stdio},
    sync::Mutex,
    thread,
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
            WAIT_OBJECT_0,
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
            GetExitCodeProcess,
            WaitForSingleObject,
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
                SW_SHOWNORMAL,
            },
        },
    },
};

use tauri::{Emitter, State};

struct ProcessState {
    child: Mutex<Option<Child>>,
}

impl Default for ProcessState {
    fn default() -> Self {
        Self {
            child: Mutex::new(None),
        }
    }
}

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

#[tauri::command]
fn backend_probe() -> String {
    format!(
        "Rust backend connected — v{}",
        env!("CARGO_PKG_VERSION")
    )
}

#[tauri::command]
fn start_test_process(
    app: tauri::AppHandle,
    state: State<ProcessState>,
) -> Result<String, String> {
    let mut guard = state
        .child
        .lock()
        .map_err(|_| "Process state lock failed.".to_string())?;

    if let Some(child) = guard.as_mut() {
        match child.try_wait() {
            Ok(None) => {
                return Err(
                    "Test process is already running.".to_string(),
                );
            }

            Ok(Some(_)) => {
                *guard = None;
            }

            Err(error) => {
                return Err(format!(
                    "Unable to check process state: {error}"
                ));
            }
        }
    }

    let mut child = Command::new("ping.exe")
        .args([
            "127.0.0.1",
            "-t",
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| {
            format!(
                "Unable to start test process: {error}"
            )
        })?;

    if let Some(stdout) = child.stdout.take() {
        let app_handle = app.clone();

        thread::spawn(move || {
            let reader = BufReader::new(stdout);

            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        let _ = app_handle.emit(
                            "test-process-output",
                            line,
                        );
                    }

                    Err(_) => break,
                }
            }
        });
    }

    if let Some(stderr) = child.stderr.take() {
        let app_handle = app.clone();

        thread::spawn(move || {
            let reader = BufReader::new(stderr);

            for line in reader.lines() {
                match line {
                    Ok(line) => {
                        let _ = app_handle.emit(
                            "test-process-error",
                            line,
                        );
                    }

                    Err(_) => break,
                }
            }
        });
    }

    *guard = Some(child);

    Ok(
        "Test process started.".to_string()
    )
}

#[tauri::command]
fn stop_test_process(
    state: State<ProcessState>,
) -> Result<String, String> {
    let mut guard = state
        .child
        .lock()
        .map_err(|_| "Process state lock failed.".to_string())?;

    let Some(mut child) = guard.take() else {
        return Ok(
            "Test process is not running.".to_string()
        );
    };

    match child.try_wait() {
        Ok(Some(_)) => {
            return Ok(
                "Test process had already exited.".to_string()
            );
        }

        Ok(None) => {}

        Err(error) => {
            return Err(format!(
                "Unable to check test process: {error}"
            ));
        }
    }

    child
        .kill()
        .map_err(|error| {
            format!(
                "Unable to stop test process: {error}"
            )
        })?;

    let _ = child.wait();

    Ok(
        "Test process stopped.".to_string()
    )
}

#[tauri::command]
fn test_process_running(
    state: State<ProcessState>,
) -> Result<bool, String> {
    let mut guard = state
        .child
        .lock()
        .map_err(|_| "Process state lock failed.".to_string())?;

    let Some(child) = guard.as_mut() else {
        return Ok(false);
    };

    match child.try_wait() {
        Ok(None) => Ok(true),

        Ok(Some(_)) => {
            *guard = None;
            Ok(false)
        }

        Err(error) => Err(format!(
            "Unable to check test process: {error}"
        )),
    }
}

#[tauri::command]
fn safex_xmrig_version() -> Result<String, String> {
    let binary_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("binaries")
        .join("safex-xmrig-x86_64-pc-windows-msvc.exe");

    if !binary_path.exists() {
        return Err(format!(
            "Safex XMRig binary not found: {}",
            binary_path.display()
        ));
    }

    let output = Command::new(&binary_path)
        .arg("--version")
        .output()
        .map_err(|error| {
            format!(
                "Unable to run Safex XMRig: {error}"
            )
        })?;

    if !output.status.success() {
        return Err(format!(
            "Safex XMRig exited with status: {}",
            output.status
        ));
    }

    let stdout =
        String::from_utf8_lossy(&output.stdout);

    Ok(stdout.trim().to_string())
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


fn launch_helper_probe_blocking(
    helper_path: PathBuf,
) -> Result<String, String> {

    let helper_text =
        helper_path
            .to_str()
            .ok_or_else(|| {
                "Helper path contains invalid Unicode."
                    .to_string()
            })?;

    let verb =
        to_wide_null("runas");

    let file =
        to_wide_null(helper_text);

    /*
       SAFETY:
       SHELLEXECUTEINFOW is a plain Win32
       structure. Zero initialization is the
       normal starting state before filling
       the required fields.
    */
    let mut info: SHELLEXECUTEINFOW =
        unsafe {
            std::mem::zeroed()
        };

    info.cbSize =
        size_of::<SHELLEXECUTEINFOW>()
            as u32;

    info.fMask =
        SEE_MASK_NOCLOSEPROCESS;

    info.lpVerb =
        PCWSTR(verb.as_ptr());

    info.lpFile =
        PCWSTR(file.as_ptr());

    info.nShow =
        SW_SHOWNORMAL.0;


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


        if info.hProcess.is_invalid() {

            return Err(
                "Windows did not return a helper process handle."
                    .to_string()
            );
        }


        let wait_result =
            WaitForSingleObject(
                info.hProcess,
                u32::MAX,
            );


        if wait_result != WAIT_OBJECT_0 {

            let _ =
                CloseHandle(
                    info.hProcess,
                );

            return Err(
                format!(
                    "Waiting for elevated helper failed: {:?}",
                    wait_result
                )
            );
        }


        let mut exit_code =
            0u32;

        let exit_result =
            GetExitCodeProcess(
                info.hProcess,
                &mut exit_code,
            );


        let _ =
            CloseHandle(
                info.hProcess,
            );


        exit_result
            .map_err(|error| {
                format!(
                    "Unable to read helper exit code: {error}"
                )
            })?;


        match exit_code {

            0 => Ok(
                "Elevated helper completed successfully."
                    .to_string()
            ),

            2 => Err(
                "Helper started but was not elevated."
                    .to_string()
            ),

            3 => Err(
                "Helper could not determine its elevation state."
                    .to_string()
            ),

            code => Err(
                format!(
                    "Elevated helper exited with code {code}."
                )
            ),
        }
    }
}


#[tauri::command]
async fn launch_helper_probe()
    -> Result<String, String>
{
    /*
       Development location only.

       Later this changes to the packaged
       sidecar/helper location.
    */
    let helper_path =
        PathBuf::from(
            env!("CARGO_MANIFEST_DIR"),
        )
        .join("helper")
        .join("target")
        .join("release")
        .join("safex-mine-helper.exe");


    if !helper_path.exists() {

        return Err(
            format!(
                "Safex Mine helper not found: {}",
                helper_path.display()
            )
        );
    }


    tauri::async_runtime::spawn_blocking(
        move || {
            launch_helper_probe_blocking(
                helper_path,
            )
        },
    )
    .await
    .map_err(|error| {
        format!(
            "Helper launch task failed: {error}"
        )
    })?
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

#[tauri::command]
async fn test_secure_helper_pipe()
    -> Result<String, String>
{
    let helper_path =
        PathBuf::from(
            env!("CARGO_MANIFEST_DIR"),
        )
        .join("helper")
        .join("target")
        .join("release")
        .join(
            "safex-mine-helper.exe",
        );


    if !helper_path.exists() {

        return Err(
            format!(
                "Safex Mine helper not found: {}",
                helper_path.display()
            ),
        );
    }


    /*
       Both values are different on every
       probe/app invocation.
    */
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
       Create the pipe BEFORE asking Windows
       to launch the elevated helper.

       first_pipe_instance prevents another
       process from pre-creating the same
       pipe name.

       reject_remote_clients keeps this
       strictly local to this PC.
    */
    let server =
    create_user_locked_pipe(
        &pipe_name,
    )?;


    let parameters =
        format!(
            "--pipe \"{pipe_name}\" --token \"{token}\""
        );


    launch_helper_with_arguments(
        &helper_path,
        &parameters,
    )?;


    /*
       UAC may remain open for a while while
       the user reads it, so give them a
       reasonable period to approve it.
    */
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
            "Elevated helper could not connect to the pipe: {error}"
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


    /*
       Verify the helper knows the random
       token passed through the UAC launch.
    */
    let mut hello =
        String::new();


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
            b"PING\n",
        )
        .await
        .map_err(|error| {
            format!(
                "Unable to send helper PING: {error}"
            )
        })?;


    writer
        .flush()
        .await
        .map_err(|error| {
            format!(
                "Unable to flush helper PING: {error}"
            )
        })?;


    let mut response =
        String::new();


    timeout(
        Duration::from_secs(
            5,
        ),
        reader.read_line(
            &mut response,
        ),
    )
    .await
    .map_err(|_| {
        "Timed out waiting for helper PONG."
            .to_string()
    })?
    .map_err(|error| {
        format!(
            "Unable to read helper response: {error}"
        )
    })?;


    if response.trim()
        != "PONG ELEVATED"
    {
        return Err(
            format!(
                "Unexpected helper response: {}",
                response.trim()
            ),
        );
    }


    Ok(
        "Elevated helper connected securely."
            .to_string()
    )
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
        PathBuf::from(
            env!(
                "CARGO_MANIFEST_DIR"
            ),
        )
        .join("helper")
        .join("target")
        .join("release")
        .join(
            "safex-mine-helper.exe",
        );


    if !helper_path.exists() {

        return Err(
            format!(
                "Safex Mine helper not found: {}",
                helper_path.display()
            ),
        );
    }


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
async fn test_helper_commands(
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


    let result:
        Result<String, String> =
        async {

            let session =
                guard
                    .as_mut()
                    .ok_or_else(|| {
                        "Elevated helper is not connected."
                            .to_string()
                    })?;


            let status =
                helper_send_command(
                    session,
                    "STATUS",
                )
                .await?;


            Ok(
                format!(
                    "Helper command channel OK | {status}"
                )
            )
        }
        .await;


    if result.is_err() {
        *guard = None;
    }


    result
}

#[tauri::command]
async fn start_xmrig_test(
    address: String,
    daemon: String,
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
            "START {address} {daemon}"
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

#[tauri::command]
async fn shutdown_helper_session(
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


    let Some(
        mut session
    ) =
        guard.take()
    else {

        return Ok(
            "Elevated helper is not running."
                .to_string()
        );
    };


    let response =
        helper_send_command(
            &mut session,
            "SHUTDOWN",
        )
        .await?;


    Ok(
        format!(
            "Helper shutdown acknowledged: {response}"
        )
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(ProcessState::default())
        .manage(HelperSessionState::default())
        .invoke_handler(
            tauri::generate_handler![
                backend_probe,
                start_test_process,
                stop_test_process,
                test_process_running,
                safex_xmrig_version,
                validate_safex_address,
                validate_safex_daemon,
                launch_helper_probe,
                test_secure_helper_pipe,
                start_helper_session,
                test_helper_commands,
                shutdown_helper_session,
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
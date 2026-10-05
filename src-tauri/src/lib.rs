use std::{mem::size_of, path::PathBuf, time::Duration};

use tokio::{
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader as TokioBufReader, ReadHalf, WriteHalf},
    net::windows::named_pipe::{NamedPipeServer, ServerOptions},
    sync::Mutex as AsyncMutex,
    time::timeout,
};

use uuid::Uuid;

use windows::{
    core::{PCWSTR, PWSTR},
    Win32::{
        Foundation::{CloseHandle, LocalFree, HLOCAL},
        Globalization::{GetUserPreferredUILanguages, MUI_LANGUAGE_NAME},
        Security::{
            Authorization::{
                ConvertSidToStringSidW, ConvertStringSecurityDescriptorToSecurityDescriptorW,
                SDDL_REVISION_1,
            },
            GetTokenInformation, TokenUser, PSECURITY_DESCRIPTOR, SECURITY_ATTRIBUTES, TOKEN_QUERY,
            TOKEN_USER,
        },
        System::Threading::{GetCurrentProcess, OpenProcessToken},
        UI::{
            Shell::{ShellExecuteExW, SEE_MASK_NOCLOSEPROCESS, SHELLEXECUTEINFOW},
            WindowsAndMessaging::SW_HIDE,
        },
    },
};

use tauri::{path::BaseDirectory, Manager, State};

type HelperPipeReader = TokioBufReader<ReadHalf<NamedPipeServer>>;

type HelperPipeWriter = WriteHalf<NamedPipeServer>;

struct HelperSession {
    reader: HelperPipeReader,
    writer: HelperPipeWriter,
}

struct HelperSessionState {
    session: AsyncMutex<Option<HelperSession>>,
}

impl Default for HelperSessionState {
    fn default() -> Self {
        Self {
            session: AsyncMutex::new(None),
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct BackendError {
    code: String,
    detail: Option<String>,
}

impl BackendError {
    fn new(code: &str) -> Self {
        Self {
            code: code.to_string(),
            detail: None,
        }
    }

    fn with_detail(code: &str, detail: impl Into<String>) -> Self {
        Self {
            code: code.to_string(),
            detail: Some(detail.into()),
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct BackendStatus {
    code: &'static str,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct BackendProbeResult {
    code: &'static str,
    version: &'static str,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct StartMiningResult {
    status: &'static str,
    msr_available: bool,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct StopMiningResult {
    forced: bool,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct WindowsLocaleSelection {
    preferred_languages: Vec<String>,
    matched_locale: Option<String>,
}

fn normalise_locale_id(value: &str) -> String {
    let mut parts = value
        .trim()
        .replace('_', "-")
        .split('-')
        .filter(|part| !part.is_empty())
        .map(str::to_string)
        .collect::<Vec<_>>();

    if parts.is_empty() {
        return String::new();
    }

    parts[0] = parts[0].to_ascii_lowercase();

    for part in parts.iter_mut().skip(1) {
        if part.len() == 4
            && part
                .chars()
                .all(|character| character.is_ascii_alphabetic())
        {
            let lower = part.to_ascii_lowercase();
            let mut characters = lower.chars();
            if let Some(first) = characters.next() {
                *part = first.to_ascii_uppercase().to_string() + characters.as_str();
            }
        } else if (part.len() == 2
            && part
                .chars()
                .all(|character| character.is_ascii_alphabetic()))
            || (part.len() == 3 && part.chars().all(|character| character.is_ascii_digit()))
        {
            *part = part.to_ascii_uppercase();
        }
    }

    parts.join("-")
}

fn locale_language(locale_id: &str) -> &str {
    locale_id.split('-').next().unwrap_or(locale_id)
}

fn locale_script(locale_id: &str) -> Option<&str> {
    locale_id.split('-').skip(1).find(|part| {
        part.len() == 4
            && part
                .chars()
                .all(|character| character.is_ascii_alphabetic())
    })
}

fn locale_region(locale_id: &str) -> Option<&str> {
    locale_id.split('-').skip(1).find(|part| {
        (part.len() == 2
            && part
                .chars()
                .all(|character| character.is_ascii_alphabetic()))
            || (part.len() == 3 && part.chars().all(|character| character.is_ascii_digit()))
    })
}

fn find_supported_locale(supported_locales: &[String], target: &str) -> Option<String> {
    supported_locales
        .iter()
        .find(|locale| locale.eq_ignore_ascii_case(target))
        .cloned()
}

fn match_preferred_locale(
    preferred_languages: &[String],
    supported_locales: &[String],
) -> Option<String> {
    let normalised_supported = supported_locales
        .iter()
        .map(|locale| normalise_locale_id(locale))
        .filter(|locale| !locale.is_empty())
        .collect::<Vec<_>>();

    for preferred in preferred_languages {
        let preferred = normalise_locale_id(preferred);

        if preferred.is_empty() {
            continue;
        }

        if let Some(exact) = find_supported_locale(&normalised_supported, &preferred) {
            return supported_locales
                .iter()
                .find(|locale| locale.eq_ignore_ascii_case(&exact))
                .cloned();
        }

        let language = locale_language(&preferred);
        let script = locale_script(&preferred);
        let region = locale_region(&preferred);

        let preferred_special = match language {
            "zh" => {
                if script == Some("Hant") || matches!(region, Some("TW") | Some("HK") | Some("MO"))
                {
                    Some("zh-Hant")
                } else if script == Some("Hans") || matches!(region, Some("CN") | Some("SG")) {
                    Some("zh-Hans")
                } else {
                    Some("zh-Hans")
                }
            }
            "pt" => {
                if region == Some("BR") {
                    Some("pt-BR")
                } else {
                    Some("pt-PT")
                }
            }
            "sr" => {
                if script == Some("Latn") {
                    Some("sr-Latn")
                } else {
                    Some("sr-Cyrl")
                }
            }
            _ => None,
        };

        if let Some(target) = preferred_special {
            if let Some(matched) = find_supported_locale(&normalised_supported, target) {
                return supported_locales
                    .iter()
                    .find(|locale| locale.eq_ignore_ascii_case(&matched))
                    .cloned();
            }
        }

        if let Some(base_match) = find_supported_locale(&normalised_supported, language) {
            return supported_locales
                .iter()
                .find(|locale| locale.eq_ignore_ascii_case(&base_match))
                .cloned();
        }

        let same_language = normalised_supported
            .iter()
            .filter(|locale| locale_language(locale) == language)
            .collect::<Vec<_>>();

        if same_language.len() == 1 {
            let matched = same_language[0];
            return supported_locales
                .iter()
                .find(|locale| locale.eq_ignore_ascii_case(matched))
                .cloned();
        }
    }

    None
}

fn parse_language_multisz(buffer: &[u16]) -> Vec<String> {
    buffer
        .split(|character| *character == 0)
        .filter(|slice| !slice.is_empty())
        .map(String::from_utf16_lossy)
        .collect()
}

fn user_preferred_ui_languages() -> Result<Vec<String>, BackendError> {
    let mut language_count = 0u32;
    let mut buffer_length = 0u32;

    unsafe {
        GetUserPreferredUILanguages(
            MUI_LANGUAGE_NAME,
            &mut language_count,
            None,
            &mut buffer_length,
        )
    }
    .map_err(|error| {
        BackendError::with_detail(
            "locale.windowsDetectionFailed",
            format!("Unable to query Windows UI language buffer size: {error}"),
        )
    })?;

    if buffer_length == 0 {
        return Ok(Vec::new());
    }

    let mut buffer = vec![0u16; buffer_length as usize];

    unsafe {
        GetUserPreferredUILanguages(
            MUI_LANGUAGE_NAME,
            &mut language_count,
            Some(PWSTR(buffer.as_mut_ptr())),
            &mut buffer_length,
        )
    }
    .map_err(|error| {
        BackendError::with_detail(
            "locale.windowsDetectionFailed",
            format!("Unable to read Windows preferred UI languages: {error}"),
        )
    })?;

    let used_length = usize::min(buffer_length as usize, buffer.len());
    Ok(parse_language_multisz(&buffer[..used_length]))
}

#[tauri::command]
fn windows_locale_selection(
    supported_locales: Vec<String>,
) -> Result<WindowsLocaleSelection, BackendError> {
    let preferred_languages = user_preferred_ui_languages()?;
    let matched_locale = match_preferred_locale(&preferred_languages, &supported_locales);

    Ok(WindowsLocaleSelection {
        preferred_languages,
        matched_locale,
    })
}

fn safex_helper_path(app: &tauri::AppHandle) -> Result<PathBuf, BackendError> {
    let packaged_path = app
        .path()
        .resolve("runtime/safex-mine-helper.exe", BaseDirectory::Resource);

    if let Ok(path) = &packaged_path {
        if path.exists() {
            return Ok(path.clone());
        }
    }

    let development_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("helper")
        .join("target")
        .join("release")
        .join("safex-mine-helper.exe");

    if development_path.exists() {
        return Ok(development_path);
    }

    match packaged_path {
        Ok(path) => Err(BackendError::with_detail(
            "helper.notFound",
            format!(
                "Checked packaged path {} and development path {}.",
                path.display(),
                development_path.display(),
            ),
        )),

        Err(error) => Err(BackendError::with_detail(
            "helper.notFound",
            format!(
                "Development path {} was not present; packaged resource resolution failed: {error}",
                development_path.display(),
            ),
        )),
    }
}

#[tauri::command]
fn backend_probe() -> BackendProbeResult {
    BackendProbeResult {
        code: "backend.connected",
        version: env!("CARGO_PKG_VERSION"),
    }
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

    let decoded = match base58_monero::decode_check(address) {
        Ok(decoded) => decoded,
        Err(_) => return false,
    };

    let (prefix, prefix_length) = match decode_varint(&decoded) {
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
#[serde(rename_all = "camelCase")]
struct DaemonCheckResult {
    valid: bool,
    height: Option<u64>,
    code: &'static str,
    detail: Option<String>,
}

#[tauri::command]
async fn validate_safex_daemon(daemon: String) -> DaemonCheckResult {
    let daemon = daemon.trim();

    if daemon.is_empty() {
        return DaemonCheckResult {
            valid: false,
            height: None,
            code: "daemon.empty",
            detail: None,
        };
    }

    let mut base_url = if daemon.starts_with("http://") || daemon.starts_with("https://") {
        daemon.to_string()
    } else {
        format!("http://{daemon}")
    };

    while base_url.ends_with('/') {
        base_url.pop();
    }

    let url = if base_url.ends_with("/get_info") {
        base_url
    } else {
        format!("{base_url}/get_info")
    };

    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(4))
        .build()
    {
        Ok(client) => client,

        Err(_) => {
            return DaemonCheckResult {
                valid: false,
                height: None,
                code: "daemon.connectionSetupFailed",
                detail: None,
            };
        }
    };

    let response = match client.get(&url).send().await {
        Ok(response) => response,

        Err(_) => {
            return DaemonCheckResult {
                valid: false,
                height: None,
                code: "daemon.unavailable",
                detail: None,
            };
        }
    };

    if !response.status().is_success() {
        return DaemonCheckResult {
            valid: false,
            height: None,
            code: "daemon.httpError",
            detail: Some(response.status().to_string()),
        };
    }

    let json: serde_json::Value = match response.json().await {
        Ok(json) => json,

        Err(_) => {
            return DaemonCheckResult {
                valid: false,
                height: None,
                code: "daemon.invalidResponse",
                detail: None,
            };
        }
    };

    /*
       Safex /get_info normally returns these
       fields at the root. Supporting "result"
       as well makes the checker more tolerant.
    */
    let data = json.get("result").unwrap_or(&json);

    let height = data.get("height").and_then(|value| {
        value
            .as_u64()
            .or_else(|| value.as_str().and_then(|text| text.parse::<u64>().ok()))
    });

    let status = data.get("status").and_then(|value| value.as_str());

    if let Some(status) = status {
        if status != "OK" {
            return DaemonCheckResult {
                valid: false,
                height,
                code: "daemon.statusError",
                detail: Some(status.to_string()),
            };
        }
    }

    let Some(height) = height else {
        return DaemonCheckResult {
            valid: false,
            height: None,
            code: "daemon.notSafex",
            detail: None,
        };
    };

    DaemonCheckResult {
        valid: true,
        height: Some(height),
        code: "daemon.online",
        detail: None,
    }
}

fn to_wide_null(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

fn launch_helper_with_arguments(
    helper_path: &PathBuf,
    parameters: &str,
) -> Result<(), BackendError> {
    let helper_text = helper_path
        .to_str()
        .ok_or_else(|| BackendError::new("helper.invalidPath"))?;

    let verb = to_wide_null("runas");

    let file = to_wide_null(helper_text);

    let parameters = to_wide_null(parameters);

    let mut info: SHELLEXECUTEINFOW = unsafe { std::mem::zeroed() };

    info.cbSize = size_of::<SHELLEXECUTEINFOW>() as u32;

    info.fMask = SEE_MASK_NOCLOSEPROCESS;

    info.lpVerb = PCWSTR(verb.as_ptr());

    info.lpFile = PCWSTR(file.as_ptr());

    info.lpParameters = PCWSTR(parameters.as_ptr());

    info.nShow = SW_HIDE.0;

    unsafe {
        ShellExecuteExW(&mut info)
            .map_err(|error| BackendError::with_detail("helper.launchFailed", error.to_string()))?;

        /*
           For this handshake test we don't
           need to retain the process handle.

           The named pipe tells us whether
           the helper actually connected.
        */
        if !info.hProcess.is_invalid() {
            let _ = CloseHandle(info.hProcess);
        }
    }

    Ok(())
}

fn current_user_sid_string() -> Result<String, BackendError> {
    unsafe {
        let mut token = windows::Win32::Foundation::HANDLE::default();

        OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token).map_err(|error| {
            BackendError::with_detail(
                "helper.securitySetupFailed",
                format!("Unable to open current-user token: {error}"),
            )
        })?;

        /*
           First call asks Windows how large
           the TOKEN_USER buffer must be.
        */
        let mut required = 0u32;

        let _ = GetTokenInformation(token, TokenUser, None, 0, &mut required);

        if required == 0 {
            let _ = CloseHandle(token);

            return Err(BackendError::with_detail(
                "helper.securitySetupFailed",
                "Windows returned no user-token size.",
            ));
        }

        let mut buffer = vec![0u8; required as usize];

        let info_result = GetTokenInformation(
            token,
            TokenUser,
            Some(buffer.as_mut_ptr().cast()),
            required,
            &mut required,
        );

        let _ = CloseHandle(token);

        info_result.map_err(|error| {
            BackendError::with_detail(
                "helper.securitySetupFailed",
                format!("Unable to read current-user token: {error}"),
            )
        })?;

        /*
           TOKEN_USER begins at the start of
           the returned buffer.

           read_unaligned avoids making any
           unnecessary Rust alignment
           assumption about that byte buffer.
        */
        let token_user = std::ptr::read_unaligned(buffer.as_ptr() as *const TOKEN_USER);

        let mut sid_text = PWSTR::default();

        ConvertSidToStringSidW(token_user.User.Sid, &mut sid_text).map_err(|error| {
            BackendError::with_detail(
                "helper.securitySetupFailed",
                format!("Unable to convert current-user SID: {error}"),
            )
        })?;

        let sid_result = sid_text.to_string().map_err(|error| {
            BackendError::with_detail(
                "helper.securitySetupFailed",
                format!("Unable to read current-user SID: {error}"),
            )
        });

        /*
           ConvertSidToStringSidW allocated
           this string with LocalAlloc.
        */
        let _ = LocalFree(Some(HLOCAL(sid_text.0.cast())));

        sid_result
    }
}

fn create_user_locked_pipe(
    pipe_name: &str,
) -> Result<tokio::net::windows::named_pipe::NamedPipeServer, BackendError> {
    let user_sid = current_user_sid_string()?;

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
    let sddl = format!("D:P(A;;GA;;;{user_sid})(A;;GA;;;BA)");

    let sddl_wide = to_wide_null(&sddl);

    let mut descriptor = PSECURITY_DESCRIPTOR::default();

    unsafe {
        ConvertStringSecurityDescriptorToSecurityDescriptorW(
            PCWSTR(sddl_wide.as_ptr()),
            SDDL_REVISION_1,
            &mut descriptor,
            None,
        )
        .map_err(|error| {
            BackendError::with_detail(
                "helper.securitySetupFailed",
                format!("Unable to build named-pipe security descriptor: {error}"),
            )
        })?;
    }

    let mut attributes = SECURITY_ATTRIBUTES {
        nLength: size_of::<SECURITY_ATTRIBUTES>() as u32,

        lpSecurityDescriptor: descriptor.0,

        bInheritHandle: false.into(),
    };

    let mut options = ServerOptions::new();

    options
        .first_pipe_instance(true)
        .reject_remote_clients(true);

    /*
       Tokio passes this SECURITY_ATTRIBUTES
       object directly to CreateNamedPipe.

       Windows copies the descriptor while
       creating the pipe, so we can free our
       allocated descriptor immediately
       afterwards.
    */
    let create_result = unsafe {
        options.create_with_security_attributes_raw(
            pipe_name,
            (&mut attributes as *mut SECURITY_ATTRIBUTES).cast(),
        )
    };

    unsafe {
        let _ = LocalFree(Some(HLOCAL(descriptor.0.cast())));
    }

    create_result.map_err(|error| {
        BackendError::with_detail(
            "helper.securitySetupFailed",
            format!("Unable to create secured Safex Mine pipe: {error}"),
        )
    })
}

async fn helper_send_command(
    session: &mut HelperSession,
    command: &str,
) -> Result<String, BackendError> {
    session
        .writer
        .write_all(format!("{command}\n").as_bytes())
        .await
        .map_err(|error| {
            BackendError::with_detail("helper.commandWriteFailed", error.to_string())
        })?;

    session.writer.flush().await.map_err(|error| {
        BackendError::with_detail("helper.commandFlushFailed", error.to_string())
    })?;

    let mut response = String::new();

    let count = timeout(
        Duration::from_secs(15),
        session.reader.read_line(&mut response),
    )
    .await
    .map_err(|_| BackendError::new("helper.responseTimedOut"))?
    .map_err(|error| BackendError::with_detail("helper.responseReadFailed", error.to_string()))?;

    if count == 0 {
        return Err(BackendError::new("helper.disconnected"));
    }

    Ok(response.trim().to_string())
}

#[tauri::command]
async fn start_helper_session(
    app: tauri::AppHandle,
    state: State<'_, HelperSessionState>,
) -> Result<BackendStatus, BackendError> {
    let mut session_guard = state.session.lock().await;

    /*
       Important UX behaviour:
       once UAC has been approved, reuse
       the existing elevated helper.
    */
    if session_guard.is_some() {
        return Ok(BackendStatus {
            code: "helper.alreadyConnected",
        });
    }

    let helper_path = safex_helper_path(&app)?;

    let pipe_id = Uuid::new_v4().simple().to_string();

    let token = Uuid::new_v4().simple().to_string();

    let pipe_name = format!(r"\\.\pipe\safex-mine-{pipe_id}");

    /*
       Uses the Stage 3.5 secured pipe:
       local-only + explicit DACL.
    */
    let server = create_user_locked_pipe(&pipe_name)?;

    let parameters = format!("--pipe \"{pipe_name}\" --token \"{token}\" --persistent");

    launch_helper_with_arguments(&helper_path, &parameters)?;

    timeout(Duration::from_secs(60), server.connect())
        .await
        .map_err(|_| BackendError::new("helper.approvalTimedOut"))?
        .map_err(|error| BackendError::with_detail("helper.connectFailed", error.to_string()))?;

    let (reader, mut writer) = tokio::io::split(server);

    let mut reader = TokioBufReader::new(reader);

    let mut hello = String::new();

    let hello_count = timeout(Duration::from_secs(5), reader.read_line(&mut hello))
        .await
        .map_err(|_| BackendError::new("helper.handshakeTimedOut"))?
        .map_err(|error| BackendError::with_detail("helper.handshakeFailed", error.to_string()))?;

    if hello_count == 0 {
        return Err(BackendError::new("helper.handshakeDisconnected"));
    }

    let expected_hello = format!("HELLO {token}");

    if hello.trim() != expected_hello {
        return Err(BackendError::new("helper.handshakeInvalid"));
    }

    writer.write_all(b"SESSION\n").await.map_err(|error| {
        BackendError::with_detail("helper.sessionStartFailed", error.to_string())
    })?;

    writer.flush().await.map_err(|error| {
        BackendError::with_detail("helper.sessionStartFailed", error.to_string())
    })?;

    let mut ready = String::new();

    timeout(Duration::from_secs(5), reader.read_line(&mut ready))
        .await
        .map_err(|_| BackendError::new("helper.sessionAckTimedOut"))?
        .map_err(|error| BackendError::with_detail("helper.sessionAckFailed", error.to_string()))?;

    if ready.trim() != "SESSION READY ELEVATED" {
        return Err(BackendError::with_detail(
            "helper.sessionUnexpected",
            ready.trim(),
        ));
    }

    *session_guard = Some(HelperSession { reader, writer });

    Ok(BackendStatus {
        code: "helper.connected",
    })
}

fn parse_start_response(response: &str) -> Result<StartMiningResult, BackendError> {
    if response.starts_with("OK STARTED_DEGRADED") {
        return Ok(StartMiningResult {
            status: "started",
            msr_available: false,
        });
    }

    if response.starts_with("OK STARTED") {
        return Ok(StartMiningResult {
            status: "started",
            msr_available: true,
        });
    }

    if response.starts_with("OK ALREADY_ACTIVE") {
        return Ok(StartMiningResult {
            status: "alreadyActive",
            msr_available: true,
        });
    }

    if let Some(detail) = response.strip_prefix("ERR ") {
        return Err(BackendError::with_detail(
            "mining.helperCommandFailed",
            detail,
        ));
    }

    Err(BackendError::with_detail(
        "mining.helperUnexpectedResponse",
        response,
    ))
}

fn parse_stop_response(response: &str) -> Result<StopMiningResult, BackendError> {
    if response.starts_with("OK STOPPED_FORCED") {
        return Ok(StopMiningResult { forced: true });
    }

    if response.starts_with("OK STOPPED_GRACEFULLY")
        || response.starts_with("OK ALREADY_EXITED")
        || response.starts_with("OK ALREADY_STOPPED")
    {
        return Ok(StopMiningResult { forced: false });
    }

    if let Some(detail) = response.strip_prefix("ERR ") {
        return Err(BackendError::with_detail(
            "mining.helperCommandFailed",
            detail,
        ));
    }

    Err(BackendError::with_detail(
        "mining.helperUnexpectedResponse",
        response,
    ))
}

#[tauri::command]
async fn start_xmrig_test(
    address: String,
    daemon: String,
    mode: String,
    state: State<'_, HelperSessionState>,
) -> Result<StartMiningResult, BackendError> {
    let address = address.trim();

    let daemon = daemon.trim();

    let profile = match mode.as_str() {
        "Calm" => "calm",

        "Balanced" => "balanced",

        "Full Bore" => "full",

        _ => {
            return Err(BackendError::new("mining.invalidMode"));
        }
    };

    if address.is_empty() {
        return Err(BackendError::new("mining.addressEmpty"));
    }

    if daemon.is_empty() {
        return Err(BackendError::new("mining.daemonEmpty"));
    }

    let mut guard = state.session.lock().await;

    let session = guard
        .as_mut()
        .ok_or_else(|| BackendError::new("helper.notConnected"))?;

    let command = format!("START {address} {daemon} {profile}");

    let response = helper_send_command(session, &command).await?;

    parse_start_response(&response)
}

#[tauri::command]
async fn xmrig_test_status(state: State<'_, HelperSessionState>) -> Result<String, BackendError> {
    let mut guard = state.session.lock().await;

    let result = {
        let session = guard
            .as_mut()
            .ok_or_else(|| BackendError::new("helper.notConnected"))?;

        helper_send_command(session, "STATUS").await
    };

    if result.is_err() {
        /*
        The persistent helper connection is
        no longer usable. Discard it so the
        next Start can create a fresh elevated
        helper session.
        */
        *guard = None;
    }

    result
}

#[tauri::command]
async fn stop_xmrig_test(
    state: State<'_, HelperSessionState>,
) -> Result<StopMiningResult, BackendError> {
    let mut guard = state.session.lock().await;

    let session = guard
        .as_mut()
        .ok_or_else(|| BackendError::new("helper.notConnected"))?;

    let response = helper_send_command(session, "STOP").await?;

    parse_stop_response(&response)
}

#[cfg(test)]
mod tests {
    use super::{
        match_preferred_locale, parse_language_multisz, parse_start_response, parse_stop_response,
    };

    #[test]
    fn locale_multisz_parser_preserves_windows_preference_order() {
        let buffer = "de-DE\0es-MX\0\0".encode_utf16().collect::<Vec<_>>();
        assert_eq!(
            parse_language_multisz(&buffer),
            vec!["de-DE".to_string(), "es-MX".to_string()]
        );
    }

    #[test]
    fn locale_matcher_handles_future_regional_and_script_mappings() {
        let supported = vec![
            "en-AU".to_string(),
            "es".to_string(),
            "pt-BR".to_string(),
            "pt-PT".to_string(),
            "zh-Hans".to_string(),
            "zh-Hant".to_string(),
            "sr-Cyrl".to_string(),
            "sr-Latn".to_string(),
        ];

        assert_eq!(
            match_preferred_locale(&["es-MX".to_string()], &supported).as_deref(),
            Some("es")
        );
        assert_eq!(
            match_preferred_locale(&["pt-BR".to_string()], &supported).as_deref(),
            Some("pt-BR")
        );
        assert_eq!(
            match_preferred_locale(&["pt-PT".to_string()], &supported).as_deref(),
            Some("pt-PT")
        );
        assert_eq!(
            match_preferred_locale(&["zh-CN".to_string()], &supported).as_deref(),
            Some("zh-Hans")
        );
        assert_eq!(
            match_preferred_locale(&["zh-HK".to_string()], &supported).as_deref(),
            Some("zh-Hant")
        );
        assert_eq!(
            match_preferred_locale(&["sr-Cyrl-RS".to_string()], &supported).as_deref(),
            Some("sr-Cyrl")
        );
        assert_eq!(
            match_preferred_locale(&["sr-Latn-RS".to_string()], &supported).as_deref(),
            Some("sr-Latn")
        );
    }

    #[test]
    fn locale_matcher_uses_preference_order_and_single_language_fallback() {
        let supported = vec!["en-AU".to_string(), "de".to_string()];

        assert_eq!(
            match_preferred_locale(&["fr-FR".to_string(), "de-DE".to_string()], &supported,)
                .as_deref(),
            Some("de")
        );

        assert_eq!(
            match_preferred_locale(&["en-US".to_string()], &supported).as_deref(),
            Some("en-AU")
        );
    }

    #[test]
    fn locale_matcher_covers_l7a_windows_languages_and_portuguese_regions() {
        let supported = vec![
            "en-AU".to_string(),
            "fr".to_string(),
            "it".to_string(),
            "nl".to_string(),
            "pl".to_string(),
            "pt-BR".to_string(),
            "pt-PT".to_string(),
            "tr".to_string(),
            "hu".to_string(),
            "sl".to_string(),
        ];

        for (preferred, expected) in [
            ("fr-FR", "fr"),
            ("fr-CA", "fr"),
            ("it-IT", "it"),
            ("nl-BE", "nl"),
            ("pl-PL", "pl"),
            ("tr-TR", "tr"),
            ("hu-HU", "hu"),
            ("sl-SI", "sl"),
            ("pt-BR", "pt-BR"),
            ("pt-PT", "pt-PT"),
            ("pt-AO", "pt-PT"),
            ("pt", "pt-PT"),
        ] {
            assert_eq!(
                match_preferred_locale(&[preferred.to_string()], &supported).as_deref(),
                Some(expected),
                "unexpected match for {preferred}"
            );
        }

        // Regionally distinct Portuguese catalogues must not become interchangeable
        // merely because both share the same base language.
        assert_eq!(
            match_preferred_locale(&["pt-BR".to_string(), "pt-PT".to_string()], &supported,)
                .as_deref(),
            Some("pt-BR")
        );
        assert_eq!(
            match_preferred_locale(&["xx-YY".to_string(), "sl-SI".to_string()], &supported,)
                .as_deref(),
            Some("sl")
        );
    }

    #[test]
    fn unsupported_windows_language_leaves_frontend_to_use_canonical_fallback() {
        let supported = vec!["en-AU".to_string()];

        assert_eq!(
            match_preferred_locale(&["es-MX".to_string()], &supported),
            None
        );
    }

    #[test]
    fn start_response_maps_normal_and_degraded_success() {
        let normal = parse_start_response("OK STARTED | MSR=OK").expect("normal start");
        assert_eq!(normal.status, "started");
        assert!(normal.msr_available);

        let degraded =
            parse_start_response("OK STARTED_DEGRADED | MSR=Unavailable").expect("degraded start");
        assert_eq!(degraded.status, "started");
        assert!(!degraded.msr_available);
    }

    #[test]
    fn start_response_preserves_helper_error_as_diagnostic_detail() {
        let error = parse_start_response("ERR Unable to launch Safex XMRig: access denied")
            .expect_err("helper error");

        assert_eq!(error.code, "mining.helperCommandFailed");
        assert_eq!(
            error.detail.as_deref(),
            Some("Unable to launch Safex XMRig: access denied")
        );
    }

    #[test]
    fn stop_response_maps_forced_and_clean_success() {
        assert!(
            parse_stop_response("OK STOPPED_FORCED")
                .expect("forced stop")
                .forced
        );

        assert!(
            !parse_stop_response("OK STOPPED_GRACEFULLY (exit code: 0)")
                .expect("clean stop")
                .forced
        );
    }

    #[test]
    fn unexpected_helper_response_becomes_structured_error() {
        let error = parse_stop_response("SURPRISE").expect_err("unexpected response");

        assert_eq!(error.code, "mining.helperUnexpectedResponse");
        assert_eq!(error.detail.as_deref(), Some("SURPRISE"));
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(HelperSessionState::default())
        .invoke_handler(tauri::generate_handler![
            backend_probe,
            windows_locale_selection,
            validate_safex_address,
            validate_safex_daemon,
            start_helper_session,
            start_xmrig_test,
            xmrig_test_status,
            stop_xmrig_test,
        ])
        .run(tauri::generate_context!())
        .expect("error while running The Safex Mine");
}

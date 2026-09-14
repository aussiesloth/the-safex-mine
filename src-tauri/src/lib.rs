use std::{
    io::{BufRead, BufReader},
    path::PathBuf,
    process::{Child, Command, Stdio},
    sync::Mutex,
    thread,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(ProcessState::default())
        .invoke_handler(
            tauri::generate_handler![
                backend_probe,
                start_test_process,
                stop_test_process,
                test_process_running,
                safex_xmrig_version,
                validate_safex_address,
                validate_safex_daemon,
            ],
        )
        .run(tauri::generate_context!())
        .expect(
            "error while running The Safex Mine"
        );
}
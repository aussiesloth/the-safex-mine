use std::{
    io::{BufRead, BufReader},
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
            ],
        )
        .run(tauri::generate_context!())
        .expect(
            "error while running The Safex Mine"
        );
}
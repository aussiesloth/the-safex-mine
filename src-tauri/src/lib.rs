#[tauri::command]
fn backend_probe() -> String {
    format!(
        "Rust backend connected — v{}",
        env!("CARGO_PKG_VERSION")
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            backend_probe
        ])
        .run(tauri::generate_context!())
        .expect("error while running The Safex Mine");
}
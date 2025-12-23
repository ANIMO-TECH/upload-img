// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 模块声明
mod commands;
mod config;
mod storage;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // 应用启动时的初始化逻辑
            println!("应用启动中...");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::config::save_config,
            commands::config::load_config,
            commands::storage::load_history,
            commands::storage::save_record,
            commands::storage::delete_record,
            commands::storage::clear_history,
            commands::upload::upload_file_base64,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

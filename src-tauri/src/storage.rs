use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UploadRecord {
    pub id: String,
    pub file_name: String,
    pub file_size: u64,
    pub local_path: String,
    pub upload_url: String,
    pub uploaded_at: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryData {
    pub records: Vec<UploadRecord>,
}

impl Default for HistoryData {
    fn default() -> Self {
        Self {
            records: Vec::new(),
        }
    }
}

pub fn generate_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

pub fn get_appdata_path() -> Result<std::path::PathBuf, String> {
    // 获取应用数据目录
    let base_dir = if cfg!(target_os = "macos") {
        // macOS: ~/Library/Application Support
        let home = env::var("HOME").map_err(|_| "无法获取 HOME 目录".to_string())?;
        std::path::PathBuf::from(home).join("Library").join("Application Support")
    } else if cfg!(target_os = "windows") {
        // Windows: %APPDATA%
        let appdata = env::var("APPDATA").map_err(|_| "无法获取 APPDATA 目录".to_string())?;
        std::path::PathBuf::from(appdata)
    } else {
        // Linux: ~/.config
        let home = env::var("HOME").map_err(|_| "无法获取 HOME 目录".to_string())?;
        std::path::PathBuf::from(home).join(".config")
    };

    let path = base_dir.join("com.upload-img.app");
    std::fs::create_dir_all(&path).map_err(|e| format!("创建目录失败: {}", e))?;
    Ok(path)
}

pub fn get_config_path() -> Result<std::path::PathBuf, String> {
    let path = get_appdata_path()?;
    Ok(path.join("config.json"))
}

pub fn get_history_path() -> Result<std::path::PathBuf, String> {
    let path = get_appdata_path()?;
    Ok(path.join("history.json"))
}

use crate::config::ApiConfig;
use crate::storage::get_config_path;

#[tauri::command]
pub async fn save_config(config: ApiConfig) -> Result<(), String> {
    let config_path = get_config_path()?;

    // 创建目录
    if let Some(parent) = config_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("创建目录失败: {}", e))?;
    }

    // 序列化配置
    let config_json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("序列化配置失败: {}", e))?;

    // 写入文件
    std::fs::write(&config_path, config_json)
        .map_err(|e| format!("写入配置文件失败: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn load_config() -> Result<ApiConfig, String> {
    let config_path = get_config_path()?;

    // 检查文件是否存在
    if !config_path.exists() {
        return Err("配置文件不存在".to_string());
    }

    // 读取文件
    let config_str = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("读取配置文件失败: {}", e))?;

    // 反序列化
    let config: ApiConfig = serde_json::from_str(&config_str)
        .map_err(|e| format!("解析配置文件失败: {}", e))?;

    Ok(config)
}

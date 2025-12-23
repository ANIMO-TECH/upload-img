use crate::storage::{HistoryData, UploadRecord, get_history_path};

#[tauri::command]
pub async fn load_history() -> Result<Vec<UploadRecord>, String> {
    let history_path = get_history_path()?;

    // 检查文件是否存在
    if !history_path.exists() {
        return Ok(Vec::new());
    }

    // 读取文件
    let history_str = std::fs::read_to_string(&history_path)
        .map_err(|e| format!("读取历史记录失败: {}", e))?;

    // 反序列化
    let history: HistoryData = serde_json::from_str(&history_str)
        .map_err(|e| format!("解析历史记录失败: {}", e))?;

    Ok(history.records)
}

#[tauri::command]
pub async fn save_record(record: UploadRecord) -> Result<(), String> {
    let history_path = get_history_path()?;

    // 创建目录
    if let Some(parent) = history_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("创建目录失败: {}", e))?;
    }

    // 读取现有记录
    let mut records = if history_path.exists() {
        let history_str = std::fs::read_to_string(&history_path)
            .map_err(|e| format!("读取历史记录失败: {}", e))?;
        let history: HistoryData = serde_json::from_str(&history_str)
            .map_err(|e| format!("解析历史记录失败: {}", e))?;
        history.records
    } else {
        Vec::new()
    };

    // 添加新记录
    records.push(record);

    // 保存
    let history = HistoryData { records };
    let history_json = serde_json::to_string_pretty(&history)
        .map_err(|e| format!("序列化历史记录失败: {}", e))?;

    std::fs::write(&history_path, history_json)
        .map_err(|e| format!("写入历史记录失败: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn delete_record(id: String) -> Result<(), String> {
    let history_path = get_history_path()?;

    if !history_path.exists() {
        return Ok(());
    }

    // 读取现有记录
    let history_str = std::fs::read_to_string(&history_path)
        .map_err(|e| format!("读取历史记录失败: {}", e))?;
    let mut history: HistoryData = serde_json::from_str(&history_str)
        .map_err(|e| format!("解析历史记录失败: {}", e))?;

    // 删除记录
    history.records.retain(|r| r.id != id);

    // 保存
    let history_json = serde_json::to_string_pretty(&history)
        .map_err(|e| format!("序列化历史记录失败: {}", e))?;

    std::fs::write(&history_path, history_json)
        .map_err(|e| format!("写入历史记录失败: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn clear_history() -> Result<(), String> {
    let history_path = get_history_path()?;

    if history_path.exists() {
        std::fs::remove_file(&history_path)
            .map_err(|e| format!("删除历史记录失败: {}", e))?;
    }

    Ok(())
}

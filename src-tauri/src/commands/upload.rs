use serde::{Deserialize, Serialize};
use base64::{Engine as _, engine::general_purpose};

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadResponse {
    pub code: i32,
    pub msg: String,
    pub result: String,
}

#[tauri::command]
pub async fn upload_file_base64(
    file_name: String,
    file_content_base64: String,
    api_url: String,
) -> Result<String, String> {
    // 解码 base64
    let file_content = general_purpose::STANDARD
        .decode(&file_content_base64)
        .map_err(|e| format!("解码文件失败: {}", e))?;

    // 构建 multipart form
    let part = reqwest::multipart::Part::bytes(file_content)
        .file_name(file_name.clone())
        .mime_str("application/octet-stream")
        .unwrap();

    let form = reqwest::multipart::Form::new()
        .part("file", part)
        .text("expireTime", "-1");

    // 发送请求（模拟 curl 的行为）
    let client = reqwest::Client::builder()
        .build()
        .map_err(|e| format!("无法创建 HTTP 客户端: {}", e))?;

    let response = client
        .post(&api_url)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("上传请求失败: {}", e))?;

    let status = response.status();
    let response_text = response.text().await
        .map_err(|e| format!("读取响应失败: {}", e))?;

    if !status.is_success() {
        return Err(format!("HTTP {}: {}", status.as_u16(), response_text));
    }

    // 解析响应
    let upload_response: UploadResponse = serde_json::from_str(&response_text)
        .map_err(|e| format!("解析响应失败: {} - 响应内容: {}", e, response_text))?;

    if upload_response.code == 0 {
        Ok(upload_response.result)
    } else {
        Err(format!("{}: {}", upload_response.code, upload_response.msg))
    }
}

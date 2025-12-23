// API 配置
export interface ApiConfig {
  apiUrl: string;
}

// 上传统计
export interface UploadProgress {
  fileName: string;
  percent: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// 上传结果
export interface UploadResult {
  id: string;
  fileName: string;
  fileSize: number;
  localPath: string;
  uploadUrl: string;
  uploadedAt: string;
  status: 'success' | 'failed';
}

// 历史记录（使用 snake_case，与 Rust 后端一致）
export interface UploadRecord {
  id: string;
  file_name: string;
  file_size: number;
  local_path: string;
  upload_url: string;
  uploaded_at: string;
  status: 'success' | 'failed';
}

// 历史记录
export interface HistoryRecord extends UploadResult {}

// API 响应
export interface UploadResponse {
  code: number;
  msg: string;
  result: string;
}

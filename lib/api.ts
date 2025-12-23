import type { ApiConfig, UploadResponse } from '@/types';
import { invoke } from '@tauri-apps/api/core';

export async function uploadFile(
  file: File,
  config: ApiConfig,
  onProgress?: (percent: number) => void
): Promise<string> {
  try {
    // 触发进度回调 - 开始读取文件
    onProgress?.(10);

    // 读取文件内容为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 触发进度回调 - 开始转换
    onProgress?.(30);

    // 转换为 base64
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);

    // 触发进度回调 - 开始上传
    onProgress?.(50);

    // 调用 Tauri 上传命令
    const result = await invoke<string>('upload_file_base64', {
      fileName: file.name,
      fileContentBase64: base64,
      apiUrl: config.apiUrl,
    });

    // 触发进度回调 - 完成
    onProgress?.(100);

    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : '上传失败');
  }
}

export async function uploadFiles(
  files: File[],
  config: ApiConfig,
  onProgress?: (fileName: string, percent: number) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const errors: Array<{ file: File; error: Error }> = [];

  // 并发上传，最多3个并发
  const concurrency = 3;
  const chunks: File[][] = [];

  for (let i = 0; i < files.length; i += concurrency) {
    chunks.push(files.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const uploadPromises = chunk.map((file) =>
      uploadFile(file, config, (percent) => {
        onProgress?.(file.name, percent);
      })
        .then((url) => {
          results.set(file.name, url);
        })
        .catch((error) => {
          errors.push({ file, error });
        })
    );

    await Promise.all(uploadPromises);
  }

  if (errors.length > 0) {
    console.error('部分文件上传失败:', errors);
  }

  return results;
}

export function validateImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return validTypes.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

"use client"

import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useConfigStore } from '@/stores/configStore';
import { useUploadStore } from '@/stores/uploadStore';
import { ConfigDialog } from '@/components/config/ConfigDialog';
import { FileSelector } from '@/components/upload/FileSelector';
import { UploadQueue } from '@/components/upload/UploadQueue';
import { UploadResult } from '@/components/upload/UploadResult';
import { HistoryList } from '@/components/history/HistoryList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/lib/api';
import { generateId } from '@/lib/utils';
import { Upload, Settings, History } from 'lucide-react';

export default function Home() {
  const { config, isConfigured, loadConfig } = useConfigStore();
  const {
    queue,
    progress,
    clearQueue,
    updateProgress,
    addResult,
    results,
  } = useUploadStore();
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isInitialLoad = useRef(true);

  // 首次加载检查配置
  useEffect(() => {
    loadConfig().then(() => {
      isInitialLoad.current = false;
    });
  }, [loadConfig]);

  // 如果未配置且不是首次加载，显示配置对话框
  useEffect(() => {
    if (!isInitialLoad.current && !isConfigured) {
      setShowConfigDialog(true);
    }
  }, [isConfigured]);

  const handleUpload = async () => {
    if (!config) {
      alert('请先配置上传接口');
      return;
    }

    if (queue.length === 0) {
      alert('请先选择要上传的文件');
      return;
    }

    setIsUploading(true);

    try {
      // 逐个上传文件
      for (const file of queue) {
        try {
          // 更新状态为上传中
          updateProgress(file.name, { status: 'uploading', percent: 0 });

          // 上传文件
          const url = await uploadFile(file, config, (percent) => {
            updateProgress(file.name, { percent });
          });

          // 上传成功
          updateProgress(file.name, { status: 'success', percent: 100 });

          // 保存到历史记录
          const record = {
            id: generateId(),
            file_name: file.name,
            file_size: file.size,
            local_path: '', // Web File 对象没有 path 属性
            upload_url: url,
            uploaded_at: new Date().toISOString(),
            status: 'success' as const,
          };

          await invoke('save_record', { record });

          // 添加到结果列表（转换为 camelCase）
          addResult({
            id: record.id,
            fileName: file.name,
            fileSize: file.size,
            localPath: '',
            uploadUrl: url,
            uploadedAt: record.uploaded_at,
            status: 'success',
          });
        } catch (error) {
          // 上传失败
          const errorMsg = error instanceof Error ? error.message : '上传失败';
          updateProgress(file.name, {
            status: 'error',
            error: errorMsg,
          });
        }
      }

      // 上传完成，清空队列
      setTimeout(() => {
        clearQueue();
      }, 2000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">图片上传工具</h1>
          <p className="text-muted-foreground">
            批量上传图片到您的云存储服务
          </p>
        </div>

        {/* 配置对话框 */}
        <ConfigDialog
          open={showConfigDialog}
          onOpenChange={setShowConfigDialog}
          mandatory={!isConfigured && isInitialLoad.current}
        />

        {/* 主内容 */}
        <Tabs defaultValue="upload" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                上传
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                历史记录
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </TabsTrigger>
            </TabsList>

            {queue.length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={isUploading || !config}
              >
                {isUploading ? '上传中...' : `开始上传 (${queue.length})`}
              </Button>
            )}
          </div>

          <TabsContent value="upload" className="space-y-6">
            <FileSelector />
            <UploadQueue />
            {results.length > 0 && <UploadResult />}
          </TabsContent>

          <TabsContent value="history">
            <HistoryList />
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12">
              <Button onClick={() => setShowConfigDialog(true)}>
                修改配置
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

"use client"

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, FileImage, Copy, Download } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';
import type { UploadRecord } from '@/types';

export function HistoryList() {
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const data = await invoke<UploadRecord[]>('load_history');
      setRecords(data);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await invoke('delete_record', { id });
      setRecords(records.filter((r) => r.id !== id));
    } catch (error) {
      console.error('删除记录失败:', error);
      alert('删除失败');
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upload-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          加载中...
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          暂无历史记录
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            历史记录 ({records.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={record.upload_url}
                      alt={record.file_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <FileImage className="h-6 w-6 text-muted-foreground hidden" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {record.file_name}
                    </p>
                    <Badge
                      variant={record.status === 'success' ? 'default' : 'destructive'}
                      className="flex-shrink-0"
                    >
                      {record.status === 'success' ? '成功' : '失败'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(record.file_size)} · {formatDate(record.uploaded_at)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {record.upload_url}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="flex-shrink-0"
                    onClick={() => handleCopyUrl(record.upload_url, record.id)}
                    title="复制链接"
                  >
                    {copiedId === record.id ? (
                      <span className="text-xs">已复制</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="flex-shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

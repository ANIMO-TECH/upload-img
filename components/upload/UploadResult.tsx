"use client"

import { useState } from 'react';
import { useUploadStore } from '@/stores/uploadStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileImage, Copy, Trash2 } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';

export function UploadResult() {
  const { results, removeResult, clearResults } = useUploadStore();
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

  if (results.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            上传结果 ({results.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={clearResults}
          >
            清空结果
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {results.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-2">
                  <div className="space-y-1.5">
                    {/* 图片预览 - 固定小尺寸 */}
                    <div className="h-20 w-full rounded overflow-hidden bg-muted">
                      <img
                        src={result.uploadUrl}
                        alt={result.fileName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ccc"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="12"%3E加载失败%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>

                    {/* 文件信息 */}
                    <div>
                      <p className="text-[10px] font-medium truncate" title={result.fileName}>
                        {result.fileName}
                      </p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="flex-1 h-6"
                        onClick={() => handleCopyUrl(result.uploadUrl, result.id)}
                        title="复制链接"
                      >
                        {copiedId === result.id ? (
                          <span className="text-[10px]">✓</span>
                        ) : (
                          <Copy className="h-2.5 w-2.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="flex-shrink-0 h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeResult(result.id)}
                        title="删除"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

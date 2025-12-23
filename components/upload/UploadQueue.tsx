"use client"

import { useUploadStore } from '@/stores/uploadStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Upload, FileImage } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

export function UploadQueue() {
  const { queue, progress, removeFile, clearQueue } = useUploadStore();

  if (queue.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传队列 ({queue.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearQueue}
          >
            清空队列
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {queue.map((file, index) => {
              const itemProgress = progress[index] || {
                percent: 0,
                status: 'pending' as const,
              };

              return (
                <div
                  key={file.name}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="flex-shrink-0">
                    <FileImage className="h-10 w-10 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      <Badge
                        variant={
                          itemProgress.status === 'success'
                            ? 'default'
                            : itemProgress.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {itemProgress.status === 'pending' && '等待中'}
                        {itemProgress.status === 'uploading' && '上传中'}
                        {itemProgress.status === 'success' && '成功'}
                        {itemProgress.status === 'error' && '失败'}
                      </Badge>
                    </div>

                    {itemProgress.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={itemProgress.percent} />
                        <p className="text-xs text-muted-foreground text-right">
                          {itemProgress.percent}%
                        </p>
                      </div>
                    )}

                    {itemProgress.error && (
                      <p className="text-xs text-destructive">
                        {itemProgress.error}
                      </p>
                    )}
                  </div>

                  {itemProgress.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

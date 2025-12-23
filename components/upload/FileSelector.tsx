"use client"

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUploadStore } from '@/stores/uploadStore';
import { validateImageFile } from '@/lib/api';

export function FileSelector() {
  const { addFiles } = useUploadStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(validateImageFile);

    if (validFiles.length === 0) {
      alert('请选择有效的图片文件');
      return;
    }

    if (validFiles.length < files.length) {
      alert(`已过滤 ${files.length - validFiles.length} 个非图片文件`);
    }

    addFiles(validFiles);
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // 重置 input，允许重复选择同一文件
    e.target.value = '';
  }, [handleFiles]);

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">选择或拖拽图片到此处</h3>
            <p className="text-sm text-muted-foreground">
              支持批量上传，格式：JPEG、PNG、GIF、WebP
            </p>
          </div>

          <div className="flex gap-3">
            <label htmlFor="file-upload">
              <Button asChild>
                <span>选择文件</span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

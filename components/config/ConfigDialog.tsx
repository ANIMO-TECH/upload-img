"use client"

import { useEffect, useState } from 'react';
import { useConfigStore } from '@/stores/configStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { ApiConfig } from '@/types';

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mandatory?: boolean;
}

export function ConfigDialog({ open, onOpenChange, mandatory = false }: ConfigDialogProps) {
  const { config, saveConfig, loadConfig, error, isLoading, clearError } = useConfigStore();
  const [formData, setFormData] = useState<ApiConfig>({
    apiUrl: '',
  });
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    if (config) {
      setFormData({
        apiUrl: config.apiUrl || '',
      });
    }
  }, [config]);

  const handleSave = async () => {
    // 验证
    if (!formData.apiUrl.trim()) {
      setFormError('API URL 不能为空');
      return;
    }

    try {
      new URL(formData.apiUrl);
    } catch {
      setFormError('API URL 格式不正确');
      return;
    }

    clearError();
    await saveConfig(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (!mandatory) {
      clearError();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={mandatory ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => mandatory && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>配置上传接口</DialogTitle>
          <DialogDescription>
            {mandatory ? '首次使用需要配置上传接口' : '修改上传接口配置'}
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiUrl" className="text-sm font-medium">
                API URL <span className="text-destructive">*</span>
              </label>
              <Input
                id="apiUrl"
                placeholder="https://example.com/api/upload"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">输入图片上传接口的完整 URL</p>
            </div>

            {(formError || error) && (
              <div className="text-sm text-destructive">
                {formError || error}
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter>
          {!mandatory && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              取消
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

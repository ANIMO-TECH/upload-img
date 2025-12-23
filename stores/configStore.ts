import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { ApiConfig } from '@/types';

interface ConfigState {
  config: ApiConfig | null;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;

  // 操作
  loadConfig: () => Promise<void>;
  saveConfig: (config: ApiConfig) => Promise<void>;
  clearError: () => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  isConfigured: false,
  isLoading: false,
  error: null,

  loadConfig: async () => {
    set({ isLoading: true, error: null });

    try {
      const config = await invoke<ApiConfig>('load_config');
      set({ config, isConfigured: true, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '加载配置失败';
      set({ error: errorMsg, isLoading: false });
      // 配置不存在不算错误
      if (errorMsg.includes('不存在')) {
        set({ isConfigured: false });
      }
    }
  },

  saveConfig: async (config: ApiConfig) => {
    set({ isLoading: true, error: null });

    try {
      await invoke('save_config', { config });
      set({ config, isConfigured: true, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '保存配置失败';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

import { create } from 'zustand';
import type { UploadResult, UploadProgress } from '@/types';

interface UploadState {
  // 文件队列
  queue: File[];
  // 上传进度
  progress: UploadProgress[];
  // 上传结果
  results: UploadResult[];

  // 操作
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearQueue: () => void;
  updateProgress: (fileName: string, progress: Partial<UploadProgress>) => void;
  addResult: (result: UploadResult) => void;
  clearResults: () => void;
  removeResult: (id: string) => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  queue: [],
  progress: [],
  results: [],

  addFiles: (files: File[]) => set((state) => ({
    queue: [...state.queue, ...files],
    progress: [
      ...state.progress,
      ...files.map((file) => ({
        fileName: file.name,
        percent: 0,
        status: 'pending' as const,
      })),
    ],
  })),

  removeFile: (index: number) => set((state) => {
    const newQueue = [...state.queue];
    const newProgress = [...state.progress];
    newQueue.splice(index, 1);
    newProgress.splice(index, 1);
    return { queue: newQueue, progress: newProgress };
  }),

  clearQueue: () => set({ queue: [], progress: [] }),

  updateProgress: (fileName: string, update: Partial<UploadProgress>) =>
    set((state) => ({
      progress: state.progress.map((p) =>
        p.fileName === fileName ? { ...p, ...update } : p
      ),
    })),

  addResult: (result: UploadResult) =>
    set((state) => ({
      results: [result, ...state.results],
    })),

  clearResults: () => set({ results: [] }),

  removeResult: (id: string) =>
    set((state) => ({
      results: state.results.filter((r) => r.id !== id),
    })),
}));

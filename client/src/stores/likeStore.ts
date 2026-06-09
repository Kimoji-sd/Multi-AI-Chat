import { create } from 'zustand';
import type { ModelId } from '../types';
import { getAllModelLikes, incrementModelLike } from '../db/indexedDB';

interface LikeStore {
  likes: Record<string, number>;
  loadLikes: () => Promise<void>;
  addLike: (modelId: ModelId) => Promise<void>;
  getCount: (modelId: ModelId) => number;
}

export const useLikeStore = create<LikeStore>((set, get) => ({
  likes: {},

  loadLikes: async () => {
    const likes = await getAllModelLikes();
    set({ likes });
  },

  addLike: async (modelId) => {
    const count = await incrementModelLike(modelId);
    set((state) => ({
      likes: { ...state.likes, [modelId]: count },
    }));
  },

  getCount: (modelId) => get().likes[modelId] ?? 0,
}));

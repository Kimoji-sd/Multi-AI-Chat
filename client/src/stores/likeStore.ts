import { create } from 'zustand';
import type { PersonaId } from '../types';
import { getAllPersonaLikes, incrementPersonaLike } from '../db/indexedDB';

interface LikeStore {
  likes: Record<string, number>;
  loadLikes: () => Promise<void>;
  addLike: (personaId: PersonaId) => Promise<void>;
  getCount: (personaId: PersonaId) => number;
}

export const useLikeStore = create<LikeStore>((set, get) => ({
  likes: {},

  loadLikes: async () => {
    const likes = await getAllPersonaLikes();
    set({ likes });
  },

  addLike: async (personaId) => {
    const count = await incrementPersonaLike(personaId);
    set((state) => ({
      likes: { ...state.likes, [personaId]: count },
    }));
  },

  getCount: (personaId) => get().likes[personaId] ?? 0,
}));

import { create } from 'zustand';
import type { ModelId } from '../types';

interface ModelStore {
  selectedModels: ModelId[];
  toggleModel: (id: ModelId) => void;
  setModels: (ids: ModelId[]) => void;
  clearSelection: () => void;
}

export const useModelStore = create<ModelStore>((set, get) => ({
  selectedModels: [],

  toggleModel: (id) => {
    const { selectedModels } = get();
    if (selectedModels.includes(id)) {
      set({ selectedModels: selectedModels.filter((m) => m !== id) });
    } else if (selectedModels.length < 4) {
      set({ selectedModels: [...selectedModels, id] });
    }
  },

  setModels: (ids) => set({ selectedModels: ids.slice(0, 4) }),

  clearSelection: () => set({ selectedModels: [] }),
}));

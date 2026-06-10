import { create } from 'zustand';
import { DEFAULT_MODEL_ID, type ModelId, type PersonaId } from '../types';

interface PersonaStore {
  selectedPersonas: PersonaId[];
  activeModel: ModelId;
  togglePersona: (id: PersonaId) => void;
  setPersonas: (ids: PersonaId[]) => void;
  setActiveModel: (id: ModelId) => void;
  clearSelection: () => void;
}

export const usePersonaStore = create<PersonaStore>((set, get) => ({
  selectedPersonas: [],
  activeModel: DEFAULT_MODEL_ID,

  togglePersona: (id) => {
    const { selectedPersonas } = get();
    if (selectedPersonas.includes(id)) {
      set({ selectedPersonas: selectedPersonas.filter((p) => p !== id) });
    } else if (selectedPersonas.length < 4) {
      set({ selectedPersonas: [...selectedPersonas, id] });
    }
  },

  setPersonas: (ids) => set({ selectedPersonas: ids.slice(0, 4) }),

  setActiveModel: (id) => set({ activeModel: id }),

  clearSelection: () => set({ selectedPersonas: [] }),
}));

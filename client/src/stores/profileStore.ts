import { create } from 'zustand';
import type { UserProfile } from '../types';
import { getProfile, saveProfile } from '../db/indexedDB';

interface ProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  isLoading: false,

  loadProfile: async () => {
    set({ isLoading: true });
    const profile = await getProfile();
    set({ profile, isLoading: false });
  },

  setProfile: async (profile) => {
    await saveProfile(profile);
    set({ profile });
  },

  refresh: async () => {
    const profile = await getProfile();
    set({ profile });
  },
}));

import type { ChatRound, ProfileRequest, UserProfile } from '../types';
import { useProfileStore } from '../stores/profileStore';

export async function updateProfile(
  rounds: ChatRound[],
  existingProfile: UserProfile | null,
  totalRoundCount: number
): Promise<UserProfile | null> {
  const recentRounds = rounds.slice(-5);

  const body: ProfileRequest = {
    rounds: recentRounds,
    existingProfile,
  };

  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error('Profile update failed:', response.status);
    return null;
  }

  const data = await response.json();
  const profile: UserProfile = {
    ...data.profile,
    roundCount: totalRoundCount,
  };

  await useProfileStore.getState().setProfile(profile);
  return profile;
}

export function shouldUpdateProfile(roundCount: number): boolean {
  return roundCount > 0 && roundCount % 5 === 0;
}

import {
  COLD_START_RECOMMENDATIONS,
  type RecommendRequest,
  type UserProfile,
} from '../types';

export async function fetchRecommendations(
  profile: UserProfile | null
): Promise<string[]> {
  if (!profile) {
    return [...COLD_START_RECOMMENDATIONS];
  }

  const body: RecommendRequest = { userProfile: profile };

  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error('Recommendation fetch failed:', response.status);
    return [...COLD_START_RECOMMENDATIONS];
  }

  const data = await response.json();
  const questions: unknown = data.questions;

  if (Array.isArray(questions) && questions.length >= 3) {
    return questions.slice(0, 3).filter((q): q is string => typeof q === 'string');
  }

  return [...COLD_START_RECOMMENDATIONS];
}

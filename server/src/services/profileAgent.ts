import type {
  ChatRound,
  PersonaId,
  UserProfile,
} from '../../../shared/types.js';
import { getPersonaConfig } from '../../../shared/types.js';
import { env } from '../config/env.js';
import { createProfileAgentAdapter } from './modelAdapters/openai.js';

function roundsToText(rounds: ChatRound[]): string {
  return rounds
    .map((round) => {
      const user = round.userMessage.content;
      const replies = round.assistantMessages
        .map((m) => {
          const name = m.personaId
            ? (getPersonaConfig(m.personaId)?.displayName ?? m.personaId)
            : '未知人格';
          return `[${name}]: ${m.content}`;
        })
        .join('\n');
      return `User: ${user}\n${replies}`;
    })
    .join('\n\n---\n\n');
}

function computeTechnicalMetrics(rounds: ChatRound[]) {
  const personaCounts: Record<string, number> = {};
  let totalLength = 0;
  let messageCount = 0;
  const hours: number[] = [];

  for (const round of rounds) {
    totalLength += round.userMessage.content.length;
    messageCount++;
    hours.push(new Date(round.timestamp).getHours());

    for (const msg of round.assistantMessages) {
      if (msg.personaId) {
        personaCounts[msg.personaId] = (personaCounts[msg.personaId] ?? 0) + 1;
      }
    }
  }

  const preferredPersonas = Object.entries(personaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id as PersonaId);

  return {
    preferredPersonas,
    avgMessageLength: messageCount > 0 ? Math.round(totalLength / messageCount) : 0,
    activeHours: [...new Set(hours)],
  };
}

function mergeTopicDistribution(
  oldDist: Record<string, number>,
  newDist: Record<string, number>
): Record<string, number> {
  const merged: Record<string, number> = { ...oldDist };
  const allKeys = new Set([...Object.keys(oldDist), ...Object.keys(newDist)]);

  for (const key of allKeys) {
    merged[key] = (oldDist[key] ?? 0) * 0.6 + (newDist[key] ?? 0) * 0.4;
  }
  return merged;
}

function parseProfileJson(text: string): Partial<UserProfile> | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch {
    return null;
  }
}

export async function generateProfile(
  rounds: ChatRound[],
  existingProfile?: UserProfile | null,
  totalRoundCount?: number
): Promise<UserProfile> {
  const roundsText = roundsToText(rounds);
  const metrics = computeTechnicalMetrics(rounds);

  const prompt = `你是一个用户画像分析师。根据以下对话历史，生成用户画像。

对话历史：
${roundsText}

现有画像：${existingProfile ? JSON.stringify(existingProfile, null, 2) : '无'}

请输出 JSON 格式的用户画像，包含：
{
  "technicalProfile": {
    "preferredPersonas": ["人格1"],
    "topicDistribution": {"技术": 0.4},
    "avgMessageLength": 数字,
    "activeHours": [9, 14, 21]
  },
  "personalityProfile": {
    "communicationStyle": "描述",
    "thinkingPatterns": "描述",
    "knowledgeGaps": "描述",
    "interestsSummary": "描述"
  }
}

只输出 JSON，不要其他文字。`;

  let llmResponse = '';

  await createProfileAgentAdapter().streamChat(
    [{ role: 'user', content: prompt }],
    (chunk) => {
      llmResponse += chunk;
    }
  );

  const parsed = parseProfileJson(llmResponse);

  const newTechnical = parsed?.technicalProfile ?? {
    preferredPersonas: metrics.preferredPersonas,
    topicDistribution: {},
    avgMessageLength: metrics.avgMessageLength,
    activeHours: metrics.activeHours,
  };

  const mergedTechnical = existingProfile
    ? {
        preferredPersonas:
          newTechnical.preferredPersonas?.length > 0
            ? newTechnical.preferredPersonas
            : existingProfile.technicalProfile.preferredPersonas,
        topicDistribution: mergeTopicDistribution(
          existingProfile.technicalProfile.topicDistribution,
          newTechnical.topicDistribution ?? {}
        ),
        avgMessageLength: Math.round(
          existingProfile.technicalProfile.avgMessageLength * 0.6 +
            (newTechnical.avgMessageLength ?? metrics.avgMessageLength) * 0.4
        ),
        activeHours: [
          ...new Set([
            ...existingProfile.technicalProfile.activeHours,
            ...(newTechnical.activeHours ?? metrics.activeHours),
          ]),
        ],
      }
    : {
        preferredPersonas: newTechnical.preferredPersonas ?? metrics.preferredPersonas,
        topicDistribution: newTechnical.topicDistribution ?? {},
        avgMessageLength: newTechnical.avgMessageLength ?? metrics.avgMessageLength,
        activeHours: newTechnical.activeHours ?? metrics.activeHours,
      };

  const personality = parsed?.personalityProfile ??
    existingProfile?.personalityProfile ?? {
      communicationStyle: '待分析',
      thinkingPatterns: '待分析',
      knowledgeGaps: '待分析',
      interestsSummary: '待分析',
    };

  return {
    version: (existingProfile?.version ?? 0) + 1,
    generatedAt: Date.now(),
    roundCount: totalRoundCount ?? rounds.length,
    technicalProfile: mergedTechnical,
    personalityProfile: personality,
  };
}

export { env };

import type { FastifyReply } from 'fastify';
import type {
  ChatMessage,
  Message,
  ModelId,
  UserProfile,
} from '../../../shared/types.js';
import { getModelConfig } from '../../../shared/types.js';
import { getModelRoute } from '../config/env.js';
import { sendSSE } from '../utils/sse.js';
import { createAdapter } from './modelAdapters/index.js';

function serializeProfile(profile: UserProfile | null | undefined): string {
  if (!profile) return '暂无用户画像';
  return JSON.stringify(
    {
      technical: profile.technicalProfile,
      personality: profile.personalityProfile,
    },
    null,
    2
  );
}

export function buildModelMessages(
  modelId: ModelId,
  messages: Message[],
  userProfile?: UserProfile | null
): ChatMessage[] {
  const config = getModelConfig(modelId);
  const modelName = config?.displayName ?? modelId;

  const systemPrompt: ChatMessage = {
    role: 'system',
    content: `你是 ${modelName}。以下是你正在对话的用户的画像：${serializeProfile(userProfile)}。请根据画像调整你的回答风格和深度。`,
  };

  const filtered: ChatMessage[] = [];
  for (const msg of messages) {
    if (msg.role === 'user') {
      filtered.push({ role: 'user', content: msg.content });
    } else if (msg.role === 'assistant' && msg.modelId === modelId) {
      filtered.push({ role: 'assistant', content: msg.content });
    }
  }

  return [systemPrompt, ...filtered];
}

export async function dispatchChat(
  models: ModelId[],
  messages: Message[],
  userProfile: UserProfile | null | undefined,
  reply: FastifyReply
): Promise<void> {
  const tasks = models.map(async (model) => {
    try {
      const route = getModelRoute(model);
      const adapter = createAdapter(route);
      const modelMessages = buildModelMessages(model, messages, userProfile);
      await adapter.streamChat(modelMessages, (chunk) => {
        sendSSE(reply, { type: 'chunk', modelId: model, content: chunk });
      });
      sendSSE(reply, { type: 'done', modelId: model });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      sendSSE(reply, { type: 'error', modelId: model, error: errorMsg });
      sendSSE(reply, { type: 'done', modelId: model });
    }
  });

  await Promise.allSettled(tasks);
}

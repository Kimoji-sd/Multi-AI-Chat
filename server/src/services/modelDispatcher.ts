import type { FastifyReply } from 'fastify';
import type {
  ChatMessage,
  Message,
  ModelId,
  PersonaId,
  UserProfile,
} from '../../../shared/types.js';
import {
  getPersonaConfig,
  personaDelimiter,
} from '../../../shared/types.js';
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

function buildPersonaDescriptions(personas: PersonaId[]): string {
  return personas
    .map((id, index) => {
      const config = getPersonaConfig(id);
      const name = config?.displayName ?? id;
      const prompt = config?.systemPrompt ?? `你是 ${name}。`;
      return `${index + 1}. 【${name}】（标记: ${personaDelimiter(id)}）\n   人设：${prompt}`;
    })
    .join('\n\n');
}

function buildFormatInstructions(personas: PersonaId[]): string {
  const markers = personas.map((id) => personaDelimiter(id)).join('\n');
  const firstMarker = personaDelimiter(personas[0] ?? '');
  return `回复格式要求（严格遵守）：
对每个用户消息，你必须按以下顺序输出 ${personas.length} 段回复，每段以标记行开头，标记行独占一行：
${markers}
（每段标记下方写该人格的回复内容）

注意：
- 第一行必须是 ${firstMarker}，不能省略第一个标记
- 标记必须完全一致，包括大小写
- 每个人格的回复正文必须控制在 100 个字符以内
- 每个人格回复必须是完整表达并自然收尾，宁可更短，也不要超长
- 回复要紧凑，不要在段前段后输出空行，不要使用多余空白行
- 每个角色保持自身人设，不要混淆
- 根据用户画像调整回答风格和深度
- 不要在标记之外输出额外说明`;
}

export function buildMultiPersonaMessages(
  personas: PersonaId[],
  messages: Message[],
  userProfile?: UserProfile | null
): ChatMessage[] {
  const systemPrompt: ChatMessage = {
    role: 'system',
    content: `你是一个多角色对话模拟器。你需要同时扮演以下 ${personas.length} 个角色，对用户的消息分别以各自身份回复。

角色列表：
${buildPersonaDescriptions(personas)}

用户画像：${serializeProfile(userProfile)}

${buildFormatInstructions(personas)}`,
  };

  const chatMessages: ChatMessage[] = [systemPrompt];
  let pendingUser: string | null = null;

  for (const msg of messages) {
    if (msg.role === 'user') {
      if (pendingUser !== null) {
        chatMessages.push({ role: 'user', content: pendingUser });
      }
      pendingUser = msg.content;
    } else if (msg.role === 'assistant' && msg.personaId && msg.content) {
      if (pendingUser !== null) {
        chatMessages.push({ role: 'user', content: pendingUser });
        pendingUser = null;
      }
      const last = chatMessages[chatMessages.length - 1];
      const segment = `${personaDelimiter(msg.personaId)}\n${msg.content}`;
      if (last?.role === 'assistant') {
        last.content += `\n${segment}`;
      } else {
        chatMessages.push({ role: 'assistant', content: segment });
      }
    }
  }

  if (pendingUser !== null) {
    chatMessages.push({ role: 'user', content: pendingUser });
  }

  return chatMessages;
}

class PersonaStreamParser {
  private buffer = '';
  private currentPersona: PersonaId | null = null;
  private readonly delimiterRegex: RegExp;

  constructor(private readonly personas: PersonaId[]) {
    const escaped = personas.map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    this.delimiterRegex = new RegExp(`<<<(${escaped.join('|')})>>>`);
  }

  private emitText(
    text: string,
    onPersonaChunk: (personaId: PersonaId, content: string) => void
  ): void {
    if (!text) return;

    if (!this.currentPersona) {
      if (!text.trim()) return;
      this.currentPersona = this.personas[0] ?? null;
    }

    if (this.currentPersona) {
      onPersonaChunk(this.currentPersona, text);
    }
  }

  private splitPotentialDelimiterTail(): { ready: string; tail: string } {
    const fullStart = this.buffer.lastIndexOf('<<<');
    if (fullStart >= 0) {
      return {
        ready: this.buffer.slice(0, fullStart),
        tail: this.buffer.slice(fullStart),
      };
    }

    const partialStart = this.buffer.endsWith('<<')
      ? this.buffer.length - 2
      : this.buffer.endsWith('<')
        ? this.buffer.length - 1
        : -1;

    if (partialStart >= 0) {
      return {
        ready: this.buffer.slice(0, partialStart),
        tail: this.buffer.slice(partialStart),
      };
    }

    return { ready: this.buffer, tail: '' };
  }

  processChunk(
    chunk: string,
    onPersonaChunk: (personaId: PersonaId, content: string) => void
  ): void {
    this.buffer += chunk;

    while (true) {
      const match = this.delimiterRegex.exec(this.buffer);
      if (!match || match.index === undefined) {
        const { ready, tail } = this.splitPotentialDelimiterTail();
        this.emitText(ready, onPersonaChunk);
        this.buffer = tail;
        break;
      }

      const before = this.buffer.slice(0, match.index);
      this.emitText(before, onPersonaChunk);

      this.currentPersona = match[1] as PersonaId;
      this.buffer = this.buffer.slice(match.index + match[0].length);
    }
  }

  flush(onPersonaChunk: (personaId: PersonaId, content: string) => void): void {
    this.emitText(this.buffer, onPersonaChunk);
    this.buffer = '';
  }
}

export async function dispatchChat(
  model: ModelId,
  personas: PersonaId[],
  messages: Message[],
  userProfile: UserProfile | null | undefined,
  reply: FastifyReply
): Promise<void> {
  const parser = new PersonaStreamParser(personas);
  const hasEmittedByPersona = new Set<string>();

  const emitChunk = (personaId: PersonaId, content: string) => {
    let normalized = content.replace(/\n{3,}/g, '\n\n');
    if (!hasEmittedByPersona.has(personaId)) {
      normalized = normalized.replace(/^\s+/, '');
    }

    if (!normalized) {
      return;
    }

    if (normalized) {
      hasEmittedByPersona.add(personaId);
      sendSSE(reply, { type: 'chunk', personaId, content: normalized });
    }
  };

  try {
    const route = getModelRoute(model);
    const adapter = createAdapter(route);
    const chatMessages = buildMultiPersonaMessages(personas, messages, userProfile);

    await adapter.streamChat(chatMessages, (chunk) => {
      parser.processChunk(chunk, emitChunk);
    });

    parser.flush(emitChunk);

    for (const personaId of personas) {
      sendSSE(reply, { type: 'done', personaId });
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    for (const personaId of personas) {
      sendSSE(reply, { type: 'error', personaId, error: errorMsg });
      sendSSE(reply, { type: 'done', personaId });
    }
  }
}

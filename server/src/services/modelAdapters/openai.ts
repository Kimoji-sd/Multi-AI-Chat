import { env, getApiKey, getBaseUrl, type Provider } from '../../config/env.js';
import type { ModelAdapter } from './base.js';
import { readStreamBody } from './base.js';

export function createOpenAICompatibleAdapter(
  baseUrl: string,
  apiKey: string,
  model: string,
  providerLabel: string
): ModelAdapter {
  return {
    async streamChat(messages, onChunk) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, stream: true }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`${providerLabel} API error: ${response.status} ${err}`);
      }

      await readStreamBody(response.body, (line) => {
        if (!line.startsWith('data: ')) return;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {
          // ignore parse errors on partial lines
        }
      });
    },
  };
}

const PROVIDER_LABELS: Record<Provider, string> = {
  bailian: '阿里云百炼',
  qianfan: '百度千帆',
  volcano: '火山方舟',
};

export function createProviderAdapter(
  provider: Provider,
  apiModel: string
): ModelAdapter {
  return createOpenAICompatibleAdapter(
    getBaseUrl(provider),
    getApiKey(provider),
    apiModel,
    PROVIDER_LABELS[provider]
  );
}

export function createProfileAgentAdapter(): ModelAdapter {
  const { provider, model } = env.profileAgent;
  return createProviderAdapter(provider, model);
}

import 'dotenv/config';

export type Provider = 'bailian' | 'qianfan' | 'volcano';

export interface ModelRoute {
  provider: Provider;
  apiModel: string;
}

export interface EnvConfig {
  port: number;
  apiKeys: Record<Provider, string>;
  baseUrls: Record<Provider, string>;
  modelRouting: Record<string, ModelRoute>;
  volcanoEndpoints: Record<string, string>;
  profileAgent: {
    provider: Provider;
    model: string;
  };
}

const DEFAULT_MODEL_ROUTING =
  'qwen3.7-max=bailian:qwen3.7-max,qwen3.6-flash=bailian:qwen3.6-flash,deepseek-v4-flash=bailian:deepseek-v4-flash,kimi-k2.6=bailian:kimi-k2.6,glm-5.1=bailian:glm-5.1,MiniMax-M2.5=bailian:MiniMax-M2.5,ernie-x1-turbo-32k=qianfan:ernie-x1-turbo-32k,ernie-4.5-turbo-128k=qianfan:ernie-4.5-turbo-128k,Doubao-Seed-2.0-pro=volcano:doubao-seed-2-0-pro-260215,Doubao-Seed-Character=volcano:doubao-seed-character-251128';

/** 前端模型 ID → 火山方舟接入点环境变量名 */
const VOLCANO_ENDPOINT_ENV_KEYS: Record<string, string> = {
  'Doubao-Seed-2.0-pro': 'VOLCANO_ENDPOINT_DOUBAO_SEED_2_0_PRO',
  'Doubao-Seed-Character': 'VOLCANO_ENDPOINT_DOUBAO_SEED_CHARACTER',
};

function parseProvider(value: string): Provider {
  const p = value.trim().toLowerCase();
  if (p === 'bailian' || p === 'qianfan' || p === 'volcano') {
    return p;
  }
  throw new Error(`Unknown provider: ${value}`);
}

function parseModelRouting(raw: string): Record<string, ModelRoute> {
  const routing: Record<string, ModelRoute> = {};
  for (const entry of raw.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const modelId = trimmed.slice(0, eqIdx).trim();
    const route = trimmed.slice(eqIdx + 1);
    const colonIdx = route.indexOf(':');
    if (colonIdx === -1) continue;
    const provider = route.slice(0, colonIdx).trim();
    const apiModel = route.slice(colonIdx + 1).trim();
    if (!provider || !apiModel) continue;
    routing[modelId] = {
      provider: parseProvider(provider),
      apiModel,
    };
  }
  return routing;
}

function loadVolcanoEndpoints(): Record<string, string> {
  const endpoints: Record<string, string> = {};
  for (const [modelId, envKey] of Object.entries(VOLCANO_ENDPOINT_ENV_KEYS)) {
    const value = process.env[envKey]?.trim();
    if (value) endpoints[modelId] = value;
  }
  return endpoints;
}

function loadConfig(): EnvConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    apiKeys: {
      bailian: process.env.BAILIAN_API_KEY ?? '',
      qianfan: process.env.QIANFAN_API_KEY ?? '',
      volcano: process.env.VOLCANO_API_KEY ?? '',
    },
    baseUrls: {
      bailian:
        process.env.BAILIAN_BASE_URL ??
        'https://dashscope.aliyuncs.com/compatible-mode/v1',
      qianfan:
        process.env.QIANFAN_BASE_URL ?? 'https://qianfan.baidubce.com/v2',
      volcano:
        process.env.VOLCANO_BASE_URL ??
        'https://ark.cn-beijing.volces.com/api/v3',
    },
    modelRouting: parseModelRouting(
      process.env.MODEL_ROUTING ?? DEFAULT_MODEL_ROUTING
    ),
    volcanoEndpoints: loadVolcanoEndpoints(),
    profileAgent: {
      provider: parseProvider(process.env.PROFILE_AGENT_PROVIDER ?? 'bailian'),
      model: process.env.PROFILE_AGENT_MODEL ?? 'qwen3.6-flash',
    },
  };
}

export const env = loadConfig();

export function getModelRoute(modelId: string): ModelRoute {
  const route = env.modelRouting[modelId];
  if (!route) {
    return { provider: 'bailian', apiModel: modelId };
  }

  // 火山方舟：优先使用 ep- 接入点 ID（若配置），否则使用 MODEL_ROUTING 中的 Model ID
  if (route.provider === 'volcano') {
    const endpointId = env.volcanoEndpoints[modelId];
    if (endpointId) {
      return { provider: 'volcano', apiModel: endpointId };
    }
  }

  return route;
}

export function getApiKey(provider: Provider): string {
  return env.apiKeys[provider];
}

export function getBaseUrl(provider: Provider): string {
  return env.baseUrls[provider];
}

export function hasApiKey(provider: Provider): boolean {
  return !!env.apiKeys[provider];
}

export const port = env.port;
export const apiKeys = env.apiKeys;
export const profileAgentModel = env.profileAgent.model;

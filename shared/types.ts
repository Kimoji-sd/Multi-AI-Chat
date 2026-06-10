// 模型标识
export type ModelId =
  | 'qwen3.7-max'
  | 'qwen3.6-flash'
  | 'deepseek-v4-flash'
  | 'kimi-k2.6'
  | 'glm-5.1'
  | 'MiniMax-M2.5'
  | 'ernie-x1-turbo-32k'
  | 'ernie-4.5-turbo-128k'
  | 'Doubao-Seed-2.0-pro'
  | 'Doubao-Seed-Character'
  | string;

export interface ModelConfig {
  id: ModelId;
  displayName: string;
  provider: string;
  description: string;
  detail: string;
  avatarColor: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  modelId?: ModelId;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  liked?: boolean;
}

export interface ChatRound {
  id: string;
  userMessage: Message;
  assistantMessages: Message[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  selectedModels: ModelId[];
  rounds: ChatRound[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  version: number;
  generatedAt: number;
  roundCount: number;
  technicalProfile: {
    preferredModels: ModelId[];
    topicDistribution: Record<string, number>;
    avgMessageLength: number;
    activeHours: number[];
  };
  personalityProfile: {
    communicationStyle: string;
    thinkingPatterns: string;
    knowledgeGaps: string;
    interestsSummary: string;
  };
}

export interface SSEEvent {
  type: 'chunk' | 'done' | 'error';
  modelId: ModelId;
  content?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  models: ModelId[];
  messages: Message[];
  userProfile?: UserProfile | null;
}

export interface ProfileRequest {
  rounds: ChatRound[];
  existingProfile?: UserProfile | null;
}

export interface ProfileResponse {
  profile: UserProfile;
}

export const MODEL_POOL: ModelConfig[] = [
  // 阿里云百炼
  {
    id: 'qwen3.7-max',
    displayName: 'Qwen 3.7 Max',
    provider: '阿里云百炼',
    description: '通义千问旗舰',
    detail: '通义千问系列旗舰模型，综合推理、创作与知识理解能力最强，适合复杂问答与深度分析场景。',
    avatarColor: '#0066FF',
  },
  {
    id: 'qwen3.6-flash',
    displayName: 'Qwen 3.6 Flash',
    provider: '阿里云百炼',
    description: '通义千问高速',
    detail: '通义千问高速版，响应快、成本低，适合日常对话、摘要与轻量任务。',
    avatarColor: '#00C781',
  },
  {
    id: 'deepseek-v4-flash',
    displayName: 'DeepSeek V4 Flash',
    provider: '阿里云百炼',
    description: 'DeepSeek 高速',
    detail: 'DeepSeek V4 高速推理版，擅长代码、逻辑推理与结构化输出，兼顾速度与质量。',
    avatarColor: '#8B5CF6',
  },
  {
    id: 'kimi-k2.6',
    displayName: 'Kimi K2.6',
    provider: '阿里云百炼',
    description: '月之暗面 Kimi',
    detail: '月之暗面 Kimi 系列，长文本理解与多轮对话表现优秀，适合阅读分析与连续讨论。',
    avatarColor: '#FF6B35',
  },
  {
    id: 'glm-5.1',
    displayName: 'GLM 5.1',
    provider: '阿里云百炼',
    description: '智谱 GLM',
    detail: '智谱 GLM 大模型，中文语义理解扎实，适合知识问答、文案与通用对话。',
    avatarColor: '#0066FF',
  },
  {
    id: 'MiniMax-M2.5',
    displayName: 'MiniMax M2.5',
    provider: '阿里云百炼',
    description: 'MiniMax 对话',
    detail: 'MiniMax 对话模型，表达自然流畅，适合闲聊、创意写作与角色化交流。',
    avatarColor: '#00C781',
  },
  // 百度千帆
  {
    id: 'ernie-x1-turbo-32k',
    displayName: 'ERNIE X1 Turbo',
    provider: '百度千帆',
    description: '文心 X1 32K',
    detail: '文心 X1 Turbo 深度思考版，32K 上下文，擅长逻辑推理、数学与复杂问题拆解。',
    avatarColor: '#FF6B35',
  },
  {
    id: 'ernie-4.5-turbo-128k',
    displayName: 'ERNIE 4.5 Turbo',
    provider: '百度千帆',
    description: '文心 4.5 128K',
    detail: '文心 4.5 Turbo，128K 超长上下文，适合长文档阅读、多轮历史对话与综合问答。',
    avatarColor: '#8B5CF6',
  },
  // 火山方舟
  {
    id: 'Doubao-Seed-2.0-pro',
    displayName: '豆包 Seed 2.0 Pro',
    provider: '火山方舟',
    description: '豆包旗舰',
    detail: '豆包 Seed 2.0 旗舰版，综合能力对标一线模型，适合复杂任务、深度推理与高质量创作。',
    avatarColor: '#0066FF',
  },
  {
    id: 'Doubao-Seed-Character',
    displayName: '豆包 Seed Character',
    provider: '火山方舟',
    description: '豆包角色扮演',
    detail: '豆包角色扮演专精模型，人设一致性强、语气生动，适合 NPC 对话、情景模拟与互动叙事。',
    avatarColor: '#FF6B35',
  },
];

export const GRID_COLORS = ['#0066FF', '#FF6B35', '#00C781', '#8B5CF6'];

export function getModelConfig(id: ModelId): ModelConfig | undefined {
  return MODEL_POOL.find((m) => m.id === id);
}

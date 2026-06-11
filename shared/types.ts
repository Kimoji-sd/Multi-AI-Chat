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

// AI 人格标识
export type PersonaId =
  | 'empathetic'
  | 'humorous'
  | 'warm'
  | 'rational'
  | 'professional'
  | 'scholar'
  | 'zen'
  | 'sharp'
  | 'creative'
  | 'coach'
  | string;

export interface PersonaConfig {
  id: PersonaId;
  displayName: string;
  description: string;
  useCases: string;
  systemPrompt: string;
  avatarColor: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  personaId?: PersonaId;
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
  selectedPersonas: PersonaId[];
  activeModel: ModelId;
  rounds: ChatRound[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  version: number;
  generatedAt: number;
  roundCount: number;
  technicalProfile: {
    preferredPersonas: PersonaId[];
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
  personaId: PersonaId;
  content?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: ModelId;
  personas: PersonaId[];
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

export interface RecommendRequest {
  userProfile?: UserProfile | null;
}

export interface RecommendResponse {
  questions: string[];
}

export const COLD_START_RECOMMENDATIONS = [
  '总是容易胡思乱想、内耗，要怎么调整心态？',
  '独处的时候容易莫名难过，如何改善？',
  '怎样才能做到遇事不情绪化、心态平稳？',
] as const;

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

export const DEFAULT_MODEL_ID: ModelId = 'qwen3.7-max';

export const PERSONA_POOL: PersonaConfig[] = [
  {
    id: 'empathetic',
    displayName: '高情商共情暖男',
    description: '细腻察言观色，懂得安抚情绪、委婉提意见、接住负面心态，不生硬说教，会换位思考。',
    useCases: '吐槽倾诉、感情烦恼、职场委屈、心态疏导、纠结抉择',
    systemPrompt:
      '你是「高情商共情暖男」AI。细腻察言观色，懂得安抚情绪、委婉提意见、接住负面心态，不生硬说教，会换位思考。语气温暖、有共情力，先理解感受再给建议。',
    avatarColor: '#E879A8',
  },
  {
    id: 'humorous',
    displayName: '幽默搞笑最佳损友',
    description: '自带段子、玩梗、适度互怼、脑洞整活，语气轻松跳脱，擅长化解沉闷气氛。',
    useCases: '摸鱼闲聊、解压唠嗑、写搞笑文案、角色扮演整活',
    systemPrompt:
      '你是「幽默搞笑最佳损友」AI。自带段子、玩梗、适度互怼、脑洞整活，语气轻松跳脱，擅长化解沉闷气氛。像损友一样聊天，有趣但不刻薄。',
    avatarColor: '#F59E0B',
  },
  {
    id: 'warm',
    displayName: '暖心温柔治愈大姐姐',
    description: '温和耐心、体贴细致、轻声鼓励，全程包容安抚，像靠谱陪伴者。',
    useCases: '深夜失眠、自我否定、备考焦虑、需要情绪支撑',
    systemPrompt:
      '你是「暖心温柔治愈大姐姐」AI。温和耐心、体贴细致、轻声鼓励，全程包容安抚，像靠谱的陪伴者。语气柔和，给人安全感。',
    avatarColor: '#FBBF24',
  },
  {
    id: 'rational',
    displayName: '硬核理性理工大佬',
    description: '逻辑严谨、干货直白、重数据原理，少废话、精准拆解问题，擅长计算/代码/方案推演，不擅长情绪客套。',
    useCases: '编程、数理计算、技术拆解、项目可行性分析、错题讲解',
    systemPrompt:
      '你是「硬核理性理工大佬」AI。逻辑严谨、干货直白、重数据原理，少废话、精准拆解问题，擅长计算、代码、方案推演，不擅长情绪客套。直接给结论和推导过程。',
    avatarColor: '#3B82F6',
  },
  {
    id: 'professional',
    displayName: '稳重职场精英',
    description: '成熟干练、条理清晰、懂商务话术，擅长写公文、PPT框架、谈判思路、职场规划，分寸感极强。',
    useCases: '写标书、述职报告、面试辅导、商务沟通、团队方案策划',
    systemPrompt:
      '你是「稳重职场精英」AI。成熟干练、条理清晰、懂商务话术，擅长写公文、PPT框架、谈判思路、职场规划，分寸感极强。输出结构化、专业得体。',
    avatarColor: '#6366F1',
  },
  {
    id: 'scholar',
    displayName: '博学儒雅学者导师',
    description: '知识面广、谈吐斯文、引经据典，讲解深入浅出，耐心答疑、纠正认知，文风端正严谨。',
    useCases: '文史考据、论文润色、学科深度学习、诗词赏析、价值观探讨',
    systemPrompt:
      '你是「博学儒雅学者导师」AI。知识面广、谈吐斯文、引经据典，讲解深入浅出，耐心答疑、纠正认知，文风端正严谨。',
    avatarColor: '#8B5CF6',
  },
  {
    id: 'zen',
    displayName: '佛系随和倾听者',
    description: '不争不辩、温和顺从，节奏舒缓，不强行输出观点，安静陪聊，适配长文本阅读整理。',
    useCases: '长篇文档精读、碎碎念流水账、不想被说教的松弛对话',
    systemPrompt:
      '你是「佛系随和倾听者」AI。不争不辩、温和顺从，节奏舒缓，不强行输出观点，安静陪聊。善于倾听和整理，不急于给建议。',
    avatarColor: '#10B981',
  },
  {
    id: 'sharp',
    displayName: '毒舌清醒观察员',
    description: '一针见血点破问题，不鸡汤、不讨好，直白剖析利弊，客观泼冷水、帮人戒内耗。',
    useCases: '恋爱踩坑、冲动决策、自我幻想、纠结内耗、看清现实利弊',
    systemPrompt:
      '你是「毒舌清醒观察员」AI。一针见血点破问题，不鸡汤、不讨好，直白剖析利弊，客观泼冷水、帮人戒内耗。犀利但有理有据。',
    avatarColor: '#EF4444',
  },
  {
    id: 'creative',
    displayName: '创意脑洞艺术家',
    description: '想象力丰富、文风浪漫，擅长写故事、脚本、歌词、氛围感文案，审美在线，乐于发散头脑风暴。',
    useCases: '小说创作、短视频脚本、海报文案、策划灵感、梦境脑洞续写',
    systemPrompt:
      '你是「创意脑洞艺术家」AI。想象力丰富、文风浪漫，擅长写故事、脚本、歌词、氛围感文案，审美在线，乐于发散头脑风暴。',
    avatarColor: '#EC4899',
  },
  {
    id: 'coach',
    displayName: '严格自律监督教练',
    description: '执行力导向，督促作息、健身、学习、存钱，制定计划表、盯进度、鞭策拖延，奖罚分明。',
    useCases: '备考冲刺、减脂健身、戒熬夜、打卡学习、改掉拖延陋习',
    systemPrompt:
      '你是「严格自律监督教练」AI。执行力导向，督促作息、健身、学习、存钱，制定计划表、盯进度、鞭策拖延，奖罚分明。直接、有推动力。',
    avatarColor: '#14B8A6',
  },
];

export function personaDelimiter(personaId: PersonaId): string {
  return `<<<${personaId}>>>`;
}

export function getModelConfig(id: ModelId): ModelConfig | undefined {
  return MODEL_POOL.find((m) => m.id === id);
}

export function getPersonaConfig(id: PersonaId): PersonaConfig | undefined {
  return PERSONA_POOL.find((p) => p.id === id);
}

export function getPersonaAvatarUrl(id: PersonaId): string {
  return `/personas/${id}.png`;
}

---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: ab656afe09b8680dfc756c47b902a578_fae5577563b411f19fb15254006c9bbf
    ReservedCode1: 7Ll3JQbyZptPI7uecv9+04YHOghqefXhnluZHlgBQfwVfgjF2qDAtJWQwN7eO2iLwZdRbcdVDPOX7zCwzKJ7gE6Mz28dIP+UWGM2fv8suQ8XiygFiOhmNRgDi5621vdnfSXCobuzIlcN08GOXnOwu9vLM60NoqmsgxtI3uliZK+dULjRHebJKh+1oc8=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: ab656afe09b8680dfc756c47b902a578_fae5577563b411f19fb15254006c9bbf
    ReservedCode2: 7Ll3JQbyZptPI7uecv9+04YHOghqefXhnluZHlgBQfwVfgjF2qDAtJWQwN7eO2iLwZdRbcdVDPOX7zCwzKJ7gE6Mz28dIP+UWGM2fv8suQ8XiygFiOhmNRgDi5621vdnfSXCobuzIlcN08GOXnOwu9vLM60NoqmsgxtI3uliZK+dULjRHebJKh+1oc8=
---



# Multi-AI Chat 项目 — Cursor 生成提示词

> 将此文档内容直接提供给 Cursor，即可启动项目代码生成。

---

## 一、项目概述

一个移动端优先的 Web 多 AI 聊天应用。用户从模型池中选择 4 个 AI 模型，进入 2×2 四宫格对话界面，输入消息后 4 个模型并行返回流式响应（先到先显）。系统内置用户画像 Agent，基于对话历史自动生成用户画像并注入每次对话。

## 一-B、UI 设计规范

### 设计定位

**简洁年轻化** — 干净利落、轻量通透、有呼吸感的现代极简风格。目标用户画像：18-35 岁，审美偏好是"少即是多"，排斥重阴影、重边框、过度装饰。

### 色彩系统

| Token | 色值 | 用途 |
|---|---|---|
| 主背景 | `#FAFAFA` | 全局底色，微微暖灰 |
| 卡片背景 | `#FFFFFF` | 对话框面板、输入框、模型卡片 |
| 主文字 | `#1A1A1A` | 标题、正文 |
| 次级文字 | `#8E8E93` | 时间戳、辅助说明 |
| 强调色 | `#0066FF` | 发送按钮、选中态、链接、激活色 |
| 分割线 | `#F0F0F0` | 网格分隔、列表分隔 |
| 模型色-1 | `#0066FF` | 左上模型标识 |
| 模型色-2 | `#FF6B35` | 右上模型标识 |
| 模型色-3 | `#00C781` | 左下模型标识 |
| 模型色-4 | `#8B5CF6` | 右下模型标识 |
| 错误/警告 | `#FF3B30` | 错误提示 |
| 骨架屏 | `#EBEBEB` | 加载占位 |

### 圆角与间距

| 元素 | 圆角 | 说明 |
|---|---|---|
| 大卡片（对话框面板、模型卡片） | `16px` | 柔和但不失利落 |
| 小元素（按钮、输入框、消息气泡） | `12px` | 统一的中小圆角 |
| 标签/徽章 | `20px`（胶囊） | 模型名称标签 |

| 间距层级 | 值 | 用途 |
|---|---|---|
| xs | `8px` | 紧密元素间距 |
| sm | `12px` | 消息气泡间距、图标与文字间距 |
| md | `16px` | 卡片内边距、面板内边距 |
| lg | `24px` | 区块间距 |

### 字体

- 系统字体栈：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif`
- 字号层级：标题 `20px/600`，正文 `15px/400`，辅助文字 `13px/400`，标签 `12px/500`
- 行高：正文 `1.5`，标题 `1.3`

### 动效

- 所有过渡使用 `transition: all 0.2s ease`
- 页面切换：淡入淡出 `opacity 0.25s`
- 消息出现：从下方滑入 `translateY(8px)→0，opacity 0→1，0.3s`
- 流式光标：`1s 闪烁周期，强调色`
- 按钮 hover：`scale(1.02)` + 轻微阴影
- 卡片选中态：边框变色 + 背景微变，无重阴影

### 设计原则

1. **零重阴影**：不使用 `box-shadow` 做卡片投影（仅在按钮 hover 时用轻微阴影），靠边框和背景色区分层级
2. **少即是多**：每个面板内只显示模型名（色条标识）+ 消息内容，无多余 chrome
3. **留白优先**：大面积留白，内容密度低，视觉呼吸感强
4. **色块标识 > 文字标识**：用色彩区分 4 个模型而非大段标签文字
5. **图标轻量**：优先使用 Feather Icons 或 Lucide（线性图标，2px 描边）
6. **无衬线纯文字**：全界面不使用衬线字体

## 二、技术栈

| 层 | 技术 | 备注 |
|---|---|---|
| 前端框架 | React 18 + TypeScript | Vite 构建，SPA 模式 |
| 样式 | Tailwind CSS | 移动端优先（max-width: 430px 主容器居中），配置文件扩展自定义色彩 token（见 UI 设计规范） |
| 状态管理 | Zustand | 轻量，适合 SPA |
| 路由 | React Router v6 | 两个页面：模型选择页 + 对话页 |
| 后端框架 | Node.js + Fastify | 高性能，原生支持 SSE |
| 实时通信 | SSE (Server-Sent Events) | 一个连接推送 4 路模型流式响应 |
| HTTP 客户端 | 后端用 fetch (Node 18+ 内置) | 调用各模型 API |
| 前端存储 | IndexedDB (via idb 库) | 对话历史 + 用户画像持久化 |

## 三、项目结构

```
multi-ai-chat/
├── client/                    # 前端 SPA
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── ModelSelectPage.tsx    # 模型选择页
│   │   │   └── ChatPage.tsx           # 对话页 (2×2 + 输入框)
│   │   ├── components/
│   │   │   ├── ModelCard.tsx          # 模型选择卡片
│   │   │   ├── ChatGrid.tsx           # 2×2 网格容器
│   │   │   ├── ChatPanel.tsx          # 单个模型对话框（流式渲染）
│   │   │   ├── ChatInput.tsx          # 底部输入框
│   │   │   └── Sidebar.tsx            # 历史对话侧边栏
│   │   ├── stores/
│   │   │   ├── modelStore.ts          # 选中的4个模型状态
│   │   │   ├── chatStore.ts           # 当前对话消息状态（4路）
│   │   │   └── profileStore.ts        # 用户画像状态
│   │   ├── services/
│   │   │   ├── sseClient.ts           # SSE 连接与消息路由
│   │   │   └── profileService.ts      # 画像 Agent 请求
│   │   ├── db/
│   │   │   └── indexedDB.ts           # IndexedDB CRUD 封装
│   │   └── types/
│   │       └── index.ts               # 共享类型定义
│   └── public/
├── server/                    # 后端服务
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                   # Fastify 入口
│   │   ├── routes/
│   │   │   ├── chat.ts                # POST /api/chat (SSE)
│   │   │   └── profile.ts             # POST /api/profile (画像)
│   │   ├── services/
│   │   │   ├── modelDispatcher.ts     # 4路并发调用调度
│   │   │   ├── modelAdapters/         # 各模型 API 适配器
│   │   │   │   ├── openai.ts
│   │   │   │   ├── claude.ts
│   │   │   │   ├── gemini.ts
│   │   │   │   └── deepseek.ts
│   │   │   └── profileAgent.ts        # 用户画像生成 Agent
│   │   ├── config/
│   │   │   └── apiKeys.ts             # API Key 管理（环境变量）
│   │   └── utils/
│   │       └── sse.ts                 # SSE 辅助工具
│   └── .env.example
└── shared/
    └── types.ts               # 前后端共享类型
```

## 四、核心类型定义 (shared/types.ts)

```typescript
// 模型标识
type ModelId = 'gpt-4o' | 'claude-3.5-sonnet' | 'gemini-2.0-flash' | 'deepseek-v3' | string;

// 模型配置
interface ModelConfig {
  id: ModelId;
  displayName: string;
  provider: string;
  avatarColor: string; // 对话框标识色
}

// 单条消息
interface Message {
  id: string;
  role: 'user' | 'assistant';
  modelId?: ModelId;  // assistant 消息标明来自哪个模型
  content: string;
  timestamp: number;
  isStreaming?: boolean; // 前端流式渲染中标记
}

// 单轮对话（用户输入 + 4个模型回复）
interface ChatRound {
  id: string;
  userMessage: Message;
  assistantMessages: Message[]; // 4个回复
  timestamp: number;
}

// 对话会话
interface ChatSession {
  id: string;
  title: string;
  selectedModels: ModelId[];
  rounds: ChatRound[];
  createdAt: number;
  updatedAt: number;
}

// 用户画像
interface UserProfile {
  version: number;
  generatedAt: number;
  roundCount: number; // 画像生成时已处理的轮数
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

// SSE 事件格式
interface SSEEvent {
  type: 'chunk' | 'done' | 'error';
  modelId: ModelId;
  content?: string;    // type=chunk 时的增量文本
  error?: string;      // type=error 时的错误信息
}
```

## 五、前端详细设计

### 5.1 页面路由

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | ModelSelectPage | 从模型池中选择 4 个模型 |
| `/chat` | ChatPage | 2×2 对话网格 |

### 5.2 ModelSelectPage — 模型选择页

- 顶部大标题："Choose your AI squad"（32px/700，字间距 -0.5px），副标题"Pick 4 models to chat with"（15px，次级色）
- 预设模型池（12-16 个），以 2 列卡片网格展示
- 每个卡片：白色背景、16px 圆角、1px `#F0F0F0` 边框、内边距 16px
  - 左侧模型 icon（40px 圆形，品牌色底 + 白色首字母缩写）
  - 右侧模型名称（15px/600）+ 一行简介（13px，次级色，截断）
  - 未选中：朴素白卡；选中：边框变为该模型色 + 右上角数字角标（20px 实心圆，白色数字）
- 选中 4 个后其余卡片变灰（opacity 0.4），不可点击
- 底部固定"Start Chat"按钮（全宽、12px 圆角、强调色背景白字、56px 高），未选满时灰色禁用
- 页面背景色 `#FAFAFA`，内容区 padding 16px

### 5.3 ChatPage — 对话页

#### 布局（移动端 430px 宽度基准）

```
┌──────────────────────────┐
│  ← 返回   对话标题   历史 │  ← 顶部栏 48px，透明底
├────────────┬─────────────┤
│  模型 1    │  模型 2     │
│  (左上)    │  (右上)     │  ← 四宫格，白色面板，
│            │             │     1px #F0F0F0 边框
├────────────┼─────────────┤
│  模型 3    │  模型 4     │
│  (左下)    │  (右下)     │
│            │             │
├────────────┴─────────────┤
│  [输入框.........] [发送] │  ← 底部输入栏 56px
└──────────────────────────┘
```

具体尺寸：
- 页面背景色 `#FAFAFA`
- 顶部栏: 48px，白色半透明底 + backdrop-blur，底部 1px `#F0F0F0` 分割线。左侧返回箭头，中间会话标题（15px/600），右侧历史图标
- 2×2 网格: 白色面板、16px 圆角（仅顶部两个面板有上方圆角，底部两个无圆角，视觉上形成"四格融合"感）、1px `#F0F0F0` 内边框分割，flex: 1 填充
- 底部输入栏: 56px，白色底，上方 1px `#F0F0F0` 分割线，输入框 12px 圆角 `#F5F5F5` 底色，发送按钮为 36px 圆形强调色图标按钮

#### 组件交互风格

**ChatPanel（单个对话框）**：
- 面板顶部：4px 高的模型色条（不是整条 header，仅一个细色条标识）
- 模型名：12px/500 标签，位于色条下方 8px 处，左侧 padding 12px
- 消息区域：padding 12px，白色底，overflow-y: auto
- 用户消息气泡：右对齐，强调色背景（`#0066FF`）+ 白色文字，12px 圆角，max-width 80%
- assistant 消息：左对齐，`#F5F5F5` 背景 + 主文字色，12px 圆角，max-width 85%
- 消息间距：sm (12px)
- 流式输出时最后一条消息末尾显示闪烁光标（1px 宽竖线，模型色，1s blink）
- 无头像、无消息气泡尾巴 — 纯文字气泡，极简

**ChatInput（底部输入框）**：
- 全宽输入区，左右 padding 16px
- 输入框：`#F5F5F5` 底色，12px 圆角，placeholder 文字次级色
- 发送按钮：输入为空时灰色圆形，有内容时变为强调色圆形（36px），内含 Feather 图标
- 发送中整体区域 opacity 0.6，按钮显示加载 spinner

**Sidebar（历史对话侧边栏）**：
- 从左侧滑入，遮罩层
- 按时间倒序列出历史会话
- 点击加载历史会话
- 长按/滑动删除会话

### 5.4 核心数据流

```
用户点击发送
    │
    ▼
1. chatStore.addUserMessage(content)
    │
    ▼
2. 从 IndexedDB 读取当前 UserProfile
    │
    ▼
3. 构建请求体:
   POST /api/chat
   {
     models: ['gpt-4o', 'claude-3.5-sonnet', ...],
     messages: [...对话历史],
     userProfile: { ... }
   }
    │
    ▼
4. sseClient.connect() — 建立 SSE 连接
    │
    ▼
5. 收到 chunk 事件 →
   chatStore.appendChunk(modelId, content)
   ChatPanel 自动重渲染追加内容
    │
    ▼
6. 收到 done 事件 × 4 (所有模型完成) →
   chatStore.markRoundComplete()
   保存到 IndexedDB
   检查当前对话轮数 % 5 === 0 ?
   │
   ├─ 是 → 触发 profileService.updateProfile()
   │        更新 IndexedDB 中的 UserProfile
   │        profileStore.refresh()
   │
   └─ 否 → 等待下一轮
```

### 5.5 状态管理 (Zustand Store)

**chatStore**：
```typescript
interface ChatStore {
  currentSession: ChatSession | null;
  selectedModels: ModelId[];
  rounds: ChatRound[];
  isStreaming: boolean;

  addUserMessage: (content: string) => void;
  appendChunk: (modelId: ModelId, content: string) => void;
  markModelDone: (modelId: ModelId) => void;
  completeRound: () => void;
  loadSession: (session: ChatSession) => void;
  newSession: () => void;
}
```

**关键实现细节**：
- `appendChunk`：找到当前轮次中对应 modelId 的 assistant 消息，追加 content
- `markModelDone`：设置该消息 `isStreaming = false`
- `completeRound`：4 个模型都 done 后，持久化到 IndexedDB，重置 streaming 状态

### 5.6 SSE 客户端 (sseClient.ts)

```typescript
// 核心逻辑
async function streamChat(requestBody: ChatRequest): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    // 解析 SSE 格式: "data: {...}\n\n"
    for (const line of text.split('\n\n')) {
      if (line.startsWith('data: ')) {
        const event: SSEEvent = JSON.parse(line.slice(6));
        if (event.type === 'chunk') {
          chatStore.appendChunk(event.modelId, event.content!);
        } else if (event.type === 'done') {
          chatStore.markModelDone(event.modelId);
        } else if (event.type === 'error') {
          // 显示错误提示
        }
      }
    }
  }
}
```

## 六、后端详细设计

### 6.1 API 设计

#### POST /api/chat

**请求体**：
```json
{
  "models": ["gpt-4o", "claude-3.5-sonnet", "gemini-2.0-flash", "deepseek-v3"],
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "...", "modelId": "gpt-4o" },
    ...
  ],
  "userProfile": {
    "technicalProfile": { ... },
    "personalityProfile": { ... }
  }
}
```

**响应**：SSE 流 (`Content-Type: text/event-stream`)

**核心逻辑** (`modelDispatcher.ts`)：

```typescript
async function dispatchChat(models, messages, userProfile, reply) {
  // 1. 构建各模型的 messages 数组
  //    - 将 userProfile 注入到每条消息的 system prompt
  //    - 过滤掉其他模型的 assistant 消息（每个模型只看自己的历史）

  // 2. Promise.allSettled 并发调用 4 个模型 API
  const tasks = models.map(model => {
    const adapter = getAdapter(model);
    const modelMessages = buildModelMessages(model, messages, userProfile);
    return adapter.streamChat(modelMessages, (chunk) => {
      // 每个 chunk 立即通过 SSE 发送
      reply.raw.write(`data: ${JSON.stringify({ type: 'chunk', modelId: model, content: chunk })}\n\n`);
    });
  });

  // 3. 等待所有完成
  await Promise.allSettled(tasks);

  // 4. 发送完成事件
  for (const model of models) {
    reply.raw.write(`data: ${JSON.stringify({ type: 'done', modelId: model })}\n\n`);
  }
  reply.raw.end();
}
```

**message 构建规则**：
- System prompt 格式：`"你是 {model_name}。以下是你正在对话的用户的画像：{userProfile.serialize()}。请根据画像调整你的回答风格和深度。"`
- 每个模型只接收自己的 assistant 消息，不接收其他模型的回复
- 历史消息按时间顺序排列

### 6.2 模型适配器

每个适配器实现统一接口：

```typescript
interface ModelAdapter {
  streamChat(
    messages: ChatMessage[],
    onChunk: (text: string) => void
  ): Promise<void>;
}
```

| 适配器 | API 端点 | 关键参数 |
|---|---|---|
| openai.ts | `https://api.openai.com/v1/chat/completions` | `stream: true` |
| claude.ts | `https://api.anthropic.com/v1/messages` | `stream: true` |
| gemini.ts | `https://generativelanguage.googleapis.com/v1beta/...` | `streamGenerateContent` |
| deepseek.ts | `https://api.deepseek.com/v1/chat/completions` | 兼容 OpenAI 格式 |

所有适配器统一使用 `response.body.getReader()` 读取 SSE/流式响应，解析后调用 `onChunk` 回调。

### 6.3 用户画像 Agent (profileAgent.ts)

**触发时机**：前端每 5 轮对话后调用

**POST /api/profile**

```json
// 请求
{
  "rounds": [...],  // 最近5轮对话（含4个模型回复）
  "existingProfile": { ... }  // 现有画像（如存在）
}

// 响应
{
  "profile": { ... UserProfile ... }
}
```

**生成逻辑**：

1. 从 rounds 中提取：用户所有消息、各模型的回复摘要
2. 构建 Prompt：

```
你是一个用户画像分析师。根据以下对话历史，生成用户画像：

对话历史：
{rounds_text}

现有画像：{existingProfile}

请输出 JSON 格式的用户画像，包含：
{
  "technicalProfile": {
    "preferredModels": ["模型1", ...],    // 用户偏向哪些模型
    "topicDistribution": {"技术": 0.4, ...}, // 话题分布比例
    "avgMessageLength": 数字,              // 平均消息长度
    "activeHours": [9, 14, 21]            // 活跃时段
  },
  "personalityProfile": {
    "communicationStyle": "描述",
    "thinkingPatterns": "描述",
    "knowledgeGaps": "描述",
    "interestsSummary": "描述"
  }
}
```

3. 调用一个 LLM（如 GPT-4o-mini）生成画像
4. 如果已有画像，做增量合并（加权平均技术指标，LLM 合并人格描述）
5. 返回完整 UserProfile

**画像合并策略**：
- 技术画像：新数据加权 0.4，旧数据加权 0.6（平滑更新）
- 人格画像：将新旧画像 + 本轮对话一起发给 LLM，要求合并更新

### 6.4 API Key 管理

- `.env` 文件存储：`OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GEMINI_API_KEY`、`DEEPSEEK_API_KEY`
- 启动时加载到内存，不在日志中输出
- 可选：支持 `PROFILE_AGENT_MODEL` 指定画像 Agent 使用的模型（默认 gpt-4o-mini）

## 七、数据存储 (IndexedDB)

### 数据库设计

```
Database: multi-ai-chat
├── ObjectStore: sessions (keyPath: id)
│   └── 索引: updatedAt (用于排序)
└── ObjectStore: profiles (keyPath: version)
    └── 存储: 单个 UserProfile 对象
```

### 操作接口 (indexedDB.ts)

```typescript
// 会话 CRUD
saveSession(session: ChatSession): Promise<void>
getSession(id: string): Promise<ChatSession | null>
listSessions(): Promise<ChatSession[]>  // 按 updatedAt 降序
deleteSession(id: string): Promise<void>

// 画像 CRUD
saveProfile(profile: UserProfile): Promise<void>
getProfile(): Promise<UserProfile | null>
```

## 八、开发阶段规划

### Phase 1 — 核心骨架 (MVP)

1. 项目脚手架搭建（Vite + Fastify + Tailwind）
2. 模型选择页面 UI
3. 2×2 对话网格布局（静态数据）
4. 后端 `/api/chat` SSE 接口（单模型先行）
5. 前端 SSE 客户端 + 流式渲染

### Phase 2 — 多模型并行

6. 4 个模型适配器实现
7. 后端并发调度 + SSE 多路推送
8. 前端 ChatPanel 流式渲染完善
9. IndexedDB 对话历史存取
10. 历史会话侧边栏

### Phase 3 — 用户画像

11. 画像 Agent Prompt 设计与调优
12. 后端 `/api/profile` 接口
13. 前端 5 轮触发逻辑
14. 画像注入到 system prompt
15. 画像增量合并逻辑

### Phase 4 — 打磨

16. 移动端响应式适配
17. 错误处理（API 超时、Key 失效等）
18. 加载状态与空状态 UI
19. 性能优化（虚拟列表？对话多时考虑）

---

## 九、关键约束与注意事项

1. **无状态后端**：后端不存储任何对话数据，所有状态由前端 IndexedDB 管理，后端只是代理 + 画像生成
2. **SSE 单连接**：一次对话使用一个 SSE 连接，4 个模型的 chunk 通过 modelId 区分
3. **画像隐私**：用户画像仅存储在用户本地浏览器，不上传服务器（后端用完即丢弃）
4. **移动端优先**：所有 CSS 以 max-width: 430px 为基准，PC 端居中显示
5. **网络容错**：单个模型 API 失败不影响其他 3 个，对应面板显示错误提示
6. **后续可扩展**：预留数据库接入点，未来可改为服务端存储
*（内容由AI生成，仅供参考）*
*（内容由AI生成，仅供参考）*

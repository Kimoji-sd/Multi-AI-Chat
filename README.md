# Multi-AI Chat

移动端优先的 Web 多 AI 聊天应用。从模型池中选择 4 个 AI 模型，进入 2×2 四宫格对话界面，输入消息后 4 个模型并行返回流式响应（先到先显）。系统内置用户画像 Agent，基于对话历史自动生成用户画像并注入每次对话。

## 目录

- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [架构与数据流](#架构与数据流)
- [UI 设计规范](#ui-设计规范)
- [API 参考](#api-参考)
- [数据存储](#数据存储)
- [开发路线图](#开发路线图)
- [设计约束](#设计约束)

## 功能特性

- **四宫格并行对话** — 同时与 4 个 AI 模型对话，流式响应先到先显
- **丰富模型池** — 10 个预设模型，覆盖阿里云百炼、百度千帆、火山方舟三大平台
- **用户画像 Agent** — 每 5 轮对话自动更新本地用户画像，注入 system prompt 个性化回复
- **历史会话** — IndexedDB 本地持久化，支持侧边栏浏览与切换
- **移动端优先** — 430px 主容器居中，简洁年轻的现代极简 UI

## 快速开始

### 前置要求

- Node.js 18+
- npm

### 安装与运行

```bash
# 克隆仓库
git clone <your-repo-url>
cd multi-ai-chat

# 安装依赖（根目录 + client + server）
npm run install:all

# 配置环境变量
cp server/.env.example server/.env
# 编辑 server/.env，填入各平台 API Key

# 启动开发服务（前端 :5173，后端 :3001）
npm run dev
```

浏览器访问 [http://localhost:5173](http://localhost:5173)。

### 构建

```bash
npm run build
```

## 环境变量

在 `server/.env` 中配置，参考 `server/.env.example`：

| 变量 | 说明 |
|------|------|
| `PORT` | 后端端口，默认 `3001` |
| `BAILIAN_API_KEY` | 阿里云百炼 API Key |
| `BAILIAN_BASE_URL` | 百炼 API 地址 |
| `QIANFAN_API_KEY` | 百度千帆 API Key |
| `QIANFAN_BASE_URL` | 千帆 API 地址 |
| `VOLCANO_API_KEY` | 火山方舟 API Key |
| `VOLCANO_BASE_URL` | 火山方舟 API 地址 |
| `VOLCANO_ENDPOINT_*` | 火山方舟接入点 ID（可选，覆盖模型路由） |
| `MODEL_ROUTING` | 前端模型 ID 到 provider:apiModel 的映射 |
| `PROFILE_AGENT_PROVIDER` | 画像 Agent 使用的平台 |
| `PROFILE_AGENT_MODEL` | 画像 Agent 使用的模型 |

`MODEL_ROUTING` 格式示例：

```
qwen3.7-max=bailian:qwen3.7-max,ernie-x1-turbo-32k=qianfan:ernie-x1-turbo-32k
```

支持的 `provider`：`bailian` | `qianfan` | `volcano`

## 技术栈

| 层 | 技术 | 备注 |
|----|------|------|
| 前端框架 | React 18 + TypeScript | Vite 构建，SPA 模式 |
| 样式 | Tailwind CSS | 移动端优先（max-width: 430px），自定义色彩 token |
| 状态管理 | Zustand | 轻量，适合 SPA |
| 路由 | React Router v7 | 模型选择页 + 对话页 |
| 后端框架 | Node.js + Fastify | 高性能，原生支持 SSE |
| 实时通信 | SSE (Server-Sent Events) | 单连接推送 4 路模型流式响应 |
| HTTP 客户端 | fetch (Node 18+ 内置) | 调用各模型 API |
| 前端存储 | IndexedDB (via idb) | 对话历史 + 用户画像持久化 |

## 项目结构

```
multi-ai-chat/
├── client/                    # 前端 SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ModelSelectPage.tsx    # 模型选择页
│   │   │   └── ChatPage.tsx           # 对话页 (2×2 + 输入框)
│   │   ├── components/
│   │   │   ├── ModelCard.tsx          # 模型选择卡片
│   │   │   ├── ChatGrid.tsx           # 2×2 网格容器
│   │   │   ├── ChatPanel.tsx          # 单个模型对话框（流式渲染）
│   │   │   ├── ChatInput.tsx          # 底部输入框
│   │   │   └── Sidebar.tsx            # 历史对话侧边栏
│   │   ├── stores/                    # Zustand 状态
│   │   ├── services/                  # SSE 客户端、画像服务
│   │   └── db/                        # IndexedDB 封装
│   └── vite.config.ts
├── server/                    # 后端服务
│   ├── src/
│   │   ├── index.ts                   # Fastify 入口
│   │   ├── routes/
│   │   │   ├── chat.ts                # POST /api/chat (SSE)
│   │   │   └── profile.ts             # POST /api/profile (画像)
│   │   ├── services/
│   │   │   ├── modelDispatcher.ts     # 4 路并发调用调度
│   │   │   ├── modelAdapters/         # 统一 OpenAI 兼容适配器
│   │   │   └── profileAgent.ts        # 用户画像生成 Agent
│   │   └── config/                    # 环境变量与 API Key
│   └── .env.example
├── shared/
│   └── types.ts               # 前后端共享类型与模型池
└── package.json
```

### 预设模型池

| 模型 ID | 名称 | 平台 |
|---------|------|------|
| `qwen3.7-max` | Qwen 3.7 Max | 阿里云百炼 |
| `qwen3.6-flash` | Qwen 3.6 Flash | 阿里云百炼 |
| `deepseek-v4-flash` | DeepSeek V4 Flash | 阿里云百炼 |
| `kimi-k2.6` | Kimi K2.6 | 阿里云百炼 |
| `glm-5.1` | GLM 5.1 | 阿里云百炼 |
| `MiniMax-M2.5` | MiniMax M2.5 | 阿里云百炼 |
| `ernie-x1-turbo-32k` | ERNIE X1 Turbo | 百度千帆 |
| `ernie-4.5-turbo-128k` | ERNIE 4.5 Turbo | 百度千帆 |
| `Doubao-Seed-2.0-pro` | 豆包 Seed 2.0 Pro | 火山方舟 |
| `Doubao-Seed-Character` | 豆包 Seed Character | 火山方舟 |

## 架构与数据流

### 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | ModelSelectPage | 从模型池中选择 4 个模型 |
| `/chat` | ChatPage | 2×2 对话网格 |

### 对话数据流

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
3. POST /api/chat { models, messages, userProfile }
    │
    ▼
4. sseClient 建立 SSE 连接
    │
    ▼
5. 收到 chunk → chatStore.appendChunk → ChatPanel 流式渲染
    │
    ▼
6. 收到 done × 4 → 持久化到 IndexedDB
    │
    └─ 轮数 % 5 === 0 → 触发 profileService.updateProfile()
```

### 核心类型 (`shared/types.ts`)

```typescript
type ModelId = 'qwen3.7-max' | 'qwen3.6-flash' | ... | string;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  modelId?: ModelId;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  selectedModels: ModelId[];
  rounds: ChatRound[];
  createdAt: number;
  updatedAt: number;
}

interface UserProfile {
  version: number;
  generatedAt: number;
  roundCount: number;
  technicalProfile: { preferredModels; topicDistribution; avgMessageLength; activeHours };
  personalityProfile: { communicationStyle; thinkingPatterns; knowledgeGaps; interestsSummary };
}

interface SSEEvent {
  type: 'chunk' | 'done' | 'error';
  modelId: ModelId;
  content?: string;
  error?: string;
}
```

## UI 设计规范

### 设计定位

**简洁年轻化** — 干净利落、轻量通透、有呼吸感的现代极简风格。目标用户：18–35 岁，审美偏好"少即是多"。

### 色彩系统

| Token | 色值 | 用途 |
|-------|------|------|
| 主背景 | `#FAFAFA` | 全局底色 |
| 卡片背景 | `#FFFFFF` | 对话框面板、输入框、模型卡片 |
| 主文字 | `#1A1A1A` | 标题、正文 |
| 次级文字 | `#8E8E93` | 时间戳、辅助说明 |
| 强调色 | `#0066FF` | 发送按钮、选中态、链接 |
| 分割线 | `#F0F0F0` | 网格分隔、列表分隔 |
| 模型色 | `#0066FF` / `#FF6B35` / `#00C781` / `#8B5CF6` | 四宫格标识 |
| 错误/警告 | `#FF3B30` | 错误提示 |
| 骨架屏 | `#EBEBEB` | 加载占位 |

### 圆角与间距

| 元素 | 圆角 |
|------|------|
| 大卡片 | `16px` |
| 按钮、输入框、消息气泡 | `12px` |
| 标签/徽章 | `20px`（胶囊） |

| 间距 | 值 | 用途 |
|------|-----|------|
| xs | `8px` | 紧密元素间距 |
| sm | `12px` | 消息气泡间距 |
| md | `16px` | 卡片内边距 |
| lg | `24px` | 区块间距 |

### 字体与动效

- 字体栈：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif`
- 字号：标题 `20px/600`，正文 `15px/400`，辅助 `13px/400`，标签 `12px/500`
- 过渡：`transition: all 0.2s ease`
- 流式光标：1s 闪烁周期，强调色
- 图标：Lucide（线性图标，2px 描边）

### 设计原则

1. **零重阴影** — 靠边框和背景色区分层级，仅在按钮 hover 时用轻微阴影
2. **少即是多** — 每个面板只显示模型名色条 + 消息内容
3. **留白优先** — 大面积留白，内容密度低
4. **色块标识 > 文字标识** — 用色彩区分 4 个模型
5. **无衬线纯文字** — 全界面不使用衬线字体

### 对话页布局

```
┌──────────────────────────┐
│  ← 返回   对话标题   历史 │  ← 顶部栏 48px
├────────────┬─────────────┤
│  模型 1    │  模型 2     │
│  (左上)    │  (右上)     │  ← 四宫格，白色面板
├────────────┼─────────────┤
│  模型 3    │  模型 4     │
│  (左下)    │  (右下)     │
├────────────┴─────────────┤
│  [输入框.........] [发送] │  ← 底部输入栏 56px
└──────────────────────────┘
```

## API 参考

### `POST /api/chat`

流式对话接口，返回 SSE 流（`Content-Type: text/event-stream`）。

**请求体：**

```json
{
  "models": ["qwen3.7-max", "ernie-x1-turbo-32k", "Doubao-Seed-2.0-pro", "deepseek-v4-flash"],
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "...", "modelId": "qwen3.7-max" }
  ],
  "userProfile": { "technicalProfile": {}, "personalityProfile": {} }
}
```

**SSE 事件格式：**

```json
{ "type": "chunk", "modelId": "qwen3.7-max", "content": "增量文本" }
{ "type": "done", "modelId": "qwen3.7-max" }
{ "type": "error", "modelId": "qwen3.7-max", "error": "错误信息" }
```

**消息构建规则：**

- System prompt 注入用户画像，调整回答风格和深度
- 每个模型只接收自己的 assistant 消息，不接收其他模型的回复
- `Promise.allSettled` 并发调用 4 个模型，单个失败不影响其余

### `POST /api/profile`

用户画像生成接口，前端每 5 轮对话后调用。

**请求体：**

```json
{
  "rounds": [],
  "existingProfile": {}
}
```

**响应：**

```json
{
  "profile": { "version": 1, "technicalProfile": {}, "personalityProfile": {} }
}
```

**画像合并策略：**

- 技术画像：新数据加权 0.4，旧数据加权 0.6
- 人格画像：将新旧画像 + 本轮对话一起发给 LLM 合并更新

## 数据存储

后端无状态，所有对话数据由前端 IndexedDB 管理。

```
Database: multi-ai-chat
├── ObjectStore: sessions (keyPath: id)
│   └── 索引: updatedAt
└── ObjectStore: profiles (keyPath: version)
```

| 接口 | 说明 |
|------|------|
| `saveSession` / `getSession` / `listSessions` / `deleteSession` | 会话 CRUD |
| `saveProfile` / `getProfile` | 画像读写 |

## 开发路线图

### Phase 1 — 核心骨架 (MVP)

- [x] 项目脚手架（Vite + Fastify + Tailwind）
- [x] 模型选择页面 UI
- [x] 2×2 对话网格布局
- [x] 后端 `/api/chat` SSE 接口
- [x] 前端 SSE 客户端 + 流式渲染

### Phase 2 — 多模型并行

- [x] 多平台模型适配器
- [x] 后端并发调度 + SSE 多路推送
- [x] IndexedDB 对话历史存取
- [x] 历史会话侧边栏

### Phase 3 — 用户画像

- [x] 画像 Agent Prompt 设计
- [x] 后端 `/api/profile` 接口
- [x] 前端 5 轮触发逻辑
- [x] 画像注入 system prompt

### Phase 4 — 打磨

- [ ] 移动端响应式适配
- [ ] 错误处理（API 超时、Key 失效等）
- [ ] 加载状态与空状态 UI
- [ ] 性能优化（对话多时考虑虚拟列表）

## 设计约束

1. **无状态后端** — 后端不存储对话数据，仅作 API 代理 + 画像生成
2. **SSE 单连接** — 一次对话使用一个 SSE 连接，通过 `modelId` 区分 4 路流
3. **画像隐私** — 用户画像仅存储在本地浏览器，后端用完即丢弃
4. **移动端优先** — 所有 CSS 以 max-width: 430px 为基准，PC 端居中显示
5. **网络容错** — 单个模型 API 失败不影响其他 3 个，对应面板显示错误提示
6. **可扩展** — 预留数据库接入点，未来可改为服务端存储

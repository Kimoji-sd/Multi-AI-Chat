# Multi-AI Chat

移动端优先的 Web 多 AI 人格对话应用。从 15 种预设人格中挑选 4 个，搭配一个底层大模型，进入 2×2 四宫格对话界面。单次 API 调用由模型同时扮演 4 个人格，流式解析后分路展示（先到先显）。系统内置用户画像 Agent 与推荐问题 Agent，基于对话历史个性化回复与开场引导。

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

- **四宫格多人格对话** — 同时与 4 个 AI 人格对话，单次请求、流式分路渲染
- **丰富人格池** — 15 种预设人格，分个性人格（10）、名人人格（2）、传统人格（3）三类
- **灵活模型切换** — 10 个底层大模型可选，覆盖阿里云百炼、百度千帆、火山方舟三大平台，选择页与对话页均可切换
- **用户画像 Agent** — 每 5 轮对话自动更新本地用户画像，注入 system prompt 个性化回复
- **推荐问题** — 新会话开场展示 3 条推荐问题（冷启动固定文案，有画像后由 Agent 个性化生成）
- **人格点赞** — 对满意的 AI 回复点赞，点赞数本地持久化并在人格卡片上展示
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

前端可单独部署至 Vercel（`vercel-build` 仅构建 client，`/api/*` 需另行部署后端或配置反向代理）。

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
| `PROFILE_AGENT_PROVIDER` | 画像 / 推荐 Agent 使用的平台 |
| `PROFILE_AGENT_MODEL` | 画像 / 推荐 Agent 使用的模型 |

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
| 状态管理 | Zustand | chat / persona / profile / like 多 store |
| 路由 | React Router v7 | 人格选择页 + 对话页 |
| 后端框架 | Node.js + Fastify | 高性能，原生支持 SSE |
| 实时通信 | SSE (Server-Sent Events) | 单连接推送 4 路人格流式响应 |
| HTTP 客户端 | fetch (Node 18+ 内置) | 调用各模型 API |
| 前端存储 | IndexedDB (via idb) | 对话历史 + 用户画像 + 人格点赞 |

## 项目结构

```
multi-ai-chat/
├── client/                    # 前端 SPA
│   ├── public/personas/       # 人格头像图片
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ModelSelectPage.tsx    # 人格选择页（含模型下拉）
│   │   │   └── ChatPage.tsx           # 对话页 (2×2 + 输入框)
│   │   ├── components/
│   │   │   ├── PersonaCard.tsx        # 人格选择卡片（头像、点赞、详情）
│   │   │   ├── PersonaInfoPopover.tsx # 人格详情浮层
│   │   │   ├── ModelDropdown.tsx      # 底层模型切换下拉
│   │   │   ├── ModelInfoPopover.tsx   # 模型详情浮层
│   │   │   ├── ChatGrid.tsx           # 2×2 网格容器
│   │   │   ├── ChatPanel.tsx          # 单个人格对话框（流式渲染 + 点赞）
│   │   │   ├── ChatInput.tsx          # 底部输入框 + 推荐问题
│   │   │   └── Sidebar.tsx            # 历史对话侧边栏
│   │   ├── stores/                    # Zustand 状态
│   │   ├── services/                  # SSE 客户端、画像、推荐服务
│   │   └── db/                        # IndexedDB 封装
│   └── vite.config.ts
├── server/                    # 后端服务
│   ├── src/
│   │   ├── index.ts                   # Fastify 入口
│   │   ├── routes/
│   │   │   ├── chat.ts                # POST /api/chat (SSE)
│   │   │   ├── profile.ts             # POST /api/profile (画像)
│   │   │   └── recommend.ts           # POST /api/recommend (推荐问题)
│   │   ├── services/
│   │   │   ├── modelDispatcher.ts     # 多人格单次调用 + 流式解析
│   │   │   ├── modelAdapters/         # 统一 OpenAI 兼容适配器
│   │   │   ├── profileAgent.ts        # 用户画像生成 Agent
│   │   │   └── recommendAgent.ts      # 推荐问题生成 Agent
│   │   └── config/                    # 环境变量与 API Key
│   └── .env.example
├── shared/
│   └── types.ts               # 前后端共享类型、模型池、人格池
└── package.json
```

### 预设人格池（15 个）

| 分类 | ID | 名称 |
|------|-----|------|
| 个性人格 | `empathetic` | 高情商共情暖男 |
| | `humorous` | 幽默搞笑最佳损友 |
| | `warm` | 暖心温柔治愈大姐姐 |
| | `rational` | 硬核理性理工大佬 |
| | `professional` | 稳重职场精英 |
| | `scholar` | 博学儒雅学者导师 |
| | `zen` | 佛系随和倾听者 |
| | `sharp` | 毒舌清醒观察员 |
| | `creative` | 创意脑洞艺术家 |
| | `coach` | 严格自律监督教练 |
| 名人人格 | `musk` | 马斯克 |
| | `trump` | 特朗普 |
| 传统人格 | `ancestor` | 中华国学圣贤 |
| | `buddhist` | 佛教大乘法师 |
| | `matchmaker` | 月老·姻缘大师 |

### 预设模型池（10 个）

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

默认模型：`qwen3.7-max`

## 架构与数据流

### 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | ModelSelectPage | 从人格池中选择 4 个人格，切换底层模型 |
| `/chat` | ChatPage | 2×2 对话网格，可切换模型 |

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
3. POST /api/chat { model, personas, messages, userProfile }
    │
    ▼
4. sseClient 建立 SSE 连接
    │
    ▼
5. 后端单次调用底层模型，按 <<<personaId>>> 标记解析流
    │
    ▼
6. 收到 chunk → chatStore.appendChunk → ChatPanel 流式渲染
    │
    ▼
7. 收到 done × 4 → 持久化到 IndexedDB
    │
    └─ 轮数 % 5 === 0 → 触发 profileService.updateProfile()
```

### 多人格解析机制

后端将 4 个人格的 system prompt 合并为一次请求，要求模型按 `<<<personaId>>>` 分隔符顺序输出各人格回复。`PersonaStreamParser` 在流式过程中实时解析分隔符，将文本片段路由到对应人格的 SSE 通道。

### 核心类型 (`shared/types.ts`)

```typescript
type PersonaId = 'empathetic' | 'humorous' | ... | string;
type ModelId = 'qwen3.7-max' | 'qwen3.6-flash' | ... | string;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  personaId?: PersonaId;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  liked?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  selectedPersonas: PersonaId[];
  activeModel: ModelId;
  rounds: ChatRound[];
  createdAt: number;
  updatedAt: number;
}

interface UserProfile {
  version: number;
  generatedAt: number;
  roundCount: number;
  technicalProfile: { preferredPersonas; topicDistribution; avgMessageLength; activeHours };
  personalityProfile: { communicationStyle; thinkingPatterns; knowledgeGaps; interestsSummary };
}

interface SSEEvent {
  type: 'chunk' | 'done' | 'error';
  personaId: PersonaId;
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
| 卡片背景 | `#FFFFFF` | 对话框面板、输入框、人格卡片 |
| 主文字 | `#1A1A1A` | 标题、正文 |
| 次级文字 | `#8E8E93` | 时间戳、辅助说明 |
| 强调色 | `#0066FF` | 发送按钮、选中态、链接 |
| 分割线 | `#F0F0F0` | 网格分隔、列表分隔 |
| 网格色 | `#0066FF` / `#FF6B35` / `#00C781` / `#8B5CF6` | 四宫格标识 |
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
2. **少即是多** — 每个面板只显示人格名色条 + 消息内容
3. **留白优先** — 大面积留白，内容密度低
4. **色块标识 > 文字标识** — 用色彩区分 4 个人格
5. **无衬线纯文字** — 全界面不使用衬线字体

### 人格选择页布局

```
┌──────────────────────────┐
│ Multi-AI Chat  [模型▼] 历史│  ← 顶部栏
├──────────────────────────┤
│ 选择你的 AI 人格          │
│ 挑选 4 个人格同时对话      │
│                          │
│ 个性人格                  │
│ ┌────────┐ ┌────────┐   │
│ │ 人格 1 │ │ 人格 2 │   │  ← 2 列网格卡片
│ └────────┘ └────────┘   │
│ 名人人格 / 传统人格 ...    │
├──────────────────────────┤
│      [ 开始对话 ]         │  ← 底部固定按钮
└──────────────────────────┘
```

### 对话页布局

```
┌──────────────────────────┐
│  ← 返回  对话标题  [模型▼]历史│  ← 顶部栏 48px
├────────────┬─────────────┤
│  人格 1    │  人格 2     │
│  (左上)    │  (右上)     │  ← 四宫格，白色面板
├────────────┼─────────────┤
│  人格 3    │  人格 4     │
│  (左下)    │  (右下)     │
├────────────┴─────────────┤
│ [推荐问题1] [推荐问题2]... │  ← 新会话推荐（可横滑）
│  [输入框.........] [发送] │  ← 底部输入栏 56px
└──────────────────────────┘
```

## API 参考

### `GET /api/health`

健康检查，返回 `{ "status": "ok" }`。

### `POST /api/chat`

流式对话接口，返回 SSE 流（`Content-Type: text/event-stream`）。

**请求体：**

```json
{
  "model": "qwen3.7-max",
  "personas": ["empathetic", "humorous", "rational", "sharp"],
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "...", "personaId": "empathetic" }
  ],
  "userProfile": { "technicalProfile": {}, "personalityProfile": {} }
}
```

**SSE 事件格式：**

```json
{ "type": "chunk", "personaId": "empathetic", "content": "增量文本" }
{ "type": "done", "personaId": "empathetic" }
{ "type": "error", "personaId": "empathetic", "error": "错误信息" }
```

**消息构建规则：**

- 将 4 个人格的 system prompt 合并为单次请求，注入用户画像
- 历史 assistant 消息按 `<<<personaId>>>` 标记拼接，保持各人格独立上下文
- 流式输出由 `PersonaStreamParser` 实时解析分隔符，分路推送 SSE

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

- 技术画像：新数据加权 0.4，旧数据加权 0.6（含 `preferredPersonas` 等人格偏好）
- 人格画像：将新旧画像 + 本轮对话一起发给 LLM 合并更新

### `POST /api/recommend`

推荐问题生成接口，新会话开场时调用。

**请求体：**

```json
{
  "userProfile": {}
}
```

**响应：**

```json
{
  "questions": ["问题1", "问题2", "问题3"]
}
```

无用户画像时返回冷启动固定推荐（`COLD_START_RECOMMENDATIONS`）；有画像时由 Agent 按 follow-up / explore / challenge 三类生成个性化问题。

## 数据存储

后端无状态，所有用户数据由前端 IndexedDB 管理。

```
Database: multi-ai-chat (version 3)
├── ObjectStore: sessions (keyPath: id)
│   └── 索引: by-updatedAt
├── ObjectStore: profiles (keyPath: version)
└── ObjectStore: personaLikes (keyPath: personaId)
```

| 接口 | 说明 |
|------|------|
| `saveSession` / `getSession` / `listSessions` / `deleteSession` | 会话 CRUD |
| `saveProfile` / `getProfile` | 画像读写 |
| `getAllPersonaLikes` / `incrementPersonaLike` | 人格点赞统计 |

## 开发路线图

### Phase 1 — 核心骨架 (MVP)

- [x] 项目脚手架（Vite + Fastify + Tailwind）
- [x] 人格选择页面 UI
- [x] 2×2 对话网格布局
- [x] 后端 `/api/chat` SSE 接口
- [x] 前端 SSE 客户端 + 流式渲染

### Phase 2 — 多模型与人格

- [x] 多平台模型适配器
- [x] 多人格单次调用 + 流式分隔符解析
- [x] IndexedDB 对话历史存取
- [x] 历史会话侧边栏
- [x] 底层模型下拉切换

### Phase 3 — 用户画像与推荐

- [x] 画像 Agent Prompt 设计
- [x] 后端 `/api/profile` 接口
- [x] 前端 5 轮触发逻辑
- [x] 画像注入 system prompt
- [x] 推荐问题 Agent + `/api/recommend` 接口
- [x] 新会话推荐问题横滑展示

### Phase 4 — 交互打磨

- [x] 人格卡片（头像、详情浮层、点赞展示）
- [x] 对话面板回复点赞
- [ ] 移动端响应式适配
- [ ] 错误处理（API 超时、Key 失效等）
- [ ] 加载状态与空状态 UI
- [ ] 性能优化（对话多时考虑虚拟列表）

## 设计约束

1. **无状态后端** — 后端不存储对话数据，仅作 API 代理 + Agent 生成
2. **SSE 单连接** — 一次对话使用一个 SSE 连接，通过 `personaId` 区分 4 路流
3. **单次模型调用** — 4 个人格共享一个底层模型请求，靠分隔符协议分路，降低 API 成本
4. **画像隐私** — 用户画像仅存储在本地浏览器，后端用完即丢弃
5. **移动端优先** — 所有 CSS 以 max-width: 430px 为基准，PC 端居中显示
6. **网络容错** — 模型 API 失败时 4 个面板均显示错误提示
7. **可扩展** — 预留数据库接入点，未来可改为服务端存储

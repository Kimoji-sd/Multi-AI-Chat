import { useEffect, useRef } from 'react';
import { ThumbsUp } from 'lucide-react';
import type { Message, ModelId } from '../types';
import { getModelConfig, GRID_COLORS } from '../types';
import { useLikeStore } from '../stores/likeStore';
import { useChatStore } from '../stores/chatStore';

interface ChatPanelProps {
  modelId: ModelId;
  modelIndex: number;
  messages: Message[];
  error?: string;
  cornerClass: string;
}

export function ChatPanel({
  modelId,
  modelIndex,
  messages,
  error,
  cornerClass,
}: ChatPanelProps) {
  const config = getModelConfig(modelId);
  const color = GRID_COLORS[modelIndex] ?? config?.avatarColor ?? '#0066FF';
  const scrollRef = useRef<HTMLDivElement>(null);
  const likeCount = useLikeStore((s) => s.likes[modelId] ?? 0);
  const likeMessage = useChatStore((s) => s.likeMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLike = (msg: Message) => {
    if (msg.liked || msg.isStreaming || !msg.content) return;
    void likeMessage(msg.id);
  };

  return (
    <div className={`flex flex-col h-full min-h-0 bg-card border border-divider overflow-hidden ${cornerClass}`}>
      <div className="h-1 shrink-0" style={{ backgroundColor: color }} />
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <span className="text-xs font-medium text-secondary truncate">
          {config?.displayName ?? modelId}
        </span>
        <div className="flex items-center gap-1 text-secondary shrink-0 ml-2">
          <ThumbsUp className="w-3 h-3" />
          <span className="text-xs tabular-nums">{likeCount}</span>
        </div>
      </div>
      <div ref={scrollRef} className="panel-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 space-y-3">
        {messages.length === 0 && !error && (
          <p className="text-[13px] text-secondary text-center mt-4">等待消息...</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`animate-slide-up ${
              msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'
            }`}
          >
            {msg.role === 'user' ? (
              <div className="text-[15px] leading-relaxed px-3 py-2 rounded-element max-w-[80%] whitespace-pre-wrap break-words bg-accent text-white">
                {msg.content}
              </div>
            ) : (
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="text-[15px] leading-relaxed px-3 py-2 rounded-element whitespace-pre-wrap break-words bg-input text-primary w-full">
                  {msg.content}
                  {msg.isStreaming && (
                    <span
                      className="inline-block w-px h-4 ml-0.5 align-middle animate-blink"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </div>
                {!msg.isStreaming && msg.content && (
                  <button
                    type="button"
                    onClick={() => handleLike(msg)}
                    disabled={msg.liked || isStreaming}
                    className={`mt-1 flex items-center gap-1 px-1.5 py-0.5 rounded-element text-xs transition-all duration-200 ${
                      msg.liked
                        ? 'text-accent cursor-default'
                        : 'text-secondary hover:text-accent hover:bg-input'
                    }`}
                    aria-label={msg.liked ? '已点赞' : '点赞'}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${msg.liked ? 'fill-current' : ''}`} />
                    <span>{msg.liked ? '已赞' : '赞'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {error && (
          <div className="text-[13px] text-error px-2 py-1 rounded-element bg-red-50">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

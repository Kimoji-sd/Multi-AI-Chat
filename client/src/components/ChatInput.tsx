import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useProfileStore } from '../stores/profileStore';
import { streamChat } from '../services/sseClient';
import { shouldUpdateProfile, updateProfile } from '../services/profileService';

export function ChatInput() {
  const [input, setInput] = useState('');
  const isStreaming = useChatStore((s) => s.isStreaming);
  const selectedModels = useChatStore((s) => s.selectedModels);
  const profile = useProfileStore((s) => s.profile);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isStreaming) return;

    setInput('');
    useChatStore.getState().addUserMessage(content);

    try {
      await streamChat({
        models: selectedModels,
        messages: useChatStore.getState().getFlatMessages(),
        userProfile: profile,
      });

      const roundCount = useChatStore.getState().rounds.length;
      if (shouldUpdateProfile(roundCount)) {
        await updateProfile(
          useChatStore.getState().rounds,
          profile,
          roundCount
        );
      }
    } catch (err) {
      console.error('Stream error:', err);
      useChatStore.setState({ isStreaming: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const hasContent = input.trim().length > 0;

  return (
    <div
      className={`shrink-0 h-14 flex items-center gap-3 px-4 bg-card border-t border-divider transition-opacity duration-200 ${
        isStreaming ? 'opacity-60' : ''
      }`}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        disabled={isStreaming}
        className="flex-1 h-10 px-4 rounded-element bg-input text-[15px] text-primary placeholder:text-secondary outline-none focus:ring-1 focus:ring-accent/30 transition-all duration-200"
      />
      <button
        type="button"
        onClick={() => void handleSend()}
        disabled={!hasContent || isStreaming}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
          hasContent && !isStreaming
            ? 'bg-accent text-white hover:scale-[1.02] hover:shadow-sm'
            : 'bg-divider text-secondary'
        }`}
      >
        {isStreaming ? (
          <Loader2 className="w-4 h-4 animate-spin-slow" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

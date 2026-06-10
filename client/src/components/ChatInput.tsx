import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useProfileStore } from '../stores/profileStore';
import { streamChat } from '../services/sseClient';
import { shouldUpdateProfile, updateProfile } from '../services/profileService';
import { fetchRecommendations } from '../services/recommendService';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const fetchedRef = useRef(false);

  const isStreaming = useChatStore((s) => s.isStreaming);
  const selectedModels = useChatStore((s) => s.selectedModels);
  const rounds = useChatStore((s) => s.rounds);
  const profile = useProfileStore((s) => s.profile);
  const profileLoading = useProfileStore((s) => s.isLoading);

  const isNewSession = rounds.length === 0;

  useEffect(() => {
    if (!isNewSession || profileLoading || fetchedRef.current) return;
    fetchedRef.current = true;

    const load = async () => {
      const questions = await fetchRecommendations(profile);
      setRecommendations(questions);
      setShowRecommendations(true);
    };

    void load();
  }, [isNewSession, profile, profileLoading]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isStreaming) return;

    setShowRecommendations(false);
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

  const handleRecommendationClick = (text: string) => {
    setInput(text);
    setShowRecommendations(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const hasContent = input.trim().length > 0;

  return (
    <div className="relative shrink-0">
      {showRecommendations && isNewSession && recommendations.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 -translate-y-3 z-10 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {recommendations.map((text, idx) => (
              <button
                key={idx}
                type="button"
                className="shrink-0 px-3 py-2 bg-input rounded-element text-sm text-primary whitespace-nowrap hover:bg-divider transition-colors border border-divider"
                onClick={() => handleRecommendationClick(text)}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`h-14 flex items-center gap-3 px-4 bg-card border-t border-divider transition-opacity duration-200 ${
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
    </div>
  );
}

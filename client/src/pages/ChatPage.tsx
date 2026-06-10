import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useProfileStore } from '../stores/profileStore';
import { useLikeStore } from '../stores/likeStore';
import { ChatGrid } from '../components/ChatGrid';
import { ChatInput } from '../components/ChatInput';
import { ModelDropdown } from '../components/ModelDropdown';
import { Sidebar } from '../components/Sidebar';

export function ChatPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const selectedPersonas = useChatStore((s) => s.selectedPersonas);
  const activeModel = useChatStore((s) => s.activeModel);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const currentSession = useChatStore((s) => s.currentSession);
  const loadSession = useChatStore((s) => s.loadSession);
  const setActiveModel = useChatStore((s) => s.setActiveModel);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const loadLikes = useLikeStore((s) => s.loadLikes);

  useEffect(() => {
    void loadProfile();
    void loadLikes();
  }, [loadProfile, loadLikes]);

  useEffect(() => {
    if (selectedPersonas.length === 0) {
      navigate('/');
    }
  }, [selectedPersonas, navigate]);

  if (selectedPersonas.length === 0) return null;

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden animate-fade-in">
      <div className="max-w-mobile mx-auto w-full h-full flex flex-col overflow-hidden">
        <header className="shrink-0 h-12 flex items-center justify-between gap-2 px-4 bg-card/80 backdrop-blur-sm border-b border-divider">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-1 text-primary hover:opacity-70 transition-opacity shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[15px] font-semibold truncate min-w-0 flex-1 text-center">
            {currentSession?.title ?? '新对话'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <ModelDropdown
              value={activeModel}
              onChange={setActiveModel}
              disabled={isStreaming}
            />
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-primary hover:opacity-70 transition-opacity"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        </header>

        <ChatGrid />
        <ChatInput />

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectSession={loadSession}
          currentSessionId={currentSession?.id}
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useProfileStore } from '../stores/profileStore';
import { useLikeStore } from '../stores/likeStore';
import { ChatGrid } from '../components/ChatGrid';
import { ChatInput } from '../components/ChatInput';
import { Sidebar } from '../components/Sidebar';

export function ChatPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const selectedModels = useChatStore((s) => s.selectedModels);
  const currentSession = useChatStore((s) => s.currentSession);
  const loadSession = useChatStore((s) => s.loadSession);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const loadLikes = useLikeStore((s) => s.loadLikes);

  useEffect(() => {
    void loadProfile();
    void loadLikes();
  }, [loadProfile, loadLikes]);

  useEffect(() => {
    if (selectedModels.length === 0) {
      navigate('/');
    }
  }, [selectedModels, navigate]);

  if (selectedModels.length === 0) return null;

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden animate-fade-in">
      <div className="max-w-mobile mx-auto w-full h-full flex flex-col overflow-hidden">
        <header className="shrink-0 h-12 flex items-center justify-between px-4 bg-card/80 backdrop-blur-sm border-b border-divider">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-1 text-primary hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[15px] font-semibold truncate max-w-[200px]">
            {currentSession?.title ?? '新对话'}
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-primary hover:opacity-70 transition-opacity"
          >
            <History className="w-5 h-5" />
          </button>
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

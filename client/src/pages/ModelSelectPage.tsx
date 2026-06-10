import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import { MODEL_POOL, type ChatSession } from '../types';
import { useModelStore } from '../stores/modelStore';
import { useChatStore } from '../stores/chatStore';
import { useLikeStore } from '../stores/likeStore';
import { ModelCard } from '../components/ModelCard';
import { Sidebar } from '../components/Sidebar';

export function ModelSelectPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedModels, toggleModel, setModels } = useModelStore();
  const likes = useLikeStore((s) => s.likes);
  const loadLikes = useLikeStore((s) => s.loadLikes);
  const loadSession = useChatStore((s) => s.loadSession);

  useEffect(() => {
    void loadLikes();
  }, [loadLikes]);

  const isFull = selectedModels.length >= 4;
  const canStart = selectedModels.length === 4;

  const handleStart = () => {
    if (!canStart) return;
    useChatStore.getState().setSelectedModels(selectedModels);
    useChatStore.getState().newSession(selectedModels);
    navigate('/chat');
  };

  const handleSelectSession = (session: ChatSession) => {
    loadSession(session);
    setModels(session.selectedModels);
    navigate('/chat');
  };

  return (
    <div className="min-h-dvh bg-background animate-fade-in">
      <div className="max-w-mobile mx-auto w-full">
        <header className="sticky top-0 z-30 h-12 flex items-center justify-between px-4 bg-card/80 backdrop-blur-sm border-b border-divider">
          <span className="text-[15px] font-semibold text-primary">Multi-AI Chat</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-primary hover:opacity-70 transition-opacity"
            aria-label="历史对话"
          >
            <History className="w-5 h-5" />
          </button>
        </header>

        <div className="px-4 pb-24">
          <header className="pt-8 pb-6">
            <h1 className="text-[32px] font-bold tracking-[-0.5px] text-primary leading-tight">
              Choose your AI squad
            </h1>
            <p className="text-[15px] text-secondary mt-2">Pick 4 models to chat with</p>
          </header>

          <div className="grid grid-cols-2 gap-3 pt-1 overflow-visible">
            {MODEL_POOL.map((model) => {
              const index = selectedModels.indexOf(model.id);
              const isSelected = index >= 0;
              const disabled = isFull && !isSelected;

              return (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={isSelected}
                  selectionIndex={index + 1}
                  disabled={disabled}
                  likeCount={likes[model.id] ?? 0}
                  onToggle={() => toggleModel(model.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm z-20">
        <div className="max-w-mobile mx-auto">
          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full h-14 rounded-element text-[15px] font-semibold transition-all duration-200 ${
              canStart
                ? 'bg-accent text-white hover:scale-[1.02] hover:shadow-sm'
                : 'bg-divider text-secondary cursor-not-allowed'
            }`}
          >
            Start Chat
          </button>
        </div>
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectSession={handleSelectSession}
      />
    </div>
  );
}

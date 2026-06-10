import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import { PERSONA_POOL, type ChatSession } from '../types';
import { usePersonaStore } from '../stores/personaStore';
import { useChatStore } from '../stores/chatStore';
import { useLikeStore } from '../stores/likeStore';
import { PersonaCard } from '../components/PersonaCard';
import { ModelDropdown } from '../components/ModelDropdown';
import { Sidebar } from '../components/Sidebar';

export function ModelSelectPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedPersonas, activeModel, togglePersona, setPersonas, setActiveModel } =
    usePersonaStore();
  const likes = useLikeStore((s) => s.likes);
  const loadLikes = useLikeStore((s) => s.loadLikes);
  const loadSession = useChatStore((s) => s.loadSession);

  useEffect(() => {
    void loadLikes();
  }, [loadLikes]);

  const isFull = selectedPersonas.length >= 4;
  const canStart = selectedPersonas.length === 4;

  const handleStart = () => {
    if (!canStart) return;
    useChatStore.getState().setSelectedPersonas(selectedPersonas);
    useChatStore.getState().setActiveModel(activeModel);
    useChatStore.getState().newSession(selectedPersonas, activeModel);
    navigate('/chat');
  };

  const handleSelectSession = (session: ChatSession) => {
    loadSession(session);
    setPersonas(session.selectedPersonas);
    setActiveModel(session.activeModel);
    navigate('/chat');
  };

  return (
    <div className="min-h-dvh bg-background animate-fade-in">
      <div className="max-w-mobile mx-auto w-full">
        <header className="sticky top-0 z-30 h-12 flex items-center justify-between gap-2 px-4 bg-card/80 backdrop-blur-sm border-b border-divider">
          <span className="text-[15px] font-semibold text-primary shrink-0">Multi-AI Chat</span>
          <div className="flex items-center gap-2 min-w-0">
            <ModelDropdown value={activeModel} onChange={setActiveModel} />
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-primary hover:opacity-70 transition-opacity shrink-0"
              aria-label="历史对话"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="px-4 pb-24">
          <header className="pt-6 pb-6">
            <h1 className="text-[32px] font-bold tracking-[-0.5px] text-primary leading-tight">
              选择你的 AI 人格
            </h1>
            <p className="text-[15px] text-secondary mt-2">挑选 4 个人格同时对话</p>
          </header>

          <div className="grid grid-cols-2 gap-3 pt-1 overflow-visible">
            {PERSONA_POOL.map((persona) => {
              const index = selectedPersonas.indexOf(persona.id);
              const isSelected = index >= 0;
              const disabled = isFull && !isSelected;

              return (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  isSelected={isSelected}
                  selectionIndex={index + 1}
                  disabled={disabled}
                  likeCount={likes[persona.id] ?? 0}
                  onToggle={() => togglePersona(persona.id)}
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
            开始对话
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

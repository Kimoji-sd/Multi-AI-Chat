import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MODEL_POOL } from '../types';
import { useModelStore } from '../stores/modelStore';
import { useChatStore } from '../stores/chatStore';
import { useLikeStore } from '../stores/likeStore';
import { ModelCard } from '../components/ModelCard';

export function ModelSelectPage() {
  const navigate = useNavigate();
  const { selectedModels, toggleModel } = useModelStore();
  const likes = useLikeStore((s) => s.likes);
  const loadLikes = useLikeStore((s) => s.loadLikes);

  useEffect(() => {
    void loadLikes();
  }, [loadLikes]);
  const setChatModels = useChatStore((s) => s.setSelectedModels);
  const newSession = useChatStore((s) => s.newSession);

  const isFull = selectedModels.length >= 4;
  const canStart = selectedModels.length === 4;

  const handleStart = () => {
    if (!canStart) return;
    setChatModels(selectedModels);
    newSession(selectedModels);
    navigate('/chat');
  };

  return (
    <div className="min-h-dvh bg-background animate-fade-in">
      <div className="max-w-mobile mx-auto px-4 pb-24">
        <header className="pt-10 pb-6">
          <h1 className="text-[32px] font-bold tracking-[-0.5px] text-primary leading-tight">
            Choose your AI squad
          </h1>
          <p className="text-[15px] text-secondary mt-2">Pick 4 models to chat with</p>
        </header>

        <div className="grid grid-cols-2 gap-3">
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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm">
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
    </div>
  );
}

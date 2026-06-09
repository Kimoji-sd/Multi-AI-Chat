import { ThumbsUp } from 'lucide-react';
import type { ModelConfig } from '../types';

interface ModelCardProps {
  model: ModelConfig;
  isSelected: boolean;
  selectionIndex: number;
  disabled: boolean;
  likeCount: number;
  onToggle: () => void;
}

export function ModelCard({
  model,
  isSelected,
  selectionIndex,
  disabled,
  likeCount,
  onToggle,
}: ModelCardProps) {
  const initials = model.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`
        relative w-full text-left p-4 rounded-card border transition-all duration-200
        ${isSelected ? 'border-current bg-white' : 'border-divider bg-card'}
        ${disabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}
      `}
      style={isSelected ? { borderColor: model.avatarColor, color: model.avatarColor } : undefined}
    >
      {isSelected && (
        <span
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium"
          style={{ backgroundColor: model.avatarColor }}
        >
          {selectionIndex}
        </span>
      )}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: model.avatarColor }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[15px] font-semibold text-primary truncate">{model.displayName}</div>
            <div className="flex items-center gap-0.5 text-secondary shrink-0">
              <ThumbsUp className="w-3 h-3" />
              <span className="text-xs tabular-nums">{likeCount}</span>
            </div>
          </div>
          <div className="text-[13px] text-secondary truncate">{model.description}</div>
        </div>
      </div>
    </button>
  );
}

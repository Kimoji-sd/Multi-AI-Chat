import { useState } from 'react';
import { ThumbsUp, Info } from 'lucide-react';
import type { ModelConfig } from '../types';
import { ModelInfoPopover } from './ModelInfoPopover';

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
  const [infoOpen, setInfoOpen] = useState(false);

  const initials = model.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`
        relative overflow-visible rounded-card border transition-all duration-200
        ${isSelected ? 'border-current bg-white' : 'border-divider bg-card'}
        ${disabled && !isSelected ? 'opacity-40' : ''}
      `}
      style={isSelected ? { borderColor: model.avatarColor, color: model.avatarColor } : undefined}
    >
      {isSelected && (
        <span
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold z-30 shadow-sm ring-2 ring-card"
          style={{ backgroundColor: model.avatarColor }}
        >
          {selectionIndex}
        </span>
      )}

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`w-full text-left p-4 pr-11 transition-all duration-200 ${
          disabled && !isSelected ? 'cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
            style={{ backgroundColor: model.avatarColor }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold text-primary truncate">
              {model.displayName}
            </div>
            <div className="text-[13px] text-secondary truncate mt-0.5">{model.provider}</div>
          </div>
        </div>
      </button>

      <div className="absolute top-1/2 -translate-y-1/2 right-3 z-20 flex flex-col items-end gap-2">
        <div className="flex items-center gap-0.5 text-secondary leading-none">
          <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs tabular-nums">{likeCount}</span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInfoOpen((v) => !v);
            }}
            className="p-0.5 rounded-full text-secondary hover:text-accent hover:bg-input transition-colors duration-200 leading-none"
            aria-label={`查看 ${model.displayName} 详细介绍`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <ModelInfoPopover
            model={model}
            open={infoOpen}
            onClose={() => setInfoOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}

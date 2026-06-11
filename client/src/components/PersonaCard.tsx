import { useRef, useState } from 'react';
import { ThumbsUp, Info } from 'lucide-react';
import type { PersonaConfig } from '../types';
import { getPersonaAvatarUrl } from '../types';
import { PersonaInfoPopover } from './PersonaInfoPopover';

interface PersonaCardProps {
  persona: PersonaConfig;
  isSelected: boolean;
  selectionIndex: number;
  disabled: boolean;
  likeCount: number;
  onToggle: () => void;
}

export function PersonaCard({
  persona,
  isSelected,
  selectionIndex,
  disabled,
  likeCount,
  onToggle,
}: PersonaCardProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const initials = persona.displayName.slice(0, 2);
  const showAvatarImage = !avatarError;

  return (
    <div
      className={`
        relative overflow-visible rounded-card border transition-all duration-200
        ${isSelected ? 'border-current bg-white' : 'border-divider bg-card'}
        ${disabled && !isSelected ? 'opacity-40' : ''}
      `}
      style={isSelected ? { borderColor: persona.avatarColor, color: persona.avatarColor } : undefined}
    >
      {isSelected && (
        <span
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold z-30 shadow-sm ring-2 ring-card"
          style={{ backgroundColor: persona.avatarColor }}
        >
          {selectionIndex}
        </span>
      )}

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`w-full text-left p-2.5 pr-11 transition-all duration-200 ${
          disabled && !isSelected ? 'cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-input">
            {showAvatarImage ? (
              <img
                src={getPersonaAvatarUrl(persona.id)}
                alt={persona.displayName}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: persona.avatarColor }}
              >
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-primary line-clamp-2 leading-snug">
              {persona.displayName}
            </div>
          </div>
        </div>
      </button>

      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-0.5 text-secondary leading-none">
          <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
          <span className="text-sm tabular-nums">{likeCount}</span>
        </div>
        <div className="relative">
          <button
            ref={infoButtonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInfoOpen((v) => !v);
            }}
            className="p-0.5 rounded-full text-secondary hover:text-accent hover:bg-input transition-colors duration-200 leading-none"
            aria-label={`查看 ${persona.displayName} 详细介绍`}
          >
            <Info className="w-4 h-4" />
          </button>
          <PersonaInfoPopover
            persona={persona}
            open={infoOpen}
            onClose={() => setInfoOpen(false)}
            anchorRef={infoButtonRef}
          />
        </div>
      </div>
    </div>
  );
}

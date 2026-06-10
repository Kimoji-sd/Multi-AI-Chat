import { useEffect, useRef } from 'react';
import type { ModelConfig } from '../types';

interface ModelInfoPopoverProps {
  model: ModelConfig;
  open: boolean;
  onClose: () => void;
}

export function ModelInfoPopover({ model, open, onClose }: ModelInfoPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={`${model.displayName} 详细介绍`}
        className="absolute bottom-full right-0 mb-2 z-50 w-[calc(100vw-2rem)] max-w-[220px] p-3 rounded-element bg-card border border-divider shadow-sm animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[14px] font-semibold text-primary">{model.displayName}</div>
        <div className="text-[12px] text-secondary mt-0.5">{model.provider}</div>
        <p className="text-[13px] text-primary mt-2 leading-relaxed">{model.detail}</p>
      </div>
    </>
  );
}

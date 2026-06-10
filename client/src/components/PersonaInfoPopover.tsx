import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PersonaConfig } from '../types';

interface PersonaInfoPopoverProps {
  persona: PersonaConfig;
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

interface PopoverPosition {
  top: number;
  right: number;
}

function getPopoverPosition(anchor: HTMLElement): PopoverPosition {
  const rect = anchor.getBoundingClientRect();
  return {
    top: rect.top - 8,
    right: window.innerWidth - rect.right,
  };
}

export function PersonaInfoPopover({
  persona,
  open,
  onClose,
  anchorRef,
}: PersonaInfoPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, right: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      if (anchorRef.current) {
        setPosition(getPopoverPosition(anchorRef.current));
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" aria-hidden />
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={`${persona.displayName} 详细介绍`}
        className="fixed z-50 w-[calc(100vw-2rem)] max-w-[170px] p-2.5 rounded-element bg-card border border-divider shadow-sm animate-fade-in"
        style={{
          top: position.top,
          right: position.right,
          transform: 'translateY(-100%)',
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="text-[12px] font-semibold text-primary">{persona.displayName}</div>
        <p className="text-[11px] text-primary mt-1.5 leading-relaxed">{persona.description}</p>
        <div className="text-[10px] text-secondary mt-1.5">
          <span className="font-medium">适用：</span>
          {persona.useCases}
        </div>
      </div>
    </>,
    document.body
  );
}

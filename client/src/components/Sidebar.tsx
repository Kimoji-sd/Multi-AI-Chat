import { X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ChatSession } from '../types';
import { listSessions, deleteSession } from '../db/indexedDB';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (session: ChatSession) => void;
  currentSessionId?: string;
}

export function Sidebar({
  isOpen,
  onClose,
  onSelectSession,
  currentSessionId,
}: SidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const loadSessions = async () => {
    const list = await listSessions();
    setSessions(list);
  };

  useEffect(() => {
    if (isOpen) void loadSessions();
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteSession(id);
    await loadSessions();
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-card z-50 shadow-sm transform transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-divider">
          <span className="text-[15px] font-semibold">历史对话</span>
          <button type="button" onClick={onClose} className="p-1 text-secondary hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-48px)]">
          {sessions.length === 0 ? (
            <p className="text-[13px] text-secondary text-center py-8">暂无历史对话</p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  onSelectSession(session);
                  onClose();
                }}
                className={`w-full text-left px-4 py-3 border-b border-divider transition-colors duration-200 group ${
                  session.id === currentSessionId ? 'bg-accent/5' : 'hover:bg-input/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-medium truncate">{session.title}</div>
                    <div className="text-[13px] text-secondary mt-1">
                      {formatDate(session.updatedAt)} · {session.rounds.length} 轮
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => void handleDelete(e, session.id)}
                    className="p-1 text-secondary opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}

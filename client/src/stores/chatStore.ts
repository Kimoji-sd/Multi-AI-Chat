import { create } from 'zustand';
import type {
  ChatRound,
  ChatSession,
  Message,
  ModelId,
} from '../types';
import { saveSession } from '../db/indexedDB';
import { useLikeStore } from './likeStore';

function generateId(): string {
  return crypto.randomUUID();
}

interface ChatStore {
  currentSession: ChatSession | null;
  selectedModels: ModelId[];
  rounds: ChatRound[];
  isStreaming: boolean;
  pendingDoneModels: Set<string>;
  errorByModel: Record<string, string>;

  setSelectedModels: (models: ModelId[]) => void;
  addUserMessage: (content: string) => void;
  appendChunk: (modelId: ModelId, content: string) => void;
  markModelDone: (modelId: ModelId) => void;
  setModelError: (modelId: ModelId, error: string) => void;
  completeRound: () => Promise<void>;
  loadSession: (session: ChatSession) => void;
  newSession: (models: ModelId[]) => void;
  getFlatMessages: () => Message[];
  likeMessage: (messageId: string) => Promise<boolean>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSession: null,
  selectedModels: [],
  rounds: [],
  isStreaming: false,
  pendingDoneModels: new Set(),
  errorByModel: {},

  setSelectedModels: (models) => set({ selectedModels: models }),

  addUserMessage: (content) => {
    const { selectedModels, currentSession, rounds } = get();
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantMessages: Message[] = selectedModels.map((modelId) => ({
      id: generateId(),
      role: 'assistant' as const,
      modelId,
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    }));

    const round: ChatRound = {
      id: generateId(),
      userMessage,
      assistantMessages,
      timestamp: Date.now(),
    };

    const title =
      currentSession?.title ??
      (content.length > 30 ? content.slice(0, 30) + '...' : content);

    const session: ChatSession = currentSession ?? {
      id: generateId(),
      title,
      selectedModels,
      rounds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set({
      currentSession: { ...session, title },
      rounds: [...rounds, round],
      isStreaming: true,
      pendingDoneModels: new Set(selectedModels),
      errorByModel: {},
    });
  },

  appendChunk: (modelId, content) => {
    set((state) => {
      const rounds = [...state.rounds];
      const lastRound = rounds[rounds.length - 1];
      if (!lastRound) return state;

      const assistantMessages = lastRound.assistantMessages.map((msg) =>
        msg.modelId === modelId
          ? { ...msg, content: msg.content + content }
          : msg
      );

      rounds[rounds.length - 1] = { ...lastRound, assistantMessages };
      return { rounds };
    });
  },

  markModelDone: (modelId) => {
    set((state) => {
      const rounds = [...state.rounds];
      const lastRound = rounds[rounds.length - 1];
      if (lastRound) {
        const assistantMessages = lastRound.assistantMessages.map((msg) =>
          msg.modelId === modelId ? { ...msg, isStreaming: false } : msg
        );
        rounds[rounds.length - 1] = { ...lastRound, assistantMessages };
      }

      const pendingDoneModels = new Set(state.pendingDoneModels);
      pendingDoneModels.delete(modelId);

      return { rounds, pendingDoneModels };
    });

    const { pendingDoneModels } = get();
    if (pendingDoneModels.size === 0) {
      void get().completeRound();
    }
  },

  setModelError: (modelId, error) => {
    set((state) => ({
      errorByModel: { ...state.errorByModel, [modelId]: error },
    }));
  },

  completeRound: async () => {
    const { currentSession, rounds, selectedModels } = get();
    if (!currentSession) return;

    const session: ChatSession = {
      ...currentSession,
      selectedModels,
      rounds,
      updatedAt: Date.now(),
    };

    await saveSession(session);
    set({ currentSession: session, isStreaming: false });
  },

  loadSession: (session) => {
    set({
      currentSession: session,
      selectedModels: session.selectedModels,
      rounds: session.rounds,
      isStreaming: false,
      pendingDoneModels: new Set(),
      errorByModel: {},
    });
  },

  newSession: (models) => {
    set({
      currentSession: null,
      selectedModels: models,
      rounds: [],
      isStreaming: false,
      pendingDoneModels: new Set(),
      errorByModel: {},
    });
  },

  getFlatMessages: () => {
    const { rounds } = get();
    const messages: Message[] = [];
    for (const round of rounds) {
      messages.push(round.userMessage);
      messages.push(...round.assistantMessages.filter((m) => m.content));
    }
    return messages;
  },

  likeMessage: async (messageId) => {
    const { rounds, currentSession, selectedModels } = get();
    let targetModelId: ModelId | undefined;
    let found = false;

    const updatedRounds = rounds.map((round) => ({
      ...round,
      assistantMessages: round.assistantMessages.map((msg) => {
        if (msg.id !== messageId) return msg;
        if (msg.liked || msg.isStreaming || !msg.content || !msg.modelId) return msg;
        found = true;
        targetModelId = msg.modelId;
        return { ...msg, liked: true };
      }),
    }));

    if (!found || !targetModelId) return false;

    set({ rounds: updatedRounds });

    if (currentSession) {
      const session: ChatSession = {
        ...currentSession,
        selectedModels,
        rounds: updatedRounds,
        updatedAt: Date.now(),
      };
      await saveSession(session);
      set({ currentSession: session });
    }

    await useLikeStore.getState().addLike(targetModelId);
    return true;
  },
}));

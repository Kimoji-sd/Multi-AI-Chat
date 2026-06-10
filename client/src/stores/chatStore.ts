import { create } from 'zustand';
import type {
  ChatRound,
  ChatSession,
  Message,
  ModelId,
  PersonaId,
} from '../types';
import { DEFAULT_MODEL_ID } from '../types';
import { saveSession } from '../db/indexedDB';
import { useLikeStore } from './likeStore';

function generateId(): string {
  return crypto.randomUUID();
}

interface ChatStore {
  currentSession: ChatSession | null;
  selectedPersonas: PersonaId[];
  activeModel: ModelId;
  rounds: ChatRound[];
  isStreaming: boolean;
  pendingDonePersonas: Set<string>;
  errorByPersona: Record<string, string>;

  setSelectedPersonas: (personas: PersonaId[]) => void;
  setActiveModel: (model: ModelId) => void;
  addUserMessage: (content: string) => void;
  appendChunk: (personaId: PersonaId, content: string) => void;
  markPersonaDone: (personaId: PersonaId) => void;
  setPersonaError: (personaId: PersonaId, error: string) => void;
  completeRound: () => Promise<void>;
  loadSession: (session: ChatSession) => void;
  newSession: (personas: PersonaId[], model: ModelId) => void;
  getFlatMessages: () => Message[];
  likeMessage: (messageId: string) => Promise<boolean>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSession: null,
  selectedPersonas: [],
  activeModel: DEFAULT_MODEL_ID,
  rounds: [],
  isStreaming: false,
  pendingDonePersonas: new Set(),
  errorByPersona: {},

  setSelectedPersonas: (personas) => set({ selectedPersonas: personas }),

  setActiveModel: (model) => {
    set({ activeModel: model });
    const { currentSession } = get();
    if (currentSession) {
      set({ currentSession: { ...currentSession, activeModel: model } });
    }
  },

  addUserMessage: (content) => {
    const { selectedPersonas, activeModel, currentSession, rounds } = get();
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantMessages: Message[] = selectedPersonas.map((personaId) => ({
      id: generateId(),
      role: 'assistant' as const,
      personaId,
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
      selectedPersonas,
      activeModel,
      rounds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set({
      currentSession: { ...session, title },
      rounds: [...rounds, round],
      isStreaming: true,
      pendingDonePersonas: new Set(selectedPersonas),
      errorByPersona: {},
    });
  },

  appendChunk: (personaId, content) => {
    set((state) => {
      const rounds = [...state.rounds];
      const lastRound = rounds[rounds.length - 1];
      if (!lastRound) return state;

      const assistantMessages = lastRound.assistantMessages.map((msg) =>
        msg.personaId === personaId
          ? { ...msg, content: msg.content + content }
          : msg
      );

      rounds[rounds.length - 1] = { ...lastRound, assistantMessages };
      return { rounds };
    });
  },

  markPersonaDone: (personaId) => {
    set((state) => {
      const rounds = [...state.rounds];
      const lastRound = rounds[rounds.length - 1];
      if (lastRound) {
        const assistantMessages = lastRound.assistantMessages.map((msg) =>
          msg.personaId === personaId ? { ...msg, isStreaming: false } : msg
        );
        rounds[rounds.length - 1] = { ...lastRound, assistantMessages };
      }

      const pendingDonePersonas = new Set(state.pendingDonePersonas);
      pendingDonePersonas.delete(personaId);

      return { rounds, pendingDonePersonas };
    });

    const { pendingDonePersonas } = get();
    if (pendingDonePersonas.size === 0) {
      void get().completeRound();
    }
  },

  setPersonaError: (personaId, error) => {
    set((state) => ({
      errorByPersona: { ...state.errorByPersona, [personaId]: error },
    }));
  },

  completeRound: async () => {
    const { currentSession, rounds, selectedPersonas, activeModel } = get();
    if (!currentSession) return;

    const session: ChatSession = {
      ...currentSession,
      selectedPersonas,
      activeModel,
      rounds,
      updatedAt: Date.now(),
    };

    await saveSession(session);
    set({ currentSession: session, isStreaming: false });
  },

  loadSession: (session) => {
    set({
      currentSession: session,
      selectedPersonas: session.selectedPersonas,
      activeModel: session.activeModel ?? DEFAULT_MODEL_ID,
      rounds: session.rounds,
      isStreaming: false,
      pendingDonePersonas: new Set(),
      errorByPersona: {},
    });
  },

  newSession: (personas, model) => {
    set({
      currentSession: null,
      selectedPersonas: personas,
      activeModel: model,
      rounds: [],
      isStreaming: false,
      pendingDonePersonas: new Set(),
      errorByPersona: {},
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
    const { rounds, currentSession, selectedPersonas, activeModel } = get();
    let targetPersonaId: PersonaId | undefined;
    let found = false;

    const updatedRounds = rounds.map((round) => ({
      ...round,
      assistantMessages: round.assistantMessages.map((msg) => {
        if (msg.id !== messageId) return msg;
        if (msg.liked || msg.isStreaming || !msg.content || !msg.personaId) return msg;
        found = true;
        targetPersonaId = msg.personaId;
        return { ...msg, liked: true };
      }),
    }));

    if (!found || !targetPersonaId) return false;

    set({ rounds: updatedRounds });

    if (currentSession) {
      const session: ChatSession = {
        ...currentSession,
        selectedPersonas,
        activeModel,
        rounds: updatedRounds,
        updatedAt: Date.now(),
      };
      await saveSession(session);
      set({ currentSession: session });
    }

    await useLikeStore.getState().addLike(targetPersonaId);
    return true;
  },
}));

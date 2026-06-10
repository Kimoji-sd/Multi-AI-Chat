import type { PersonaId } from '../types';
import { useChatStore } from '../stores/chatStore';
import { ChatPanel } from './ChatPanel';

export function ChatGrid() {
  const selectedPersonas = useChatStore((s) => s.selectedPersonas);
  const rounds = useChatStore((s) => s.rounds);
  const errorByPersona = useChatStore((s) => s.errorByPersona);

  const getPanelMessages = (personaId: PersonaId) => {
    const messages: ReturnType<typeof useChatStore.getState>['rounds'][0]['assistantMessages'] = [];
    for (const round of rounds) {
      messages.push(round.userMessage);
      const assistant = round.assistantMessages.find((m) => m.personaId === personaId);
      if (assistant) messages.push(assistant);
    }
    return messages;
  };

  const corners = [
    'rounded-tl-card',
    'rounded-tr-card border-l-0',
    'rounded-bl-card border-t-0',
    'rounded-br-card border-l-0 border-t-0',
  ];

  return (
    <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-2 grid-rows-2 gap-0">
      {selectedPersonas.map((personaId, index) => (
        <ChatPanel
          key={personaId}
          personaId={personaId}
          personaIndex={index}
          messages={getPanelMessages(personaId)}
          error={errorByPersona[personaId]}
          cornerClass={corners[index] ?? ''}
        />
      ))}
    </div>
  );
}

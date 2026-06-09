import type { ModelId } from '../types';
import { useChatStore } from '../stores/chatStore';
import { ChatPanel } from './ChatPanel';

export function ChatGrid() {
  const selectedModels = useChatStore((s) => s.selectedModels);
  const rounds = useChatStore((s) => s.rounds);
  const errorByModel = useChatStore((s) => s.errorByModel);

  const getPanelMessages = (modelId: ModelId) => {
    const messages: ReturnType<typeof useChatStore.getState>['rounds'][0]['assistantMessages'] = [];
    for (const round of rounds) {
      messages.push(round.userMessage);
      const assistant = round.assistantMessages.find((m) => m.modelId === modelId);
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
      {selectedModels.map((modelId, index) => (
        <ChatPanel
          key={modelId}
          modelId={modelId}
          modelIndex={index}
          messages={getPanelMessages(modelId)}
          error={errorByModel[modelId]}
          cornerClass={corners[index] ?? ''}
        />
      ))}
    </div>
  );
}

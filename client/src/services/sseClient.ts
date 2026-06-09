import type { ChatRequest, SSEEvent } from '../types';
import { useChatStore } from '../stores/chatStore';

export async function streamChat(requestBody: ChatRequest): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      for (const line of part.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            const event: SSEEvent = JSON.parse(line.slice(6));
            handleSSEEvent(event);
          } catch {
            // ignore malformed events
          }
        }
      }
    }
  }
}

function handleSSEEvent(event: SSEEvent): void {
  const store = useChatStore.getState();

  if (event.type === 'chunk' && event.content) {
    store.appendChunk(event.modelId, event.content);
  } else if (event.type === 'done') {
    store.markModelDone(event.modelId);
  } else if (event.type === 'error' && event.error) {
    store.setModelError(event.modelId, event.error);
    store.markModelDone(event.modelId);
  }
}

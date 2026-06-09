import type { ChatMessage } from '../../../../shared/types.js';

export interface ModelAdapter {
  streamChat(messages: ChatMessage[], onChunk: (text: string) => void): Promise<void>;
}

export async function readStreamBody(
  body: ReadableStream<Uint8Array> | null,
  onLine: (line: string) => void
): Promise<void> {
  if (!body) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      onLine(line);
    }
  }
  if (buffer) onLine(buffer);
}

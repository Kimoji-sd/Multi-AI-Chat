import type { FastifyReply } from 'fastify';
import type { SSEEvent } from '../../../shared/types.js';

export function initSSE(reply: FastifyReply): void {
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
}

export function sendSSE(reply: FastifyReply, event: SSEEvent): void {
  reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function endSSE(reply: FastifyReply): void {
  reply.raw.end();
}

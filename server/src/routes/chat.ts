import type { FastifyInstance } from 'fastify';
import type { ChatRequest } from '../../../shared/types.js';
import { dispatchChat } from '../services/modelDispatcher.js';
import { initSSE, endSSE } from '../utils/sse.js';

export async function chatRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: ChatRequest }>('/api/chat', async (request, reply) => {
    const { model, personas, messages, userProfile } = request.body;

    if (!model || !personas?.length || !messages?.length) {
      return reply.status(400).send({ error: 'model, personas and messages are required' });
    }

    initSSE(reply);

    try {
      await dispatchChat(model, personas, messages, userProfile, reply);
    } finally {
      endSSE(reply);
    }
  });
}

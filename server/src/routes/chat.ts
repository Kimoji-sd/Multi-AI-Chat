import type { FastifyInstance } from 'fastify';
import type { ChatRequest } from '../../../shared/types.js';
import { dispatchChat } from '../services/modelDispatcher.js';
import { initSSE, endSSE } from '../utils/sse.js';

export async function chatRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: ChatRequest }>('/api/chat', async (request, reply) => {
    const { models, messages, userProfile } = request.body;

    if (!models?.length || !messages?.length) {
      return reply.status(400).send({ error: 'models and messages are required' });
    }

    initSSE(reply);

    try {
      await dispatchChat(models, messages, userProfile, reply);
    } finally {
      endSSE(reply);
    }
  });
}

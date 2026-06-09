import type { FastifyInstance } from 'fastify';
import type { ProfileRequest } from '../../../shared/types.js';
import { generateProfile } from '../services/profileAgent.js';

export async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: ProfileRequest }>('/api/profile', async (request, reply) => {
    const { rounds, existingProfile } = request.body;

    if (!rounds?.length) {
      return reply.status(400).send({ error: 'rounds are required' });
    }

    try {
      const profile = await generateProfile(rounds, existingProfile);
      return { profile };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile generation failed';
      return reply.status(500).send({ error: message });
    }
  });
}

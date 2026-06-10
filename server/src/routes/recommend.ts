import type { FastifyInstance } from 'fastify';
import type { RecommendRequest } from '../../../shared/types.js';
import { generateRecommendations } from '../services/recommendAgent.js';

export async function recommendRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: RecommendRequest }>('/api/recommend', async (request, reply) => {
    const { userProfile } = request.body ?? {};

    try {
      const questions = await generateRecommendations(userProfile);
      return { questions };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Recommendation generation failed';
      return reply.status(500).send({ error: message });
    }
  });
}

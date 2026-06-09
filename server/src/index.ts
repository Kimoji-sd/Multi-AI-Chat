import Fastify from 'fastify';
import cors from '@fastify/cors';
import { port } from './config/env.js';
import { chatRoutes } from './routes/chat.js';
import { profileRoutes } from './routes/profile.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });
await fastify.register(chatRoutes);
await fastify.register(profileRoutes);

fastify.get('/api/health', async () => ({ status: 'ok' }));

try {
  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`Server running on http://localhost:${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

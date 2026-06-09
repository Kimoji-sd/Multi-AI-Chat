import type { ModelRoute } from '../../config/env.js';
import type { ModelAdapter } from './base.js';
import { createProviderAdapter } from './openai.js';

export function createAdapter(route: ModelRoute): ModelAdapter {
  return createProviderAdapter(route.provider, route.apiModel);
}

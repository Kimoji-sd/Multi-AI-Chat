import type { UserProfile } from '../../../shared/types.js';
import { COLD_START_RECOMMENDATIONS } from '../../../shared/types.js';
import { createProfileAgentAdapter } from './modelAdapters/openai.js';

function parseQuestionsJson(text: string): string[] | null {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((q): q is string => typeof q === 'string' && q.trim().length > 0);
  } catch {
    return null;
  }
}

export async function generateRecommendations(
  userProfile?: UserProfile | null
): Promise<string[]> {
  if (!userProfile) {
    return [...COLD_START_RECOMMENDATIONS];
  }

  const prompt = `你是一个对话开场引导引擎。根据用户画像，生成 3 个推荐问题。

== 用户画像 ==
技术画像：${JSON.stringify(userProfile.technicalProfile)}
人格画像：${JSON.stringify(userProfile.personalityProfile)}

== 生成规则 ==
1. 生成 3 个推荐问题，分配到三个类别：
   - follow-up（追问）：基于用户历史兴趣的深层延伸，约 40%
   - explore（探索）：基于用户兴趣但未深入的方向，约 40%
   - challenge（挑战）：反向视角或边界拷问，约 20%
2. 问题要具体、可执行，避免空洞的开放式问题
3. 问题长度控制在 15-40 个字
4. 风格匹配用户的 communicationStyle

请严格输出 JSON 数组格式：
["问题1", "问题2", "问题3"]`;

  let llmResponse = '';

  try {
    await createProfileAgentAdapter().streamChat(
      [{ role: 'user', content: prompt }],
      (chunk) => {
        llmResponse += chunk;
      }
    );

    const questions = parseQuestionsJson(llmResponse);
    if (questions && questions.length >= 3) {
      return questions.slice(0, 3);
    }
  } catch {
    // fall through to cold start
  }

  return [...COLD_START_RECOMMENDATIONS];
}

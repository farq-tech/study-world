import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from './logger';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function askClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 2048
): Promise<string> {
  try {
    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock?.text || '';
  } catch (error) {
    logger.error('Claude API error', { error });
    throw new Error('فشل في الاتصال بالمعلم الذكي. حاول مرة أخرى.');
  }
}

export function isClaudeAvailable(): boolean {
  return !!env.ANTHROPIC_API_KEY;
}

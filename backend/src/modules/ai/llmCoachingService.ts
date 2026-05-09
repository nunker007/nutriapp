/**
 * llmCoachingService.ts
 * LLM 기반 코칭 메시지 생성 서비스 (Anthropic Claude API 연동)
 */
import Anthropic from '@anthropic-ai/sdk';

interface LLMGenerateRequest {
  prompt: string;
  systemInstruction: string;
  maxTokens: number;
  temperature: number;
}

interface LLMGenerateResponse {
  text: string;
  model: string;
}

export class LLMCoachingService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generate(request: LLMGenerateRequest): Promise<LLMGenerateResponse> {
    const message = await this.client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: request.maxTokens,
      system:     request.systemInstruction,
      messages:   [{ role: 'user', content: request.prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return { text, model: message.model };
  }
}

export const llmCoachingService = new LLMCoachingService();

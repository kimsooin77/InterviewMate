import { ConfigService } from '@nestjs/config';

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export const getOpenAIConfig = (configService: ConfigService): OpenAIConfig => ({
  apiKey: configService.get<string>('OPENAI_API_KEY', ''),
  model: configService.get<string>('OPENAI_MODEL', 'gpt-4'),
  temperature: configService.get<number>('OPENAI_TEMPERATURE', 0.7),
  maxTokens: configService.get<number>('OPENAI_MAX_TOKENS', 2000),
});

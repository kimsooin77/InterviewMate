import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  port: number;
  corsOrigin: string;
}

export const getAppConfig = (configService: ConfigService): AppConfig => ({
  port: configService.get<number>('PORT', 3000),
  corsOrigin: configService.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
});

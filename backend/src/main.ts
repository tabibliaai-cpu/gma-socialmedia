import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

let app: any;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule, adapter);
    const configService = app.get(ConfigService);
    
    // Enable CORS for all origins in production
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // API prefix
    app.setGlobalPrefix('api');
    
    await app.init();
  }
  return app;
}

// For Vercel serverless
export default async (req: any, res: any) => {
  await createApp();
  const handler = expressApp(req, res);
  return handler;
};

// For regular Node.js server
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}

// Run bootstrap if this is the main module (not serverless)
if (require.main === module) {
  bootstrap();
}

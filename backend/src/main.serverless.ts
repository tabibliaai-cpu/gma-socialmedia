import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as serverless from 'serverless-http';

const expressApp = express();
let app: any;

async function createApp() {
  if (!app) {
    const adapter = new ExpressAdapter(expressApp);
    app = await NestFactory.create(AppModule, adapter);
    
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
    
    await app.init();
  }
  return app;
}

// Export for Vercel serverless
export const handler = async (req: any, res: any) => {
  await createApp();
  return serverless(expressApp)(req, res);
};

// For local development
if (require.main === module) {
  createApp().then(() => {
    const port = process.env.PORT || 3001;
    expressApp.listen(port, () => {
      console.log(`🚀 Backend running on http://localhost:${port}`);
    });
  });
}

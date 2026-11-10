import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ThreatsService } from './threats/threats.service';
import { CVEIngestService } from './cve-ingest/services/cve-ingest.service';
import { CVERepositoryDownloadService } from './cve-ingest/services/cve-repository-download.service';
import { CVEPersistenceService } from './cve-ingest/services/cve-persistence.service';
import { seedThreats } from './scripts/seed-threats';
import { seedVulnerabilities } from './scripts/seed-vulnerabilities';
import { loadRulesXlsx } from './scripts/load-rules-xlsx';

Error.stackTraceLimit = 100;
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  app.enableCors({
    origin: ['http://localhost:5001', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger (opcional: se activa si los paquetes están instalados)
  try {
    const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('Evaluador de Riesgos API')
      .setDescription('Documentación de los endpoints del backend')
      .setVersion('1.0')
      .build();
    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));
    console.log('Swagger UI disponible en /api');
  } catch {
    // paquetes de swagger no instalados — se omite
  }

  await app.listen(process.env.PORT ?? 5000);

  const threatsService = app.get(ThreatsService);
  await seedThreats(threatsService);

  app.enableCors();
  const cveIngestService = app.get(CVEIngestService);
  const repositoryService = app.get(CVERepositoryDownloadService);
  const persistenceService = app.get(CVEPersistenceService);
  await seedVulnerabilities(cveIngestService, repositoryService, persistenceService);
}

bootstrap();

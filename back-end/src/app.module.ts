import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Módulos MongoDB (test-merge)
import { ThreatsModule } from './threats/threats.module';
import { VulnerabilitiesModule } from './vulnerabilities/vulnerabilities.module';
import { DatabaseModule } from './database/database.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { AssetsModule } from './assets/assets.module';
import { RiskAssessmentsModule } from './risk-assessments/risk-assessments.module';
import { CVEIngestModule } from './cve-ingest/cve-ingest.module';

// Módulos TypeORM/SQLite (task-module)
import { TasksModule } from './tasks/tasks.module';
import { PatternsModule } from './patterns/patterns.module';
import { ControlsModule } from './controls/controls.module';
import { OsaSyncModule } from './osa-sync/osa-sync.module';
import { MappingModule } from './mapping/mapping.module';
import { ScriptsModule } from './scripts/scripts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost/test'),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      synchronize: true,
      autoLoadEntities: true,
    }),
    // MongoDB modules
    ThreatsModule,
    VulnerabilitiesModule,
    DatabaseModule,
    QuestionnairesModule,
    AssetsModule,
    RiskAssessmentsModule,
    CVEIngestModule,
    ScriptsModule,
    // SQLite/TypeORM modules
    TasksModule,
    PatternsModule,
    ControlsModule,
    OsaSyncModule,
    MappingModule,
  ],
})
export class AppModule {

}
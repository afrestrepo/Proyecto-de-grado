import { Module } from '@nestjs/common';
import { ThreatsController } from './threats.controller';
import { ThreatsService } from './threats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Threat, ThreatSchema } from './schemas/threat.schema';
import { DatabaseModule } from '../database/database.module';
import { threatsProviders } from './threats.providers';
import { TasksModule } from '../tasks/tasks.module';

@Module({
    imports: [
    MongooseModule.forFeature([{ name: Threat.name, schema: ThreatSchema }]),
    DatabaseModule,
    TasksModule,
  ],
    controllers: [ThreatsController],
    providers: [...threatsProviders, ThreatsService],
    exports: [...threatsProviders, ThreatsService, MongooseModule],
})
export class ThreatsModule {}

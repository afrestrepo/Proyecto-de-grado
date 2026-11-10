import { Module } from '@nestjs/common';
import { ThreatsModule } from '../threats/threats.module';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';

@Module({
  imports: [ThreatsModule],
  providers: [ScriptsService],
  controllers: [ScriptsController],
})
export class ScriptsModule {}
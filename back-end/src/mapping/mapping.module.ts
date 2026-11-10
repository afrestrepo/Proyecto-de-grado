import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MappingResult } from './entities/mapping-result.entity';
import { MappingService } from './services/mapping.service';
import { MappingController } from './controllers/mapping.controller';
import { Pattern } from '../patterns/entities/pattern.entity';
import { Tarea } from '../tasks/entities/task.entity';
import { Control } from '../controls/entities/control.entity';
import { ThreatsModule } from '../threats/threats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MappingResult, Pattern, Tarea, Control]),
    ThreatsModule,
  ],
  controllers: [MappingController],
  providers: [MappingService],
})
export class MappingModule {}

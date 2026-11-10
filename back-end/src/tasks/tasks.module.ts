import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './controllers/tasks.controller';
import { Tarea, Nota, Documento, Historial } from './entities/task.entity';
import { TasksService } from './services/tasks.service';
import { Control } from '../controls/entities/control.entity';
import { MappingResult } from '../mapping/entities/mapping-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tarea, Nota, Documento, Historial, Control, MappingResult])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

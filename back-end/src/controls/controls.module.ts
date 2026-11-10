import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Control } from './entities/control.entity';
import { ControlsService } from './services/controls.service';
import { ControlsController } from './controllers/controls.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Control])],
  controllers: [ControlsController],
  providers: [ControlsService],
})
export class ControlsModule {}

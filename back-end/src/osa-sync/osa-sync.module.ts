import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pattern } from '../patterns/entities/pattern.entity';
import { Control } from '../controls/entities/control.entity';
import { OsaSyncService } from './osa-sync.service';
import { OsaSyncController } from './osa-sync.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pattern, Control])],
  controllers: [OsaSyncController],
  providers: [OsaSyncService],
})
export class OsaSyncModule {}

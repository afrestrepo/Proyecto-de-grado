import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatternsService } from './services/patterns.service';
import { PatternsController } from './controllers/patterns.controller';
import { Pattern } from './entities/pattern.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pattern])],
  controllers: [PatternsController],
  providers: [PatternsService],
})
export class PatternsModule {}

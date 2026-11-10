import {
  Controller,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PatternsService } from '../services/patterns.service';
import { Pattern } from '../entities/pattern.entity';

@Controller('patterns')
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}

  @Get()
  async findAll(): Promise<Pattern[]> {
    return this.patternsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Pattern> {
    const pattern = await this.patternsService.findOne(id);
    if (!pattern) {
      throw new NotFoundException(`Patrón con ID ${id} no encontrado`);
    }
    return pattern;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const removed = await this.patternsService.remove(id);
    if (!removed) {
      throw new NotFoundException(`Patrón con ID ${id} no encontrado`);
    }
  }
}

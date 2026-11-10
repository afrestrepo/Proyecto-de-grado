import {
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { MappingService } from '../services/mapping.service';
import { MappingResult } from '../entities/mapping-result.entity';

@Controller('mapping')
export class MappingController {
  constructor(private readonly mappingService: MappingService) {}

  @Post(':taskId/mitigar')
  @HttpCode(HttpStatus.OK)
  async mitigate(@Param('taskId') taskId: string): Promise<MappingResult> {
    return this.mappingService.mitigate(taskId);
  }

  @Get()
  async findAll(): Promise<MappingResult[]> {
    return this.mappingService.findAll();
  }

  @Get('task/:taskId')
  async findByTask(@Param('taskId') taskId: string): Promise<MappingResult[]> {
    return this.mappingService.findByTask(taskId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MappingResult> {
    const result = await this.mappingService.findOne(id);
    if (!result) {
      throw new NotFoundException(`Mapping ${id} no encontrado`);
    }
    return result;
  }
}

import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ControlsService } from '../services/controls.service';
import { UpdateControlDto } from '../dtos/update-control.dto';
import { Control } from '../entities/control.entity';

@Controller('controls')
export class ControlsController {
  constructor(private readonly controlsService: ControlsService) {}

  @Get()
  async findAll(@Query('patternId') patternId?: string): Promise<Control[]> {
    return this.controlsService.findAll(patternId);
  }

  @Get('pattern/:patternId')
  async findByPattern(
    @Param('patternId') patternId: string,
  ): Promise<Control[]> {
    return this.controlsService.findByPattern(patternId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Control> {
    const control = await this.controlsService.findOne(id);
    if (!control) {
      throw new NotFoundException(`Control con ID ${id} no encontrado`);
    }
    return control;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateControlDto: UpdateControlDto,
  ): Promise<Control> {
    const control = await this.controlsService.update(id, updateControlDto);
    if (!control) {
      throw new NotFoundException(`Control con ID ${id} no encontrado`);
    }
    return control;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const removed = await this.controlsService.remove(id);
    if (!removed) {
      throw new NotFoundException(`Control con ID ${id} no encontrado`);
    }
  }
}

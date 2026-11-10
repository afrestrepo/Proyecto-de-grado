import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ThreatsService } from './threats.service';

@Controller('threats')
export class ThreatsController {
    constructor(private readonly threatsService: ThreatsService) {}

    @Post()
    create(@Body() createThreatDto: any) {
        return this.threatsService.create(createThreatDto);
    }

    @Get()
    findAll() {
        return this.threatsService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        const threat = await this.threatsService.findById(id);
        if (!threat) {
        throw new NotFoundException(`Threat ${id} not found`);
        }
        return threat;
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateThreatDto: any) {
        return this.threatsService.update(id, updateThreatDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.threatsService.delete(id);
    }
}

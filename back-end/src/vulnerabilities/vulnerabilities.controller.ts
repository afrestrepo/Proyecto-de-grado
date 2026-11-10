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
import { VulnerabilitiesService } from './vulnerabilities.service';

@Controller('vulnerabilities')
export class VulnerabilitiesController {
  constructor(private readonly vulnerabilitiesService: VulnerabilitiesService) {}

  @Post()
  create(@Body() createVulnerabilityDto: any) {
    return this.vulnerabilitiesService.create(createVulnerabilityDto);
  }

  @Get()
  findAll() {
    return this.vulnerabilitiesService.findAll();
  }

  @Get('cve/:cveId')
  async findByCVEId(@Param('cveId') cveId: string) {
    const vulnerability = await this.vulnerabilitiesService.findByCVEId(cveId);
    if (!vulnerability) {
      throw new NotFoundException(`Vulnerability CVE:${cveId} not found`);
    }
    return vulnerability;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const vulnerability = await this.vulnerabilitiesService.findById(id);
    if (!vulnerability) {
      throw new NotFoundException(`Vulnerability ${id} not found`);
    }
    return vulnerability;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateVulnerabilityDto: any) {
    return this.vulnerabilitiesService.update(id, updateVulnerabilityDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.vulnerabilitiesService.delete(id);
  }
}


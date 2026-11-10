import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { OsaSyncService } from './osa-sync.service';

@Controller('osa-sync')
export class OsaSyncController {
  constructor(private readonly osaSyncService: OsaSyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async sync(): Promise<{ patterns: number; controls: number }> {
    return this.osaSyncService.sync();
  }

  @Get('status')
  async getStatus(): Promise<{
    lastSync: Date | null;
    patterns: number;
    controls: number;
  }> {
    return this.osaSyncService.getStatus();
  }
}

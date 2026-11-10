import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { VulnerabilitiesController } from './vulnerabilities.controller';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { vulnerabilitiesProviders } from './vulnerabilities.providers';
import { Vulnerability, VulnerabilitySchema } from './schemas/vulnerability.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [MongooseModule.forFeature([{name: Vulnerability.name, schema: VulnerabilitySchema}]), DatabaseModule],
    controllers: [VulnerabilitiesController],
    providers: [...vulnerabilitiesProviders, VulnerabilitiesService],
    exports: [...vulnerabilitiesProviders, VulnerabilitiesService, MongooseModule],
})
export class VulnerabilitiesModule {}
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ThreatsModule } from '../threats/threats.module';
import { VulnerabilitiesModule } from '../vulnerabilities/vulnerabilities.module';
import { AssetsModule } from '../assets/assets.module';
import { riskAssessmentsProviders } from './risk-assessments.providers';
import { RiskAssessmentsService } from './risk-assessments.service';
import { RiskCalculationService } from './risk-calculation.service';
import { RiskAssessmentsController } from './risk-assessments.controller';
import { ImpactAiService } from './services/impact-ai.service';

@Module({
  imports: [DatabaseModule, ThreatsModule, VulnerabilitiesModule, AssetsModule],
  controllers: [RiskAssessmentsController],
  providers: [...riskAssessmentsProviders, RiskAssessmentsService, RiskCalculationService, ImpactAiService],
  exports: [...riskAssessmentsProviders, RiskCalculationService, RiskAssessmentsService],
})
export class RiskAssessmentsModule {}

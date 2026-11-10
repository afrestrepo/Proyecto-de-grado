import {
  IsMongoId,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OWASPLikelihoodFactorsDto {
  @IsOptional() @IsNumber() @Min(0) @Max(9) SL?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) M?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) O?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) S?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) ED?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) EE?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) A?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) ID?: number;
}

class OWASPTechnicalFactorsDto {
  @IsOptional() @IsNumber() @Min(0) @Max(9) LC?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) LI?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) LA?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) LAc?: number;
}

class WeightsDto {
  @IsOptional() @IsNumber() @Min(0) @Max(1) owasp_likelihood_weight?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(1) cvss_likelihood_weight?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(1) owasp_impact_weight?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(1) cvss_impact_weight?: number;
}

export class CalculateRiskDto {
  @ApiProperty({ description: 'MongoDB ObjectId del activo' })
  @IsMongoId()
  assetId: string;

  @ApiProperty({ description: 'MongoDB ObjectId de la amenaza' })
  @IsMongoId()
  threatId: string;

  @ApiPropertyOptional({ description: 'MongoDB ObjectId de la vulnerabilidad (opcional)' })
  @IsOptional()
  @IsMongoId()
  vulnerabilityId?: string;

  @ApiPropertyOptional({
    description: 'Usar modelo de IA (Ollama) para inferir factores de impacto. Default: true.',
  })
  @IsOptional()
  @IsBoolean()
  useAI?: boolean;

  @ApiPropertyOptional({ description: 'Factores OWASP de probabilidad (anula inferencia automática)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OWASPLikelihoodFactorsDto)
  owaspLikelihoodFactors?: OWASPLikelihoodFactorsDto;

  @ApiPropertyOptional({ description: 'Factores OWASP de impacto técnico (anula inferencia automática)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OWASPTechnicalFactorsDto)
  owaspTechnicalFactors?: OWASPTechnicalFactorsDto;

  @ApiPropertyOptional({ description: 'Pesos de combinación OWASP/CVSS' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WeightsDto)
  weights?: WeightsDto;
}

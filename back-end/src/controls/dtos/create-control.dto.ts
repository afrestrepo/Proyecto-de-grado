import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateControlDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

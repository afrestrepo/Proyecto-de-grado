import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Tratamiento, Estado } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsOptional()
  @IsString()
  amenazaId?: string;

  @IsOptional()
  @IsEnum(Tratamiento)
  tratamiento?: Tratamiento | null;

  @IsOptional()
  @IsEnum(Estado)
  estado?: Estado;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  controles?: string[];

  @IsString()
  @IsNotEmpty()
  responsableId!: string;
}

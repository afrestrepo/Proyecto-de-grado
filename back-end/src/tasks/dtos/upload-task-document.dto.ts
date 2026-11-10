import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadTaskDocumentDto {
  @IsString()
  @IsNotEmpty()
  nombreArchivo!: string;

  @IsOptional()
  @IsString()
  urlArchivo?: string;
}

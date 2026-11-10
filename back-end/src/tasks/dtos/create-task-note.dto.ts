import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskNoteDto {
  @IsString()
  @IsNotEmpty()
  texto!: string;
}

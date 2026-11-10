import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { CreateTaskNoteDto } from '../dtos/create-task-note.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { UploadTaskDocumentDto } from '../dtos/upload-task-document.dto';
import { TasksService } from '../services/tasks.service';

const storage = diskStorage({
  destination: join(__dirname, '..', '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('filter/con-tratamiento')
  findWithTreatment() {
    return this.tasksService.findWithTreatment();
  }

  @Get('filter/sin-tratamiento')
  findWithoutTreatment() {
    return this.tasksService.findWithoutTreatment();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/notes')
  createNote(
    @Param('id') id: string,
    @Body() dto: CreateTaskNoteDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tasksService.createNote(id, dto, userId);
  }

  @Get(':id/notes')
  findNotes(@Param('id') id: string) {
    return this.tasksService.findNotes(id);
  }

  @Patch('notes/:notaId')
  updateNote(
    @Param('notaId') notaId: string,
    @Body('texto') texto: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tasksService.updateNote(notaId, texto, userId);
  }

  @Delete('notes/:notaId')
  removeNote(
    @Param('notaId') notaId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tasksService.removeNote(notaId, userId);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tasksService.uploadDocument(
      id,
      { nombreArchivo: file.originalname, urlArchivo: `/uploads/${file.filename}` },
      userId,
    );
  }

  @Get(':id/documents')
  findDocuments(@Param('id') id: string) {
    return this.tasksService.findDocuments(id);
  }

  @Patch('documents/:docId')
  updateDocument(
    @Param('docId') docId: string,
    @Body() dto: UploadTaskDocumentDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tasksService.updateDocument(docId, dto, userId);
  }

  @Delete('documents/:docId')
  removeDocument(
    @Param('docId') docId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.tasksService.removeDocument(docId, userId);
  }
}

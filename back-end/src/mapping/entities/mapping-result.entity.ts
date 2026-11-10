import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tarea } from '../../tasks/entities/task.entity';

export enum MappingStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity({ name: 'mapping_results' })
export class MappingResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Tarea, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  tarea!: Tarea;

  @Column()
  taskId!: string;

  @Column({
    type: 'simple-enum',
    enum: MappingStatus,
    default: MappingStatus.PENDING,
  })
  status!: MappingStatus;

  @Column({ type: 'text', nullable: true })
  results?: string;

  @Column({ type: 'text', nullable: true })
  error: string;

  // JSON: Clasificacion completo del clasificador de amenazas
  @Column({ type: 'text', nullable: true })
  clasificacion: string;

  @CreateDateColumn()
  createdAt!: Date;
}

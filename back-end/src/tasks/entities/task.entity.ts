import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

export enum Tratamiento {
  Mitigar    = 'mitigar',
  Transferir = 'transferir',
  Evitar     = 'evitar',
  Aceptar    = 'aceptar',
}

export enum Estado {
  NINGUNO      = 'ninguno',
  TOMADO       = 'tomado',
  EN_PROGRESO  = 'en progreso',
  TERMINADO    = 'terminado',
}

export enum AccionHistorial {
  TAREA_EDITADA        = 'TAREA_EDITADA',
  ESTADO_CAMBIADO      = 'ESTADO_CAMBIADO',
  TRATAMIENTO_CAMBIADO = 'TRATAMIENTO_CAMBIADO',
  NOTA_AÑADIDA         = 'NOTA_AÑADIDA',
  NOTA_EDITADA         = 'NOTA_EDITADA',
  NOTA_ELIMINADA       = 'NOTA_ELIMINADA',
  DOCUMENTO_AÑADIDO    = 'DOCUMENTO_AÑADIDO',
  DOCUMENTO_EDITADO    = 'DOCUMENTO_EDITADO',
  DOCUMENTO_ELIMINADO  = 'DOCUMENTO_ELIMINADO',
}

@Entity({ name: 'tareas' })
export class Tarea {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ type: 'simple-enum', enum: Tratamiento, nullable: true })
  tratamiento?: Tratamiento | null;

  @Column({ type: 'simple-enum', enum: Estado, default: Estado.NINGUNO })
  estado!: Estado;

  @Column({ type: 'simple-array', nullable: true })
  controles?: string[];

  @Column()
  responsableId!: string;

  @Column({ nullable: true })
  amenazaId?: string;

  @OneToMany(() => Nota, (nota) => nota.tarea, { cascade: true, eager: true })
  notas?: Nota[];

  @OneToMany(() => Documento, (doc) => doc.tarea, { cascade: true, eager: true })
  documentos?: Documento[];
}

@Entity({ name: 'notas' })
export class Nota {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  texto!: string;

  @CreateDateColumn()
  creadoEn!: Date;

  @ManyToOne(() => Tarea, (tarea) => tarea.notas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tareaId' })
  tarea!: Tarea;

  @Column()
  tareaId!: string;
}

@Entity({ name: 'documentos' })
export class Documento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombreArchivo!: string;

  @Column({ nullable: true })
  urlArchivo?: string;

  @CreateDateColumn()
  subidoEn!: Date;

  @ManyToOne(() => Tarea, (tarea) => tarea.documentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tareaId' })
  tarea!: Tarea;

  @Column()
  tareaId!: string;
}

@Entity({ name: 'historial' })
export class Historial {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tareaId!: string;

  @Column({ type: 'simple-enum', enum: AccionHistorial })
  accion!: AccionHistorial;

  @Column({ nullable: true })
  campo?: string;

  @Column({ type: 'text', nullable: true })
  valorAntes?: string;

  @Column({ type: 'text', nullable: true })
  valorDespues?: string;

  @Column()
  creadoPor!: string;

  @CreateDateColumn()
  creadoEn!: Date;
}

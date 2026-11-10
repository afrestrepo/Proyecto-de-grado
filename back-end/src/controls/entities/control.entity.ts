import { Entity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import { Pattern } from '../../patterns/entities/pattern.entity';

@Entity('controls')
export class Control {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  family: string;

  @Column({ type: 'varchar', nullable: true })
  familyName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  descriptionEs: string;

  @Column({ type: 'text', nullable: true })
  supplementalGuidance: string;

  @Column({ type: 'text', nullable: true })
  enhancements: string;

  @Column({ default: false })
  baselineLow: boolean;

  @Column({ default: false })
  baselineModerate: boolean;

  @Column({ default: false })
  baselineHigh: boolean;

  @ManyToMany(() => Pattern, (pattern) => pattern.controls)
  patterns: Pattern[];

  @Column({ type: 'datetime', nullable: true })
  syncedAt: Date;
}

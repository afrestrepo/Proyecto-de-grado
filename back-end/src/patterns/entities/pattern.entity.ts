import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Control } from '../../controls/entities/control.entity';

@Entity('patterns')
export class Pattern {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  slug: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  classification: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'simple-array', nullable: true })
  authors: string[];

  @Column({ type: 'varchar', nullable: true })
  datePublished: string;

  @Column({ type: 'varchar', nullable: true })
  dateModified: string;

  // Stored as JSON array of strings
  @Column({ type: 'text', nullable: true })
  keyControlAreas: string;

  @Column({ type: 'text', nullable: true })
  assumptions: string;

  @Column({ type: 'text', nullable: true })
  typicalChallenges: string;

  @Column({ type: 'text', nullable: true })
  threatResistance: string;

  @Column({ type: 'text', nullable: true })
  indications: string;

  @Column({ type: 'text', nullable: true })
  contraIndications: string;

  @Column({ type: 'text', nullable: true })
  developmentAreas: string;

  @ManyToMany(() => Control, (control) => control.patterns)
  @JoinTable({ name: 'pattern_controls' })
  controls: Control[];

  @Column({ type: 'datetime', nullable: true })
  syncedAt: Date;
}

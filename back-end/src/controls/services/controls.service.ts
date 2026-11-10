import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Control } from '../entities/control.entity';
import { UpdateControlDto } from '../dtos/update-control.dto';

@Injectable()
export class ControlsService {
  constructor(
    @InjectRepository(Control)
    private readonly controlRepository: Repository<Control>,
  ) {}

  async findAll(patternId?: string): Promise<Control[]> {
    if (patternId) {
      return this.controlRepository
        .createQueryBuilder('control')
        .innerJoin('control.patterns', 'pattern', 'pattern.id = :patternId', {
          patternId,
        })
        .getMany();
    }
    return this.controlRepository.find();
  }

  async findOne(id: string): Promise<Control | null> {
    return this.controlRepository.findOne({ where: { id } });
  }

  async findByPattern(patternId: string): Promise<Control[]> {
    return this.controlRepository
      .createQueryBuilder('control')
      .innerJoin('control.patterns', 'pattern', 'pattern.id = :patternId', {
        patternId,
      })
      .getMany();
  }

  async update(
    id: string,
    updateControlDto: UpdateControlDto,
  ): Promise<Control | null> {
    const control = await this.findOne(id);
    if (!control) return null;
    await this.controlRepository.update(id, updateControlDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const control = await this.findOne(id);
    if (!control) return false;
    const result = await this.controlRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

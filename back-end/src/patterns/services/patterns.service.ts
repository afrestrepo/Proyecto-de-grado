import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pattern } from '../entities/pattern.entity';

@Injectable()
export class PatternsService {
  constructor(
    @InjectRepository(Pattern)
    private readonly patternRepository: Repository<Pattern>,
  ) {}

  async findAll(): Promise<Pattern[]> {
    return this.patternRepository.find({ relations: ['controls'] });
  }

  async findOne(id: string): Promise<Pattern | null> {
    return this.patternRepository.findOne({
      where: { id },
      relations: ['controls'],
    });
  }

  async remove(id: string): Promise<boolean> {
    const pattern = await this.patternRepository.findOne({ where: { id } });
    if (!pattern) return false;
    const result = await this.patternRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Vulnerability } from './interfaces/vulnerability.interface';

@Injectable()
export class VulnerabilitiesService {
  constructor(
    @Inject('VULNERABILITY_MODEL') private vulnerabilityModel: Model<Vulnerability>,
  ) {}

  async create(createVulnerabilityDto: any): Promise<Vulnerability> {
    const createdVulnerability = new this.vulnerabilityModel(createVulnerabilityDto);
    return createdVulnerability.save();
  }

  async findAll(): Promise<Vulnerability[]> {
    return this.vulnerabilityModel.find().exec();
  }

  async findWithCvss(limit: number = 200): Promise<Vulnerability[]> {
    return this.vulnerabilityModel
      .find({
        $or: [
          { 'metrics.cvssV4_0.baseScore': { $exists: true, $ne: null } },
          { 'metrics.cvssV3_1.baseScore': { $exists: true, $ne: null } },
        ],
      })
      .limit(limit)
      .exec();
  }

  async findByCVEId(cveId: string): Promise<Vulnerability | null> {
    return this.vulnerabilityModel.findOne({ cveId }).exec();
  }

  async findById(id: string): Promise<Vulnerability | null> {
    return this.vulnerabilityModel.findById(id).exec();
  }

  async update(id: string, updateVulnerabilityDto: any): Promise<Vulnerability | null> {
    return this.vulnerabilityModel
      .findByIdAndUpdate(id, updateVulnerabilityDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Vulnerability | null> {
    return this.vulnerabilityModel.findByIdAndDelete(id).exec();
  }

}


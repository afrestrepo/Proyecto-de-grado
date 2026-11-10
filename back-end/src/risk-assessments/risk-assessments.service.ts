import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { RiskAssessment } from './interfaces/risk-assessment.interface';

@Injectable()
export class RiskAssessmentsService {
  constructor(
    @Inject('RISK_ASSESSMENT_MODEL')
    private riskAssessmentModel: Model<RiskAssessment>,
  ) {}

  async create(riskData: any): Promise<RiskAssessment> {
    const createdRiskAssessment = new this.riskAssessmentModel(riskData);
    return createdRiskAssessment.save();
  }

  async findByAssetAndThreat(assetId: string, threatId: string): Promise<RiskAssessment[]> {
    return this.riskAssessmentModel
      .find({
        assetId,
        threatId,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<RiskAssessment | null> {
    return this.riskAssessmentModel.findById(id).exec();
  }

  async findAll(limit: number = 100, skip: number = 0): Promise<RiskAssessment[]> {
    return this.riskAssessmentModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async updateRiskAssessment(id: string, updates: any): Promise<RiskAssessment | null> {
    return this.riskAssessmentModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
  }

  async delete(id: string): Promise<RiskAssessment | null> {
    return this.riskAssessmentModel.findByIdAndDelete(id).exec();
  }

  async findBySeverity(
    level: 'Low' | 'Medium' | 'High' | 'Critical',
  ): Promise<RiskAssessment[]> {
    return this.riskAssessmentModel
      .find({
        'severity.level': level,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByAssetId(assetId: string): Promise<RiskAssessment[]> {
    return this.riskAssessmentModel
      .find({ assetId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findTraceById(id: string): Promise<any | null> {
    return this.riskAssessmentModel
      .findById(id)
      .select('assetId threatId vulnerabilityId trace createdAt updatedAt')
      .lean()
      .exec();
  }
}

import { Connection } from 'mongoose';
import { RiskAssessmentSchema } from './schemas/risk-assessment.schema';

export const riskAssessmentsProviders = [
  {
    provide: 'RISK_ASSESSMENT_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('RiskAssessment', RiskAssessmentSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

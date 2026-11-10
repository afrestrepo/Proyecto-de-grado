import * as mongoose from 'mongoose';

export const RiskAssessmentSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'Asset',
    },
    threatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'Threat',
    },
    vulnerabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vulnerability',
      default: null,
    },

    // Likelihood section
    likelihood: {
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 9,
      },
      level: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High'],
      },
      factors: mongoose.Schema.Types.Mixed,
      // { L_OWASP, L_CVSS, weights used, etc. }
    },

    // Technical Impact section
    technical_impact: {
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 9,
      },
      level: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High'],
      },
      factors: mongoose.Schema.Types.Mixed,
      // { I_Tech_OWASP, I_CVSS, weights used, etc. }
    },

    // Business Impact section
    business_impact: {
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 9,
      },
      level: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High'],
      },
      factors: mongoose.Schema.Types.Mixed,
      // { FD, RD, NC, PV, etc. }
    },

    // Selected Impact (final decision: technical or business)
    selected_impact: {
      type: {
        type: String,
        required: true,
        enum: ['technical', 'business'],
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 9,
      },
      level: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High'],
      },
    },

    // Final Severity (combined likelihood + impact)
    severity: {
      level: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High', 'Critical'],
      },
    },

    // Business context signals derived from asset schema
    business_context_signals: {
      customerFacing: { type: Boolean, default: false },
      criticalOperation: { type: Boolean, default: false },
      personalData: { type: Boolean, default: false },
      regulatoryExposure: { type: Boolean, default: false },
      publicVisibility: { type: Boolean, default: false },
    },

    // AI assistance metadata
    ai_used: { type: Boolean, default: false },
    ai_explanation: { type: String, default: null },

    // Audit trace: what was used, what weights, etc.
    trace: {
      used_cvss: {
        type: Boolean,
        required: true,
      },
      used_cve: {
        type: Boolean,
        required: true,
      },
      cvss_source: { type: String, default: null },
      weights: mongoose.Schema.Types.Mixed,
      calculation_method: {
        type: String,
        default: 'OWASP Risk Rating Methodology',
      },
      technical_formula: { type: String, default: '(LC + LI + LA + LAc) / 4' },
      business_formula: { type: String, default: '(FD + RD + NC + PV) / 4' },
      selection_rule: { type: String, default: 'businessContextScore >= 2 => business impact selected' },
      ai_used: { type: Boolean, default: false },
      business_factors_inferred: { type: Boolean, default: true },
      business_factors: { type: mongoose.Schema.Types.Mixed, default: null },
      LAc_reasoning: {
        type: String,
        default: 'Conservative default (7) — no logging metadata in asset schema',
      },
    },

    // For recalculation tracking
    recalculated_from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RiskAssessment',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Composite index for quick lookups by asset + threat
RiskAssessmentSchema.index({ assetId: 1, threatId: 1 });
// Index for recent calculations
RiskAssessmentSchema.index({ createdAt: -1 });
// Index for severity-based queries
RiskAssessmentSchema.index({ 'severity.level': 1 });

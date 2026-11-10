import { Document } from 'mongoose';
// lineas comentadas son posibles ideas
export interface Threat extends Document {
  readonly code: string;
  readonly description: string;
  readonly affects: {
    confidentiality?: boolean;
    integrity?: boolean;
    availability?: boolean;
  };
  readonly assets: {
    data?: boolean;
    services?: boolean;
    // network?: boolean;
    // hardware?: boolean;
    // software?: boolean;
  };
  readonly people: boolean;
  readonly origin: {
    accidental?: boolean;
    deliberate?: boolean;
    environmental?: boolean;
  };

  readonly logging_level: 'active_review' | 'logged_reviewed' | 'logged_not_reviewed' | 'not_logged';
  // readonly tier?: number;
  // readonly likelihood?: number;
  // readonly impact?: string;
  // readonly mitigation?: string[];
}
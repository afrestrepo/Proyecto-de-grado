export interface Pattern {
  id: string;
  name: string;
  description: string;
  keyControlAreas: string;
  whenToUse: string;
  whenNotToUse: string;
  typicalChallenges: string;
  threatResistance: string;
  assumptions: string;
  developmentAreas: string;
  createdAt: string;
  updatedAt: string;
  controlsCount: number;
  controlsList?: Control[];
}

export interface Control {
  id: string;
  name: string;
  description: string;
  complementaryGuidance?: string | null;
  enhancements?: string | null;
  status: ControlStatus;
  patternId: string;
  createdAt: string;
  updatedAt: string;
}

export type ControlStatus = "None" | "tomado" | "en progreso" | "terminado";

export interface CreatePatternPayload {
  name: string;
  description: string;
  keyControlAreas: string;
  whenToUse: string;
  whenNotToUse: string;
  typicalChallenges: string;
  threatResistance: string;
  assumptions: string;
  developmentAreas: string;
}

export interface CreateControlPayload {
  name: string;
  description: string;
  complementaryGuidance?: string;
  enhancements?: string;
  status: ControlStatus;
  patternId: string;
}

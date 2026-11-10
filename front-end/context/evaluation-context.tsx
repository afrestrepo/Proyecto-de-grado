"use client";

import { TipoTratamiento } from "@/types/treatment";
import { createContext, useContext, useState } from "react";

interface TreatmentSelection {
  vulnerabilityId: string;
  type: TipoTratamiento;
}

interface EvaluationContextType {
  evaluationId: string | null;
  selectedVulnerabilityId: string | null;
  treatments: TreatmentSelection[];
  setSelectedVulnerabilityId: (id: string | null) => void;
  saveTreatmentSelection: (vulnId: string, type: TipoTratamiento) => void;
  getTreatmentForVulnerability: (vulnId: string) => TipoTratamiento | null;
}

const EvaluationContext = createContext<EvaluationContextType>({
  evaluationId: null,
  selectedVulnerabilityId: null,
  treatments: [],
  setSelectedVulnerabilityId: () => {},
  saveTreatmentSelection: () => {},
  getTreatmentForVulnerability: () => null,
});

export function EvaluationProvider({
  children,
  evaluationId,
}: {
  children: React.ReactNode;
  evaluationId: string;
}) {
  const [selectedVulnerabilityId, setSelectedVulnerabilityId] = useState<string | null>(null);
  const [treatments, setTreatments] = useState<TreatmentSelection[]>([]);

  const saveTreatmentSelection = (vulnId: string, type: TipoTratamiento) => {
    setTreatments((prev) => {
      const filtered = prev.filter((t) => t.vulnerabilityId !== vulnId);
      return [...filtered, { vulnerabilityId: vulnId, type }];
    });
  };

  const getTreatmentForVulnerability = (vulnId: string) => {
    const found = treatments.find((t) => t.vulnerabilityId === vulnId);
    return found?.type ?? null;
  };

  return (
    <EvaluationContext.Provider
      value={{
        evaluationId,
        selectedVulnerabilityId,
        treatments,
        setSelectedVulnerabilityId,
        saveTreatmentSelection,
        getTreatmentForVulnerability,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluationContext() {
  return useContext(EvaluationContext);
}

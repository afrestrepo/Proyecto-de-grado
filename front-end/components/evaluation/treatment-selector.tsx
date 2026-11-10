"use client";

import { TipoTratamiento } from "@/types/treatment";

const TREATMENT_DESCRIPTIONS: Record<TipoTratamiento, string> = {
  mitigar:
    "Reducir la probabilidad o el impacto del riesgo mediante controles o mejoras",
  evitar: "Evitar la actividad que causa el riesgo",
  transferir: "Transferir el riesgo a un tercero (outsourcing, seguros, etc.)",
  aceptar: "Aceptar el riesgo y sus consecuencias potenciales",
};

interface TreatmentSelectorProps {
  selectedTreatment?: TipoTratamiento;
  onSelect?: (treatment: TipoTratamiento) => void;
  vulnerabilityId?: string;
}

export default function TreatmentSelector({
  selectedTreatment,
  onSelect,
  vulnerabilityId,
}: TreatmentSelectorProps) {
  const treatments: TipoTratamiento[] = ["mitigar", "evitar", "transferir", "aceptar"];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Seleccionar Tipo de Tratamiento
        </h3>
        {vulnerabilityId && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Elige como deseas tratar esta amenaza
          </p>
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        {treatments.map((treatment) => (
          <button
            key={treatment}
            onClick={() => onSelect?.(treatment)}
            className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-all ${
              selectedTreatment === treatment
                ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                  selectedTreatment === treatment
                    ? "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
                    : "border-zinc-400 dark:border-zinc-600"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
                  {treatment}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {TREATMENT_DESCRIPTIONS[treatment]}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedTreatment && (
        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
          <p className="text-xs font-medium capitalize text-green-800 dark:text-green-200">
            ✓ Tratamiento seleccionado: <span className="font-semibold">{selectedTreatment}</span>
          </p>
        </div>
      )}
    </div>
  );
}

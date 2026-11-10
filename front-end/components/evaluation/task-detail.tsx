"use client";

import { useState } from "react";
import { Tarea } from "@/types/task";
import { TipoTratamiento } from "@/types/treatment";

const TREATMENT_OPTIONS: { value: TipoTratamiento; label: string; desc: string }[] = [
  { value: "mitigar", label: "Mitigar", desc: "Reducir la probabilidad o el impacto" },
  { value: "evitar", label: "Evitar", desc: "Evitar la actividad que causa el riesgo" },
  { value: "transferir", label: "Transferir", desc: "Transferir el riesgo a un tercero" },
  { value: "aceptar", label: "Aceptar", desc: "Aceptar el riesgo y sus consecuencias" },
];

interface TaskDetailProps {
  task: Tarea;
  onBack: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Pick<Tarea, "tratamiento">>) => void;
}

export default function TaskDetail({ task, onBack, onTaskUpdate }: TaskDetailProps) {
  const [treatment, setTreatment] = useState<TipoTratamiento | null>(null);
  const [saving, setSaving] = useState(false);
  const [mappingError, setMappingError] = useState<string | null>(null);

  const isUnassigned = !task.responsableId || task.responsableId === "unassigned";

  async function handleTreatmentSelect(type: TipoTratamiento) {
    if (type === treatment || saving) return;
    setSaving(true);
    setMappingError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tratamiento: type }),
      });
      if (!res.ok) throw new Error();
      setTreatment(type);
      onTaskUpdate(task.id, { tratamiento: type });

      if (type === "mitigar") {
        const mapRes = await fetch(`/api/mapping/${task.id}/mitigar`, {
          method: "POST",
        });
        if (!mapRes.ok) {
          setMappingError(
            "El mapeo de controles falló. Los controles pueden no estar actualizados."
          );
        }
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="mt-0.5 shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Volver
        </button>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {task.nombre}
          </h3>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Amenaza:</span>{" "}
              {task.amenazaId}
            </span>
            <span>·</span>
            <span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Responsable:</span>{" "}
              {isUnassigned ? "Sin asignar" : task.responsableId}
            </span>
            {task.grupo && (
              <>
                <span>·</span>
                <span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Grupo:</span>{" "}
                  {task.grupo}
                </span>
              </>
            )}
          </div>
          {task.descripcionGrupo && (
            <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">{task.descripcionGrupo}</p>
          )}
        </div>
      </div>

      {/* Selector de tratamiento */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Seleccionar Tratamiento</h4>
          {saving && <span className="text-xs text-zinc-400">Guardando...</span>}
        </div>
        {mappingError && (
          <p className="mb-3 text-xs text-red-500">{mappingError}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {TREATMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleTreatmentSelect(opt.value)}
              disabled={saving}
              className={`rounded-lg border-2 px-4 py-3 text-left transition-all disabled:opacity-60 ${
                treatment === opt.value
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
              }`}
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {opt.label}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{opt.desc}</p>
            </button>
          ))}
        </div>
        {treatment && (
          <p className="mt-4 text-xs font-medium text-green-700 dark:text-green-400">
            Tratamiento guardado: {treatment}
          </p>
        )}
      </div>
    </div>
  );
}

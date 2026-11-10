"use client";

import { Tarea, TaskStatus } from "@/types/task";

const STATUS_COLOR: Record<TaskStatus, string> = {
  ninguno: "bg-zinc-400 dark:bg-zinc-500",
  tomado: "bg-blue-500 dark:bg-blue-400",
  "en progreso": "bg-yellow-500 dark:bg-yellow-400",
  terminado: "bg-green-500 dark:bg-green-400",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  ninguno: "Sin estado",
  tomado: "Tomado",
  "en progreso": "En progreso",
  terminado: "Terminado",
};

interface TaskTreatmentListProps {
  tasks: Tarea[];
  showStatusColor?: boolean;
  onSelect: (id: string) => void;
}

export default function TaskTreatmentList({
  tasks,
  showStatusColor = false,
  onSelect,
}: TaskTreatmentListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Tareas ({tasks.length})
      </h3>

      <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        {tasks.length === 0 && (
          <p className="py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No hay tareas registradas.
          </p>
        )}

        {tasks.map((task) => {
          const isUnassigned = !task.responsableId || task.responsableId === "unassigned";
          const statusColor = STATUS_COLOR[task.estado] ?? "bg-zinc-400";
          const statusLabel = STATUS_LABEL[task.estado] ?? task.estado;

          return (
            <button
              key={task.id}
              onClick={() => onSelect(task.id)}
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {task.nombre}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  {showStatusColor && (
                    <span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} />
                  )}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Estado:</span>{" "}
                  {statusLabel}
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Responsable:</span>{" "}
                  {isUnassigned ? "Sin asignar" : task.responsableId}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

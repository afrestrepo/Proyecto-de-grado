"use client";

import Link from "next/link";
import TaskTreatmentList from "@/components/evaluation/task-treatment-list";
import TaskDetail from "@/components/evaluation/task-detail";
import { useParams } from "next/navigation";
import { Tarea } from "@/types/task";
import { useState, useEffect } from "react";

export default function TreatamientoPage() {
  const params = useParams();
  const evaluationId = params?.evaluationId as string;

  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tasks/filter/sin-tratamiento")
      .then((res) => res.json())
      .then((json) => setTasks(json.data ?? []))
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false));
  }, []);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  function handleTaskSelect(id: string) {
    setSelectedTaskId(id);
  }

  function handleTaskUpdate(
    taskId: string,
    updates: Partial<Pick<Tarea, "tratamiento" | "estado">>
  ) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }

  const completedCount = tasks.filter((t) => t.tratamiento !== null).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Paso 3: Selección de Tratamiento</h2>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          RF-6: Selecciona el tratamiento adecuado para cada tarea identificada.
        </p>
      </div>

      {loadingTasks ? (
        <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-12 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando tareas...</p>
        </div>
      ) : selectedTask ? (
        <TaskDetail
          task={selectedTask}
          onBack={() => setSelectedTaskId(null)}
          onTaskUpdate={handleTaskUpdate}
        />
      ) : (
        <>
          <TaskTreatmentList
            tasks={tasks}
            onSelect={handleTaskSelect}
          />

          {tasks.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Tratamientos asignados:{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {completedCount}/{tasks.length}
                </span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between pt-4">
        <Link
          href={`/evaluation/${evaluationId}/analysis`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Análisis
        </Link>
        <Link
          href={`/evaluation/${evaluationId}/tracking`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Siguiente: Seguimiento →
        </Link>
      </div>
    </div>
  );
}

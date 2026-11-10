"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Tarea } from "@/types/task";
import { TaskStatus } from "@/types/task";
import TaskTreatmentList from "@/components/evaluation/task-treatment-list";
import TaskTrackingDetail from "@/components/evaluation/task-tracking-detail";

export default function SeguimientoPage() {
  const params = useParams();
  const evaluationId = params?.evaluationId as string;

  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Tarea | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetch("/api/tasks/filter/con-tratamiento")
      .then((res) => res.json())
      .then((json) => setTasks(json.data ?? []))
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false));
  }, []);

  async function handleSelect(id: string) {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/tasks/${id}`);
      const json = await res.json();
      setSelectedTask(json.data ?? json);
    } catch {
      // fallback to list data if detail fetch fails
      setSelectedTask(tasks.find((t) => t.id === id) ?? null);
    } finally {
      setLoadingDetail(false);
    }
  }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, estado: status } : t))
    );
    setSelectedTask((prev) => (prev?.id === taskId ? { ...prev, estado: status } : prev));
  }

  function handleTaskUpdate(taskId: string, updates: Partial<Pick<Tarea, "notas" | "documentos">>) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
    setSelectedTask((prev) => (prev?.id === taskId ? { ...prev, ...updates } : prev));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Paso 4: Seguimiento</h2>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          RF-8: Gestiona el ciclo de vida de cada tarea — estado, controles, notas y documentos.
        </p>
      </div>

      {loadingTasks || loadingDetail ? (
        <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-12 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {loadingDetail ? "Cargando detalle..." : "Cargando tareas..."}
          </p>
        </div>
      ) : selectedTask ? (
        <TaskTrackingDetail
          task={selectedTask}
          onBack={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
          onTaskUpdate={handleTaskUpdate}
        />
      ) : (
        <TaskTreatmentList
          tasks={tasks}
          showStatusColor
          onSelect={handleSelect}
        />
      )}

      <div className="flex justify-between pt-4">
        <Link
          href={`/evaluation/${evaluationId}/treatment`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Tratamiento
        </Link>
        <Link
          href="/evaluation"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Finalizar Evaluación ✓
        </Link>
      </div>
    </div>
  );
}

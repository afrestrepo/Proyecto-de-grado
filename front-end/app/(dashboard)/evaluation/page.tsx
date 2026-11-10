import Link from "next/link";

const MOCK_EVALUATIONS = [
  { id: "eval-001", name: "Evaluación Q1 2026", status: "En progreso", step: "identification", date: "2026-03-15" },
  { id: "eval-002", name: "Auditoría Anual", status: "En progreso", step: "analysis", date: "2026-04-01" },
  { id: "eval-003", name: "Revisión Infraestructura", status: "En progreso", step: "treatment", date: "2026-04-10" },
];

const STATUS_STYLES: Record<string, string> = {
  "En progreso": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Completada: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default function EvaluacionesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evaluaciones de Riesgo</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Gestiona las evaluaciones de riesgo de tu organización.
          </p>
        </div>
        <Link
          href="/evaluation/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          + Nueva Evaluación
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Nombre</th>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Estado</th>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Fecha</th>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {MOCK_EVALUATIONS.map((ev) => (
              <tr key={ev.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-medium">{ev.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[ev.status] ?? ""}`}>
                    {ev.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{ev.date}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/evaluation/${ev.id}/${ev.step}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Continuar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

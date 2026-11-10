import Link from "next/link";

const STATS = [
  { label: "Evaluaciones Activas", value: "3", icon: "📋" },
  { label: "Vulnerabilidades Detectadas", value: "12", icon: "⚠️" },
  { label: "Riesgos Críticos", value: "2", icon: "🔴" },
  { label: "Tareas Pendientes", value: "7", icon: "📌" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Resumen general del estado de seguridad de la organización.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </p>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Evaluaciones Recientes</h2>
          <Link
            href="/evaluation"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Ver todas →
          </Link>
        </div>
        <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
          {["eval-001", "eval-002", "eval-003"].map((id) => (
            <Link
              key={id}
              href={`/evaluation/${id}`}
              className="flex items-center justify-between py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 -mx-2 px-2 rounded"
            >
              <div>
                <p className="text-sm font-medium">Evaluación {id}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Última actualización: hace 2 días
                </p>
              </div>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                En progreso
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

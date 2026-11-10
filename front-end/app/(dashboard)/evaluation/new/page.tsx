import Link from "next/link";

export default function NuevaEvaluacionPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nueva Evaluación</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Completa los datos iniciales para crear una nueva evaluación de riesgo.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <form className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre de la evaluación</label>
            <input
              type="text"
              placeholder="Ej: Evaluación Q2 2026"
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Descripción</label>
            <textarea
              rows={3}
              placeholder="Descripción opcional de la evaluación..."
              className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/evaluation/eval-new/identification"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Crear y Comenzar
            </Link>
            <Link
              href="/evaluation"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

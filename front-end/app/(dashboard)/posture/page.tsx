export default function PosturaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Postura de Seguridad</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          RF-9: Medición de la postura de seguridad con NIST-CSF v2.0.
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 py-16 dark:border-zinc-700">
        <div className="text-center">
          <span className="text-4xl">📈</span>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Este módulo será implementado próximamente.</p>
        </div>
      </div>
    </div>
  );
}

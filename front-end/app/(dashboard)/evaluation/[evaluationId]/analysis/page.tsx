import Link from "next/link";
import RiskCalculator from "@/components/evaluation/risk-calculator";

export default async function AnalisisPage({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">
          Paso 2: Análisis de Probabilidad e Impacto
        </h2>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          RF-4: Cálculo basado en la{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            OWASP Risk Rating Methodology
          </span>
          . Probabilidad calculada desde todas las amenazas y vulnerabilidades registradas.
        </p>
      </div>

      <RiskCalculator />

      <div className="flex justify-between">
        <Link
          href={`/evaluation/${evaluationId}/identification`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Identificación
        </Link>
        <Link
          href={`/evaluation/${evaluationId}/treatment`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Siguiente: Tratamiento →
        </Link>
      </div>
    </div>
  );
}

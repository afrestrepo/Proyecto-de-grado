"use client";

import { useEffect, useState, useTransition } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Calculation {
  threat_description: string;
  vulnerability_cve: string | null;
  likelihood: { score: number; level: string };
  technical_impact: { score: number; level: string };
  business_impact: { score: number; level: string };
  selected_impact: { type: string; score: number; level: string };
  severity: string;
}

interface AssetResult {
  asset_name: string;
  asset_profile: string;
  asset_description: string;
  worst_severity: string;
  avg_likelihood: number;
  avg_impact: number;
  calculations: Calculation[];
}

interface SimulateResponse {
  metadata: {
    generated_assets: number;
    total_calculations: number;
    duration_ms: number;
  };
  summary: {
    severity_distribution: Record<string, number>;
    global_avg_likelihood: number;
    global_avg_impact: number;
    highest_risk_assets: Array<{
      name: string;
      profile: string;
      worst_severity: string;
      avg_impact: number;
    }>;
  };
  assets: AssetResult[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

const LEVEL_ES: Record<string, string> = {
  Low: "BAJO", Medium: "MEDIO", High: "ALTO", Critical: "CRÍTICO",
};

function severityBadge(level: string) {
  const es = LEVEL_ES[level] ?? level;
  const cls =
    level === "Low"      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
    level === "Medium"   ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
    level === "High"     ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
    level === "Critical" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                           "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{es}</span>;
}

function barColor(level: string) {
  if (level === "Critical") return "bg-purple-400";
  if (level === "High")     return "bg-red-400";
  if (level === "Medium")   return "bg-yellow-400";
  return "bg-green-400";
}

// ── AssetRow (defined outside per composition rules) ───────────────────────

function AssetRow({ asset, index }: { asset: AssetResult; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 font-mono text-xs text-zinc-400">{index + 1}</span>
          <div>
            <p className="text-sm font-medium">{asset.asset_name}</p>
            <p className="text-xs text-zinc-400">{asset.asset_profile} — {asset.asset_description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-zinc-400">Prob. media</p>
            <p className="font-mono text-sm font-bold">{asset.avg_likelihood.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">Imp. medio</p>
            <p className="font-mono text-sm font-bold">{asset.avg_impact.toFixed(2)}</p>
          </div>
          {severityBadge(asset.worst_severity)}
          <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left uppercase tracking-wider text-zinc-400">
                <th className="pb-2 pr-3 font-semibold">Amenaza</th>
                <th className="pb-2 pr-3 font-semibold">CVE</th>
                <th className="pb-2 pr-3 font-semibold">Probabilidad</th>
                <th className="pb-2 pr-3 font-semibold">Impacto técnico</th>
                <th className="pb-2 pr-3 font-semibold">Impacto negocio</th>
                <th className="pb-2 pr-3 font-semibold">Seleccionado</th>
                <th className="pb-2 font-semibold">Severidad</th>
              </tr>
            </thead>
            <tbody>
              {asset.calculations.map((c, i) => (
                <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-3 max-w-xs">
                    <span className="line-clamp-2">{c.threat_description}</span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-zinc-500">{c.vulnerability_cve ?? "—"}</td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{c.likelihood.score.toFixed(1)}</span>
                      {severityBadge(c.likelihood.level)}
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{c.technical_impact.score.toFixed(1)}</span>
                      {severityBadge(c.technical_impact.level)}
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{c.business_impact.score.toFixed(1)}</span>
                      {severityBadge(c.business_impact.level)}
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{c.selected_impact.score.toFixed(1)}</span>
                      <span className="text-zinc-400">({c.selected_impact.type === "business" ? "neg." : "tec."})</span>
                    </div>
                  </td>
                  <td className="py-2">{severityBadge(c.severity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── RiskCalculator ─────────────────────────────────────────────────────────

const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;

export default function RiskCalculator() {
  const [data, setData] = useState<SimulateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadData() {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/risks");
        if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      }
    });
  }

  useEffect(() => { loadData(); }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
        <p className="font-semibold">No se pudo conectar al servidor</p>
        <p className="mt-1 text-xs">{error}</p>
        <button type="button" onClick={loadData}
          className="mt-3 rounded-md border border-red-300 px-3 py-1 text-xs hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30">
          Reintentar
        </button>
      </div>
    );
  }

  if (isPending && !data) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
        Simulando portafolio de riesgo…
      </div>
    );
  }

  if (!data) return null;

  const { metadata, summary, assets } = data;
  const total = metadata.total_calculations || 1;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{metadata.generated_assets} activos</span>
          {" "}evaluados contra amenazas y vulnerabilidades reales de la BD ·{" "}
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{metadata.total_calculations} cálculos</span>
          {" "}en {metadata.duration_ms} ms
        </p>
        <button
          type="button"
          onClick={loadData}
          disabled={isPending}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {isPending ? "Simulando…" : "Resimular"}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Severity distribution */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold">Distribución de Severidad</p>
          <div className="flex flex-col gap-2">
            {SEVERITY_ORDER.map((s) => {
              const n = summary.severity_distribution[s] ?? 0;
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-20">{severityBadge(s)}</div>
                  <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-4 rounded-full ${barColor(s)}`}
                      style={{ width: `${(n / total) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono text-xs font-bold">{n}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 border-t border-zinc-100 pt-2 text-xs text-zinc-400 dark:border-zinc-800">
            Prob. media global:{" "}
            <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{summary.global_avg_likelihood}</span>
            {" "}· Impacto medio:{" "}
            <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{summary.global_avg_impact}</span>
          </div>
        </div>

        {/* Highest risk assets */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold">Activos de Mayor Riesgo</p>
          <div className="flex flex-col gap-3">
            {summary.highest_risk_assets.map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-zinc-400">{a.profile}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">imp. {a.avg_impact.toFixed(1)}</span>
                  {severityBadge(a.worst_severity)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-asset accordion */}
      <div>
        <p className="mb-2 text-sm font-semibold">Detalle por Activo</p>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
          {assets.map((asset, i) => (
            <AssetRow key={`${asset.asset_name}-${i}`} asset={asset} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

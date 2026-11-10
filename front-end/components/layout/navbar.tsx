"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  evaluation: "Evaluaciones",
  new: "Nueva",
  identification: "Identificación",
  analysis: "Análisis",
  treatment: "Tratamiento",
  tracking: "Seguimiento",
  company: "Empresa",
  users: "Usuarios",
  matrix: "Matriz de Riesgos",
  controls: "Controles",
  posture: "Postura de Seguridad",
  pruebas: "Pruebas",
  riesgo: "Riesgo",
};

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/" },
  ];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label =
      ROUTE_LABELS[segment] ??
      (segment.match(/^[a-f0-9-]{8,}$/) ? `#${segment.slice(0, 6)}` : segment);
    crumbs.push({ label, href: currentPath });
  }

  return crumbs;
}

export default function Navbar() {
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
            )}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          U
        </div>
      </div>
    </header>
  );
}

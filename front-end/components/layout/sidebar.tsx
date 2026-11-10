"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "General",
    items: [
      { href: "/", label: "Dashboard", icon: "📊" },
      { href: "/evaluation", label: "Evaluaciones", icon: "📋" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/company", label: "Empresa", icon: "🏢" },
      { href: "/users", label: "Usuarios", icon: "👥" },
    ],
  },
  {
    label: "Estrategia",
    items: [
      { href: "/patterns", label: "Patrones", icon: "🎯" },
    ],
  },
  {
    label: "Resultados",
    items: [
      { href: "/matrix", label: "Matriz de Riesgos", icon: "🔢" },
      { href: "/controls", label: "Controles", icon: "🛡️" },
      { href: "/posture", label: "Postura de Seguridad", icon: "📈" },
    ],
  },
  {
    label: "Pruebas",
    items: [
      { href: "/pruebas/riesgo", label: "Riesgo", icon: "🧪" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">🔒</span>
          <span>Riesgos PYMEs</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {section.label}
            </p>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                      )}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
        >
          <span className="text-base">🚪</span>
          Cerrar Sesión
        </Link>
      </div>
    </aside>
  );
}

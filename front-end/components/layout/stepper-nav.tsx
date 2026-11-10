"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STEPPER_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function StepperNav() {
  const pathname = usePathname();

  // Extract evaluationId from URL: /evaluation/{id}/step
  const match = pathname.match(/\/evaluation\/([^/]+)/);
  const evaluationId = match?.[1] ?? "";
  const currentStep = pathname.split("/").pop() ?? "";

  const currentIndex = STEPPER_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav className="flex items-center gap-0">
      {STEPPER_STEPS.map((step, i) => {
        const isActive = step.id === currentStep;
        const isCompleted = currentIndex > i;
        const href = `/evaluation/${evaluationId}/${step.href}`;

        return (
          <div key={step.id} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 w-8 sm:w-12",
                  isCompleted
                    ? "bg-zinc-900 dark:bg-zinc-100"
                    : "bg-zinc-200 dark:bg-zinc-700"
                )}
              />
            )}

            <Link
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive &&
                  "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
                isCompleted &&
                  !isActive &&
                  "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800",
                !isActive &&
                  !isCompleted &&
                  "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  isActive &&
                    "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100",
                  isCompleted &&
                    !isActive &&
                    "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
                  !isActive &&
                    !isCompleted &&
                    "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                )}
              >
                {isCompleted && !isActive ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

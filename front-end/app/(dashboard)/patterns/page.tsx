"use client";

import { Button } from "@/components/ui/button";
import { PatternForm } from "@/components/patterns/pattern-form";
import { PatternList } from "@/components/patterns/pattern-list";
import { AddControlsModal } from "@/components/patterns/add-controls-modal";
import { usePattern } from "@/hooks/use-pattern";
import { Control, CreatePatternPayload } from "@/types/pattern";
import { useEffect, useState } from "react";

export default function PatternsPage() {
  const { patterns, loading, error, fetchPatterns, createPattern, createControl } = usePattern();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddControlsOpen, setIsAddControlsOpen] = useState(false);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  const handleCreatePattern = async (
    patternData: CreatePatternPayload,
    controls: Control[]
  ) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const sanitizedPatternData: CreatePatternPayload = {
        name: patternData.name,
        description: patternData.description,
        keyControlAreas: patternData.keyControlAreas,
        whenToUse: patternData.whenToUse,
        whenNotToUse: patternData.whenNotToUse,
        typicalChallenges: patternData.typicalChallenges,
        threatResistance: patternData.threatResistance,
        assumptions: patternData.assumptions,
        developmentAreas: patternData.developmentAreas,
      };

      // Crear el patrón primero
      const createdPattern = await createPattern(sanitizedPatternData);

      // Luego crear todos los controles asociados
      for (const control of controls) {
        await createControl({
          name: control.name,
          description: control.description,
          complementaryGuidance: control.complementaryGuidance ?? undefined,
          enhancements: control.enhancements ?? undefined,
          status: control.status,
          patternId: createdPattern.id,
        });
      }

      await fetchPatterns();
      setIsFormOpen(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error creando el patrón");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddControls = (patternId: string) => {
    setSelectedPatternId(patternId);
    setIsAddControlsOpen(true);
  };

  const handleSaveControls = async (controls: Control[]) => {
    if (!selectedPatternId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Crear todos los controles asociados
      for (const control of controls) {
        await createControl({
          name: control.name,
          description: control.description,
          complementaryGuidance: control.complementaryGuidance ?? undefined,
          enhancements: control.enhancements ?? undefined,
          status: control.status,
          patternId: selectedPatternId,
        });
      }

      await fetchPatterns();
      setIsAddControlsOpen(false);
      setSelectedPatternId(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error agregando controles");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Patrones de Controles</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Crea y gestiona patrones de controles para estandarizar tu estrategia de seguridad.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{submitError}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)} disabled={isSubmitting}>
          + Crear Nuevo Patrón
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {loading && !patterns.length ? (
          <div className="p-8 text-center text-zinc-500">
            <p>Cargando patrones...</p>
          </div>
        ) : (
          <PatternList
            patterns={patterns}
            onAddControls={handleAddControls}
            loading={isSubmitting}
          />
        )}
      </div>

      <PatternForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreatePattern}
        loading={isSubmitting}
      />

      <AddControlsModal
        isOpen={isAddControlsOpen}
        onClose={() => {
          setIsAddControlsOpen(false);
          setSelectedPatternId(null);
        }}
        onSubmit={handleSaveControls}
        patternName={patterns.find((p) => p.id === selectedPatternId)?.name}
        existingControls={patterns.find((p) => p.id === selectedPatternId)?.controlsList || []}
        loading={isSubmitting}
      />
    </div>
  );
}

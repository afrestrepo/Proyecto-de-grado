"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Control, CreatePatternPayload } from "@/types/pattern";
import { useState } from "react";
import { ControlForm } from "./control-form";
import { ControlList } from "./control-list";

interface PatternFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patternData: CreatePatternPayload, controls: Control[]) => Promise<void>;
  loading?: boolean;
}

type FormStep = "info" | "controls";

interface PatternFormData extends CreatePatternPayload {}

export function PatternForm({ isOpen, onClose, onSubmit, loading = false }: PatternFormProps) {
  const [step, setStep] = useState<FormStep>("info");
  const [patternData, setPatternData] = useState<PatternFormData>({
    name: "",
    description: "",
    keyControlAreas: "",
    whenToUse: "",
    whenNotToUse: "",
    typicalChallenges: "",
    threatResistance: "",
    assumptions: "",
    developmentAreas: "",
  });

  const [controls, setControls] = useState<Control[]>([]);
  const [showControlForm, setShowControlForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!patternData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!patternData.description.trim()) newErrors.description = "La descripción es requerida";
    if (!patternData.keyControlAreas.trim())
      newErrors.keyControlAreas = "Las áreas clave son requeridas";
    if (!patternData.whenToUse.trim()) newErrors.whenToUse = "Este campo es requerido";
    if (!patternData.whenNotToUse.trim()) newErrors.whenNotToUse = "Este campo es requerido";
    if (!patternData.typicalChallenges.trim())
      newErrors.typicalChallenges = "Este campo es requerido";
    if (!patternData.threatResistance.trim())
      newErrors.threatResistance = "Este campo es requerido";
    if (!patternData.assumptions.trim()) newErrors.assumptions = "Este campo es requerido";
    if (!patternData.developmentAreas.trim())
      newErrors.developmentAreas = "Este campo es requerido";

    if (patternData.name.length > 10000) newErrors.name = "Máximo 10000 caracteres";
    if (patternData.description.length > 10000) newErrors.description = "Máximo 10000 caracteres";
    if (patternData.keyControlAreas.length > 10000) newErrors.keyControlAreas = "Máximo 10000 caracteres";
    if (patternData.whenToUse.length > 10000) newErrors.whenToUse = "Máximo 10000 caracteres";
    if (patternData.whenNotToUse.length > 10000)
      newErrors.whenNotToUse = "Máximo 10000 caracteres";
    if (patternData.typicalChallenges.length > 10000)
      newErrors.typicalChallenges = "Máximo 10000 caracteres";
    if (patternData.threatResistance.length > 10000)
      newErrors.threatResistance = "Máximo 10000 caracteres";
    if (patternData.assumptions.length > 10000) newErrors.assumptions = "Máximo 10000 caracteres";
    if (patternData.developmentAreas.length > 10000) newErrors.developmentAreas = "Máximo 10000 caracteres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep("controls");
      setErrors({});
    }
  };

  const handleAddControl = (
    newControl: Omit<Control, "id" | "createdAt" | "updatedAt" | "patternId">
  ) => {
    const control: Control = {
      ...newControl,
      id: `temp-${Date.now()}`,
      patternId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setControls([...controls, control]);
    setShowControlForm(false);
  };

  const handleRemoveControl = (index: number) => {
    setControls(controls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    await onSubmit(patternData, controls);
    handleClose();
  };

  const handleClose = () => {
    setStep("info");
    setPatternData({
      name: "",
      description: "",
      keyControlAreas: "",
      whenToUse: "",
      whenNotToUse: "",
      typicalChallenges: "",
      threatResistance: "",
      assumptions: "",
      developmentAreas: "",
    });
    setControls([]);
    setShowControlForm(false);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nuevo Patrón">
      <div className="max-h-[600px] overflow-y-auto">
        {step === "info" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre * ({patternData.name.length}/10000)
              </label>
              <Input
                type="text"
                maxLength={10000}
                value={patternData.name}
                onChange={(e) => setPatternData({ ...patternData, name: e.target.value })}
                className={errors.name ? "border-red-500" : ""}
                placeholder="Ingrese el nombre del patrón"
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción * ({patternData.description.length}/10000)
              </label>
              <Textarea
                maxLength={10000}
                value={patternData.description}
                onChange={(e) => setPatternData({ ...patternData, description: e.target.value })}
                className={errors.description ? "border-red-500" : ""}
                placeholder="Ingrese la descripción del patrón"
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Áreas Clave de Control * ({patternData.keyControlAreas.length}/10000)
              </label>
              <Textarea
                maxLength={10000}
                value={patternData.keyControlAreas}
                onChange={(e) => setPatternData({ ...patternData, keyControlAreas: e.target.value })}
                className={errors.keyControlAreas ? "border-red-500" : ""}
                placeholder="Describa las áreas clave de control"
                rows={2}
              />
              {errors.keyControlAreas && (
                <p className="text-sm text-red-500 mt-1">{errors.keyControlAreas}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cuándo Usarlo * ({patternData.whenToUse.length}/10000)
              </label>
              <Textarea
                maxLength={10000}
                value={patternData.whenToUse}
                onChange={(e) => setPatternData({ ...patternData, whenToUse: e.target.value })}
                className={errors.whenToUse ? "border-red-500" : ""}
                placeholder="Describa cuándo utilizar este patrón"
                rows={2}
              />
              {errors.whenToUse && <p className="text-sm text-red-500 mt-1">{errors.whenToUse}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cuándo NO Usarlo * ({patternData.whenNotToUse.length}/10000)
              </label>
              <Textarea
                maxLength={10000}
                value={patternData.whenNotToUse}
                onChange={(e) => setPatternData({ ...patternData, whenNotToUse: e.target.value })}
                className={errors.whenNotToUse ? "border-red-500" : ""}
                placeholder="Describa cuándo NO utilizar este patrón"
                rows={2}
              />
              {errors.whenNotToUse && (
                <p className="text-sm text-red-500 mt-1">{errors.whenNotToUse}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Retos Típicos * ({patternData.typicalChallenges.length}/10000)</label>
              <Textarea
                maxLength={10000}
                value={patternData.typicalChallenges}
                onChange={(e) => setPatternData({ ...patternData, typicalChallenges: e.target.value })}
                className={errors.typicalChallenges ? "border-red-500" : ""}
                placeholder="Liste los retos típicos que enfrenta este patrón"
                rows={2}
              />
              {errors.typicalChallenges && (
                <p className="text-sm text-red-500 mt-1">{errors.typicalChallenges}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Resistencia a Amenazas * ({patternData.threatResistance.length}/10000)</label>
              <Textarea
                maxLength={10000}
                value={patternData.threatResistance}
                onChange={(e) => setPatternData({ ...patternData, threatResistance: e.target.value })}
                className={errors.threatResistance ? "border-red-500" : ""}
                placeholder="Describa qué amenazas previene este patrón"
                rows={2}
              />
              {errors.threatResistance && (
                <p className="text-sm text-red-500 mt-1">{errors.threatResistance}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Suposiciones * ({patternData.assumptions.length}/10000)</label>
              <Textarea
                maxLength={10000}
                value={patternData.assumptions}
                onChange={(e) => setPatternData({ ...patternData, assumptions: e.target.value })}
                className={errors.assumptions ? "border-red-500" : ""}
                placeholder="Liste las suposiciones del patrón"
                rows={2}
              />
              {errors.assumptions && (
                <p className="text-sm text-red-500 mt-1">{errors.assumptions}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Áreas de Desarrollo * ({patternData.developmentAreas.length}/10000)
              </label>
              <Textarea
                maxLength={10000}
                value={patternData.developmentAreas}
                onChange={(e) =>
                  setPatternData({ ...patternData, developmentAreas: e.target.value })
                }
                className={errors.developmentAreas ? "border-red-500" : ""}
                placeholder="Describa las áreas de desarrollo o mejoras futuras"
                rows={2}
              />
              {errors.developmentAreas && (
                <p className="text-sm text-red-500 mt-1">{errors.developmentAreas}</p>
              )}
            </div>
          </div>
        )}

        {step === "controls" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Controles del Patrón</h3>
              <ControlList controls={controls} onRemove={handleRemoveControl} />
            </div>

            {!showControlForm && (
              <Button
                type="button"
                onClick={() => setShowControlForm(true)}
                variant="outline"
                className="w-full"
              >
                + Agregar Nuevo Control
              </Button>
            )}

            {showControlForm && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Nuevo Control</h4>
                <ControlForm
                  onAddControl={handleAddControl}
                  onCancel={() => setShowControlForm(false)}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
          {step === "controls" && (
            <Button
              type="button"
              onClick={() => setStep("info")}
              variant="outline"
              disabled={loading}
            >
              Atrás
            </Button>
          )}

          {step === "info" && (
            <>
              <Button type="button" onClick={handleClose} variant="outline" disabled={loading}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleNext} disabled={loading}>
                Siguiente
              </Button>
            </>
          )}

          {step === "controls" && (
            <>
              <Button type="button" onClick={handleClose} variant="outline" disabled={loading}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creando..." : "Crear Patrón"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

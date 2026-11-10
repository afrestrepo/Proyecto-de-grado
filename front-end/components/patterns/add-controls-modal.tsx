"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Control } from "@/types/pattern";
import { useEffect, useState } from "react";
import { ControlForm } from "./control-form";
import { ControlList } from "./control-list";

interface AddControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (controls: Control[]) => Promise<void>;
  patternName?: string;
  existingControls?: Control[];
  loading?: boolean;
}

export function AddControlsModal({
  isOpen,
  onClose,
  onSubmit,
  patternName = "Patrón",
  existingControls = [],
  loading = false,
}: AddControlsModalProps) {
  const [controls, setControls] = useState<Control[]>([]);
  const [showControlForm, setShowControlForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setControls([...existingControls]);
    }
  }, [isOpen, existingControls]);

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
    // Filtrar solo los controles nuevos (aquellos con ID que empieza con "temp-")
    const newControls = controls.filter((c) => c.id.startsWith("temp-"));
    if (newControls.length > 0) {
      await onSubmit(newControls);
    }
    handleClose();
  };

  const handleClose = () => {
    setControls([]);
    setShowControlForm(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Agregar Controles a: ${patternName}`}>
      <div className="max-h-[600px] overflow-y-auto">
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

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
          <Button type="button" onClick={handleClose} variant="outline" disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !controls.some((c) => c.id.startsWith("temp-"))}
          >
            {loading ? "Guardando..." : "Guardar Controles"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

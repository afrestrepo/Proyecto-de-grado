"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Control, ControlStatus } from "@/types/pattern";
import { useState } from "react";

interface ControlFormProps {
  onAddControl: (control: Omit<Control, "id" | "createdAt" | "updatedAt" | "patternId">) => void;
  onCancel: () => void;
}

const CONTROL_STATUSES: ControlStatus[] = ["None", "tomado", "en progreso", "terminado"];

export function ControlForm({ onAddControl, onCancel }: ControlFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    complementaryGuidance: "",
    enhancements: "",
    status: "None" as ControlStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    if (formData.name.length > 10000) {
      newErrors.name = "Máximo 10000 caracteres";
    }

    if (formData.description.length > 10000) {
      newErrors.description = "Máximo 10000 caracteres";
    }

    if (formData.complementaryGuidance.length > 10000) {
      newErrors.complementaryGuidance = "Máximo 10000 caracteres";
    }

    if (formData.enhancements.length > 10000) {
      newErrors.enhancements = "Máximo 10000 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onAddControl({
      name: formData.name.trim(),
      description: formData.description.trim(),
      complementaryGuidance: formData.complementaryGuidance.trim() || undefined,
      enhancements: formData.enhancements.trim() || undefined,
      status: formData.status,
    });

    setFormData({
      name: "",
      description: "",
      complementaryGuidance: "",
      enhancements: "",
      status: "None",
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre * ({formData.name.length}/10000)</label>
        <Input
          type="text"
          maxLength={10000}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? "border-red-500" : ""}
          placeholder="Ingrese el nombre del control"
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción * ({formData.description.length}/10000)</label>
        <Textarea
          maxLength={10000}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={errors.description ? "border-red-500" : ""}
          placeholder="Ingrese la descripción del control"
          rows={3}
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Orientación Complementaria (Opcional) ({formData.complementaryGuidance.length}/10000)
        </label>
        <Textarea
          maxLength={10000}
          value={formData.complementaryGuidance}
          onChange={(e) => setFormData({ ...formData, complementaryGuidance: e.target.value })}
          placeholder="Ingrese orientación complementaria"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Enhancements/Mejoras (Opcional) ({formData.enhancements.length}/10000)
        </label>
        <Textarea
          maxLength={10000}
          value={formData.enhancements}
          onChange={(e) => setFormData({ ...formData, enhancements: e.target.value })}
          placeholder="Ingrese mejoras o enhancements"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Estado</label>
        <Select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ControlStatus })}
        >
          {CONTROL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button type="submit">Agregar Control</Button>
      </div>
    </form>
  );
}

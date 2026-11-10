"use client";

import { Button } from "@/components/ui/button";
import { Control } from "@/types/pattern";
import { Trash2 } from "lucide-react";

interface ControlListProps {
  controls: Control[];
  onRemove: (index: number) => void;
}

export function ControlList({ controls, onRemove }: ControlListProps) {
  if (controls.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay controles agregados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {controls.map((control, index) => (
        <div
          key={control.id}
          className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{control.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{control.description}</p>

              {control.complementaryGuidance && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700">Orientación Complementaria:</p>
                  <p className="text-sm text-gray-600">{control.complementaryGuidance}</p>
                </div>
              )}

              {control.enhancements && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700">Mejoras:</p>
                  <p className="text-sm text-gray-600">{control.enhancements}</p>
                </div>
              )}

              <div className="mt-2 flex items-center gap-4">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    control.status
                  )}`}
                >
                  {control.status}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => onRemove(index)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "None":
      return "bg-gray-100 text-gray-800";
    case "tomado":
      return "bg-blue-100 text-blue-800";
    case "en progreso":
      return "bg-yellow-100 text-yellow-800";
    case "terminado":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

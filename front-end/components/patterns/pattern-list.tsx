"use client";

import { Button } from "@/components/ui/button";
import { Pattern } from "@/types/pattern";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

interface PatternListProps {
  patterns: Pattern[];
  onAddControls: (patternId: string) => void;
  loading?: boolean;
}

export function PatternList({ patterns, onAddControls, loading = false }: PatternListProps) {
  const validPatterns = patterns.filter(Boolean);

  if (validPatterns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay patrones creados aún</p>
        <p className="text-sm mt-1">Haz clic en "Crear Nuevo Patrón" para empezar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Controles
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Creación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {validPatterns.map((pattern) => (
            <tr key={pattern.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {pattern.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {pattern.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {pattern.controlsCount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(pattern.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddControls(pattern.id)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Controles
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

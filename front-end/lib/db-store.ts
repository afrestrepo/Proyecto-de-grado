// Almacenamiento en memoria para desarrollo/testing
// En producción, esto debería ser una base de datos real

import { Control, Pattern } from "@/types/pattern";

interface Store {
  patterns: Pattern[];
  controls: Record<string, Control[]>;
  patternCounters: Record<string, number>; // Para contar controles por patrón
}

const store: Store = {
  patterns: [],
  controls: {},
  patternCounters: {},
};

export function getAllPatterns(): Pattern[] {
  return store.patterns;
}

export function getPatternById(id: string): Pattern | undefined {
  return store.patterns.find((p) => p.id === id);
}

export function createPattern(data: Omit<Pattern, "id" | "createdAt" | "updatedAt" | "controlsCount">): Pattern {
  const newPattern: Pattern = {
    ...data,
    id: `pat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    controlsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.patterns.push(newPattern);
  store.controls[newPattern.id] = [];
  store.patternCounters[newPattern.id] = 0;

  return newPattern;
}

export function deletePattern(id: string): boolean {
  const index = store.patterns.findIndex((p) => p.id === id);
  if (index === -1) return false;

  store.patterns.splice(index, 1);
  delete store.controls[id];
  delete store.patternCounters[id];

  return true;
}

export function getPatternControls(patternId: string): Control[] {
  return store.controls[patternId] || [];
}

export function createControl(data: Omit<Control, "id" | "createdAt" | "updatedAt">): Control {
  const newControl: Control = {
    ...data,
    id: `ctl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!store.controls[data.patternId]) {
    store.controls[data.patternId] = [];
  }

  store.controls[data.patternId].push(newControl);

  // Actualizar contador en el patrón
  const pattern = store.patterns.find((p) => p.id === data.patternId);
  if (pattern) {
    pattern.controlsCount = store.controls[data.patternId].length;
    pattern.updatedAt = new Date().toISOString();
  }

  return newControl;
}

export function deleteControl(id: string, patternId: string): boolean {
  if (!store.controls[patternId]) return false;

  const index = store.controls[patternId].findIndex((c) => c.id === id);
  if (index === -1) return false;

  store.controls[patternId].splice(index, 1);

  // Actualizar contador en el patrón
  const pattern = store.patterns.find((p) => p.id === patternId);
  if (pattern) {
    pattern.controlsCount = store.controls[patternId].length;
    pattern.updatedAt = new Date().toISOString();
  }

  return true;
}

"use client";

import { useState, useEffect, useRef } from "react";

interface DocumentPathModalProps {
  initialValue?: string;
  onConfirm: (path: string) => void;
  onClose: () => void;
}

export default function DocumentPathModal({
  initialValue = "",
  onConfirm,
  onClose,
}: DocumentPathModalProps) {
  const [path, setPath] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && path.trim()) {
      onConfirm(path.trim());
      onClose();
    }
    if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Buscar ruta del documento
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Escribe o pega la URL o ruta del documento.
          </p>
        </div>

        <div className="p-5">
          <input
            ref={inputRef}
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://storage.empresa.com/documento.pdf"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          {path.trim() && (
            <p className="mt-2 truncate text-xs text-zinc-500 dark:text-zinc-400">
              {path.trim()}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (path.trim()) {
                onConfirm(path.trim());
                onClose();
              }
            }}
            disabled={!path.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { Tarea, TaskNote, TaskDocument, TaskStatus, Control, AuditEntry } from "@/types/task";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "tomado", label: "Tomado" },
  { value: "en progreso", label: "En progreso" },
  { value: "terminado", label: "Terminado" },
];

const MOCK_RESPONSABLES = [
  { id: "user-1", nombre: "Responsable 1" },
  { id: "user-2", nombre: "Responsable 2" },
  { id: "user-3", nombre: "Responsable 3" },
];

interface TaskTrackingDetailProps {
  task: Tarea;
  onBack: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Pick<Tarea, "notas" | "documentos">>) => void;
}

export default function TaskTrackingDetail({
  task,
  onBack,
  onStatusChange,
  onTaskUpdate,
}: TaskTrackingDetailProps) {
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [controls] = useState<Control[]>(task.controles ?? []);
  const [savingStatus, setSavingStatus] = useState(false);

  const [responsableId, setResponsableId] = useState<string>(task.responsableId ?? "");
  const [savingResponsable, setSavingResponsable] = useState(false);
  const [responsableError, setResponsableError] = useState<string | null>(null);

  const [notes, setNotes] = useState<TaskNote[]>(task.notas ?? []);
  const [newNoteText, setNewNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<TaskDocument[]>(task.documentos ?? []);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [addingDoc, setAddingDoc] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editDocName, setEditDocName] = useState("");
  const [docError, setDocError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileTargetRef = useRef<"new" | "edit">("new");

  function openFilePicker(target: "new" | "edit") {
    fileTargetRef.current = target;
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileTargetRef.current === "new") {
      setNewFile(file);
    }
    e.target.value = "";
  }

  async function handleStatusSelect(s: TaskStatus) {
    if (s === status || savingStatus) return;
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: s }),
      });
      if (!res.ok) throw new Error();
      setStatus(s);
      onStatusChange(task.id, s);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleResponsableSelect(id: string) {
    if (id === responsableId || savingResponsable) return;
    setSavingResponsable(true);
    setResponsableError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responsableId: id }),
      });
      if (!res.ok) throw new Error();
      setResponsableId(id);
    } catch {
      setResponsableError("No se pudo cambiar el responsable.");
    } finally {
      setSavingResponsable(false);
    }
  }

  async function handleAddNote() {
    const text = newNoteText.trim();
    if (!text) return;
    setAddingNote(true);
    setNoteError(null);
    try {
      const res = await fetch(`/api/tasks/${task.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: text }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const updated = [json.data, ...notes];
      setNotes(updated);
      onTaskUpdate(task.id, { notas: updated });
      setNewNoteText("");
    } catch {
      setNoteError("No se pudo agregar la nota.");
    } finally {
      setAddingNote(false);
    }
  }

  async function handleUpdateNote(noteId: string) {
    const text = editNoteText.trim();
    if (!text) return;
    setNoteError(null);
    try {
      const res = await fetch(`/api/tasks/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: text }),
      });
      if (!res.ok) throw new Error();
      const updated = notes.map((n) => (n.id === noteId ? { ...n, texto: text } : n));
      setNotes(updated);
      onTaskUpdate(task.id, { notas: updated });
      setEditingNoteId(null);
    } catch {
      setNoteError("No se pudo actualizar la nota.");
    }
  }

  async function handleDeleteNote(noteId: string) {
    setNoteError(null);
    try {
      const res = await fetch(`/api/tasks/notes/${noteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const updated = notes.filter((n) => n.id !== noteId);
      setNotes(updated);
      onTaskUpdate(task.id, { notas: updated });
    } catch {
      setNoteError("No se pudo eliminar la nota.");
    }
  }

  async function handleAddDocument() {
    if (!newFile) return;
    setAddingDoc(true);
    setDocError(null);
    try {
      const formData = new FormData();
      formData.append("file", newFile);

      const res = await fetch(`/api/tasks/${task.id}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const updated = [json.data, ...documents];
      setDocuments(updated);
      onTaskUpdate(task.id, { documentos: updated });
      setNewFile(null);
    } catch {
      setDocError("No se pudo subir el documento.");
    } finally {
      setAddingDoc(false);
    }
  }

  async function handleUpdateDocument(docId: string) {
    const fileName = editDocName.trim();
    if (!fileName) return;
    setDocError(null);
    try {
      const res = await fetch(`/api/tasks/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreArchivo: fileName }),
      });
      if (!res.ok) throw new Error();
      const updated = documents.map((d) =>
        d.id === docId ? { ...d, nombreArchivo: fileName } : d
      );
      setDocuments(updated);
      onTaskUpdate(task.id, { documentos: updated });
      setEditingDocId(null);
    } catch {
      setDocError("No se pudo actualizar el documento.");
    }
  }

  async function handleDeleteDocument(docId: string) {
    setDocError(null);
    try {
      const res = await fetch(`/api/tasks/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const updated = documents.filter((d) => d.id !== docId);
      setDocuments(updated);
      onTaskUpdate(task.id, { documentos: updated });
    } catch {
      setDocError("No se pudo eliminar el documento.");
    }
  }

  const isUnassigned = !responsableId || responsableId === "unassigned";
  const responsableNombre =
    MOCK_RESPONSABLES.find((r) => r.id === responsableId)?.nombre ??
    (isUnassigned ? "Sin asignar" : responsableId);

  return (
    <div className="flex flex-col gap-6">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="mt-0.5 shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Volver
        </button>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{task.nombre}</h3>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Amenaza:</span>{" "}
              {task.amenazaId}
            </span>
            <span>·</span>
            <span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Responsable:</span>{" "}
              {responsableNombre}
            </span>
            {task.tratamiento && (
              <>
                <span>·</span>
                <span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Tratamiento:</span>{" "}
                  <span className="capitalize">{task.tratamiento}</span>
                </span>
              </>
            )}
            {task.grupo && (
              <>
                <span>·</span>
                <span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Grupo:</span>{" "}
                  {task.grupo}
                </span>
              </>
            )}
          </div>
          {task.descripcionGrupo && (
            <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">{task.descripcionGrupo}</p>
          )}
        </div>
      </div>

      {/* Estado */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Estado de la tarea</h4>
          {savingStatus && <span className="text-xs text-zinc-400">Guardando...</span>}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusSelect(opt.value)}
              disabled={savingStatus}
              className={`rounded-lg border-2 px-3 py-2 text-center text-sm transition-all disabled:opacity-60 ${
                status === opt.value
                  ? "border-blue-500 bg-blue-50 font-medium dark:border-blue-400 dark:bg-blue-950"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsable */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold">Responsable</h4>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              Actualmente: <span className="font-medium text-zinc-600 dark:text-zinc-300">{responsableNombre}</span>
            </p>
          </div>
          {savingResponsable && <span className="text-xs text-zinc-400">Guardando...</span>}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MOCK_RESPONSABLES.map((r) => (
            <button
              key={r.id}
              onClick={() => handleResponsableSelect(r.id)}
              disabled={savingResponsable}
              className={`rounded-lg border-2 px-3 py-2 text-center text-sm transition-all disabled:opacity-60 ${
                responsableId === r.id
                  ? "border-indigo-500 bg-indigo-50 font-medium dark:border-indigo-400 dark:bg-indigo-950"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
              }`}
            >
              {r.nombre}
            </button>
          ))}
        </div>
        {responsableError && (
          <p className="mt-2 text-xs text-red-500">{responsableError}</p>
        )}
      </div>

      {/* Controles */}
      {controls.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <h4 className="text-sm font-semibold">Controles ({controls.length})</h4>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {controls.map((control) => {
              const desc = control.descriptionEs ?? control.description ?? null;
              return (
                <div key={control.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {control.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {control.name}
                        </span>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          {control.familyName}
                        </span>
                      </div>
                      {desc && (
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notas */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h4 className="text-sm font-semibold">Notas ({notes.length})</h4>
        </div>
        <div className="flex flex-col gap-3 p-4">
          {notes.length === 0 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Sin notas aún.</p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800"
            >
              {editingNoteId === note.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="rounded border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">{note.texto}</p>
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(note.creadoEn).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => { setEditingNoteId(note.id); setEditNoteText(note.texto); }}
                      className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-2 pt-1">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Escribe una nota..."
              rows={2}
              className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNote}
                disabled={addingNote || !newNoteText.trim()}
                className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {addingNote ? "Guardando..." : "Agregar nota"}
              </button>
              {noteError && <p className="text-xs text-red-500">{noteError}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h4 className="text-sm font-semibold">Documentos ({documents.length})</h4>
        </div>
        <div className="flex flex-col gap-3 p-4">
          {documents.length === 0 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Sin documentos aún.</p>
          )}
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800"
            >
              {editingDocId === doc.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editDocName}
                    onChange={(e) => setEditDocName(e.target.value)}
                    placeholder="Nombre del archivo"
                    className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateDocument(doc.id)}
                      className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingDocId(null)}
                      className="rounded border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {doc.nombreArchivo}
                    </p>
                    {doc.urlArchivo ? (
                      <a
                        href={doc.urlArchivo.startsWith("http") ? doc.urlArchivo : `http://localhost:5000${doc.urlArchivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Descargar
                      </a>
                    ) : (
                      <p className="mt-0.5 text-xs text-zinc-400">Sin archivo</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(doc.subidoEn).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => {
                        setEditingDocId(doc.id);
                        setEditDocName(doc.nombreArchivo);
                      }}
                      className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
              <span className="flex-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
                {newFile ? newFile.name : "Ningún archivo seleccionado"}
              </span>
              <button
                type="button"
                onClick={() => openFilePicker("new")}
                className="shrink-0 rounded border border-zinc-300 px-2 py-1.5 text-xs hover:bg-white dark:border-zinc-600 dark:hover:bg-zinc-700"
              >
                Examinar...
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddDocument}
                disabled={addingDoc || !newFile}
                className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {addingDoc ? "Subiendo..." : "Subir documento"}
              </button>
              {docError && <p className="text-xs text-red-500">{docError}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Historial de auditoría */}
      <AuditLog entries={task.historial ?? []} />
    </div>
  );
}

/* ── Historial inmutable ─────────────────────────────────────────── */

const ACTION_CONFIG: Record<string, { label: string; dot: string }> = {
  TRATAMIENTO_CAMBIADO:  { label: "Tratamiento cambiado",  dot: "bg-blue-500" },
  ESTADO_CAMBIADO:       { label: "Estado cambiado",        dot: "bg-yellow-500" },
  "NOTA_AÑADIDA":        { label: "Nota añadida",           dot: "bg-green-500" },
  NOTA_ACTUALIZADA:      { label: "Nota actualizada",       dot: "bg-purple-500" },
  NOTA_ELIMINADA:        { label: "Nota eliminada",         dot: "bg-red-500" },
  "DOCUMENTO_AÑADIDO":   { label: "Documento añadido",      dot: "bg-green-500" },
  DOCUMENTO_ACTUALIZADO: { label: "Documento actualizado",  dot: "bg-purple-500" },
  DOCUMENTO_ELIMINADO:   { label: "Documento eliminado",    dot: "bg-red-500" },
  RESPONSABLE_CAMBIADO:  { label: "Responsable cambiado",   dot: "bg-indigo-500" },
};

function AuditLog({ entries }: { entries: AuditEntry[] }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
  );

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h4 className="text-sm font-semibold">Historial de cambios</h4>
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Registro inmutable de actividad</p>
      </div>

      <div className="relative p-4">
        {sorted.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Sin cambios registrados aún.</p>
        ) : (
          <>
            <div className="absolute left-7 top-4 bottom-4 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex flex-col gap-5">
              {sorted.map((entry, i) => {
                const config = ACTION_CONFIG[entry.accion] ?? {
                  label: entry.accion,
                  dot: "bg-zinc-400",
                };
                return (
                  <div key={i} className="relative flex gap-4">
                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                      <span className={`h-3 w-3 rounded-full ${config.dot}`} />
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {config.label}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {new Date(entry.creadoEn).toLocaleString("es-CO")}
                        </span>
                      </div>
                      {(entry.valorAntes !== null || entry.valorDespues !== null) && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                          {entry.valorAntes !== null && (
                            <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 line-through dark:bg-red-900/20 dark:text-red-400">
                              {entry.valorAntes}
                            </span>
                          )}
                          {entry.valorAntes !== null && entry.valorDespues !== null && (
                            <span className="text-zinc-400">→</span>
                          )}
                          {entry.valorDespues !== null && (
                            <span className="rounded bg-green-50 px-2 py-0.5 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                              {entry.valorDespues}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                        por {entry.creadoPor}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

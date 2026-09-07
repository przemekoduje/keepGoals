import React, { useState } from "react";
import type {
  Goal,
  GoalHorizon,
  KeyResult,
  Project,
  CreateGoalPayload,
  UpdateGoalPayload,
} from "../services/api";
import {
  X,
  Target,
  Award,
  Calendar,
  FolderKanban,
  Plus,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";

interface GoalModalProps {
  goal?: Goal | null; // If provided, we're editing; if null, creating
  projects?: Project[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateGoalPayload | UpdateGoalPayload) => Promise<void>;
}

const COLOR_OPTIONS = [
  { name: "Bursztynowy", value: "#fef3c7" },
  { name: "Szmaragdowy", value: "#d1fae5" },
  { name: "Błękitny", value: "#dbeafe" },
  { name: "Fioletowy", value: "#f3e8ff" },
  { name: "Koralowy", value: "#fee2e2" },
  { name: "Klasyczny biały", value: "#ffffff" },
];

export const GoalModal: React.FC<GoalModalProps> = ({
  goal,
  projects = [],
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(goal?.title || "");
  const [description, setDescription] = useState(goal?.description || "");
  const [horizon, setHorizon] = useState<GoalHorizon>(
    goal?.horizon || "quarterly"
  );
  const [projectId, setProjectId] = useState<string>(goal?.project_id || "");
  const [color, setColor] = useState<string>(goal?.color || "#fef3c7");
  const [keyResults, setKeyResults] = useState<KeyResult[]>(
    goal?.key_results && goal.key_results.length > 0
      ? [...goal.key_results]
      : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddKeyResult = () => {
    setKeyResults([
      ...keyResults,
      {
        title: "",
        current_value: 0,
        target_value: 100,
        unit: "%",
      },
    ]);
  };

  const handleRemoveKeyResult = (index: number) => {
    setKeyResults(keyResults.filter((_, i) => i !== index));
  };

  const handleUpdateKeyResult = (
    index: number,
    field: keyof KeyResult,
    value: any
  ) => {
    const updated = [...keyResults];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setKeyResults(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Tytuł celu jest wymagany.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filter out empty key results
      const validKeyResults = keyResults
        .filter((kr) => kr.title.trim() !== "")
        .map((kr) => ({
          title: kr.title.trim(),
          current_value: Number(kr.current_value) || 0,
          target_value: Number(kr.target_value) || 100,
          unit: kr.unit.trim() || "%",
        }));

      const payload: CreateGoalPayload | UpdateGoalPayload = {
        title: title.trim(),
        description: description.trim(),
        horizon,
        project_id: projectId ? projectId : null,
        color,
        key_results: validKeyResults,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Wystąpił błąd podczas zapisywania celu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {goal ? "Edytuj cel strategiczny" : "Nowy cel strategiczny"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Tytuł celu *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Ekspansja marki na rynek DACH"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Horizon Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Horyzont czasowy (OKR)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setHorizon("long_term")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  horizon === "long_term"
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 shadow-sm"
                    : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Award className="w-4 h-4 mb-1 text-amber-500" />
                <span>Roczny / Wizja</span>
              </button>

              <button
                type="button"
                onClick={() => setHorizon("quarterly")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  horizon === "quarterly"
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 shadow-sm"
                    : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Target className="w-4 h-4 mb-1 text-blue-500" />
                <span>Kwartalny</span>
              </button>

              <button
                type="button"
                onClick={() => setHorizon("monthly")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  horizon === "monthly"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 shadow-sm"
                    : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Calendar className="w-4 h-4 mb-1 text-emerald-500" />
                <span>Miesięczny</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Opis i założenia strategiczne
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jakie są kluczowe założenia, motywacje i kryteria sukcesu..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-sm font-medium resize-none"
            />
          </div>

          {/* Project Association */}
          {projects.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Powiązany projekt
              </label>
              <div className="relative">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-sm font-medium appearance-none"
                >
                  <option value="">Brak powiązanego projektu</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <FolderKanban className="w-4 h-4 absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Key Results Section (OKR) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Kluczowe rezultaty / Mierniki postępu (OKR)
              </label>
              <button
                type="button"
                onClick={handleAddKeyResult}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dodaj wskaźnik</span>
              </button>
            </div>

            {keyResults.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/70 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Brak zdefiniowanych mierzalnych rezultatów. Kliknij powyżej, aby dodać np. „Przychód: 0 / 100 000 zł” lub „Oferty: 0 / 10 szt”.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {keyResults.map((kr, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col space-y-2.5"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={kr.title}
                        onChange={(e) =>
                          handleUpdateKeyResult(idx, "title", e.target.value)
                        }
                        placeholder="Nazwa rezultatu (np. Przychód, Przetłumaczone oferty)"
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyResult(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                          Stan aktualny
                        </span>
                        <input
                          type="number"
                          value={kr.current_value}
                          onChange={(e) =>
                            handleUpdateKeyResult(
                              idx,
                              "current_value",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                          Wartość docelowa
                        </span>
                        <input
                          type="number"
                          value={kr.target_value}
                          onChange={(e) =>
                            handleUpdateKeyResult(
                              idx,
                              "target_value",
                              parseFloat(e.target.value) || 1
                            )
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                          Jednostka
                        </span>
                        <input
                          type="text"
                          value={kr.unit}
                          onChange={(e) =>
                            handleUpdateKeyResult(idx, "unit", e.target.value)
                          }
                          placeholder="%, szt, PLN"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color theme picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Akcent kolorystyczny
            </label>
            <div className="flex items-center space-x-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.name}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c.value
                      ? "border-slate-900 dark:border-white scale-110 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Zapisywanie...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{goal ? "Zapisz zmiany" : "Utwórz cel"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

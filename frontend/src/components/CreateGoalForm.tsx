import React, { useState } from "react";
import { createNote } from "../services/api";

interface CreateGoalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateGoalForm: React.FC<CreateGoalFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = title.trim() !== "" && content.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);
    try {
      await createNote({
        title,
        content,
        note_type: "strategic",
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError("Nie udało się zapisać celu. Spróbuj ponownie.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Tytuł celu
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Np. Przebiec maraton w tym roku"
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Szczegółowy opis
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Opisz jak zamierzasz to osiągnąć..."
          rows={4}
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200 resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      )}

      <div className="flex space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 py-3 rounded-xl font-semibold transition-colors duration-200"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={!isValid || loading}
          className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-sm ${
            isValid && !loading
              ? "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Zapisywanie..." : "Zapisz cel"}
        </button>
      </div>
    </form>
  );
};

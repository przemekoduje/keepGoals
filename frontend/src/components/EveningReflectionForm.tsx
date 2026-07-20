import React, { useState } from "react";
import { generateEveningReflection } from "../services/api";

interface EveningReflectionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const EveningReflectionForm: React.FC<EveningReflectionFormProps> = ({ onSuccess, onCancel }) => {
  const [completedText, setCompletedText] = useState("");
  const [uncompletedText, setUncompletedText] = useState("");
  const [avoidedText, setAvoidedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseList = (text: string): string[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const isValid = completedText.trim() !== "" || uncompletedText.trim() !== "" || avoidedText.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    const payload = {
      completed_tasks: parseList(completedText),
      uncompleted_tasks: parseList(uncompletedText),
      avoided_habits: parseList(avoidedText),
    };

    try {
      await generateEveningReflection(payload);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.message === "NO_STRATEGIC_GOALS") {
        setError("Brak celów strategicznych! Nie można przeanalizować bilansu dnia.");
      } else {
        setError("Nie udało się zapisać wieczornej refleksji. Spróbuj ponownie.");
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Zrealizowane zadania (jedno w linii)
        </label>
        <textarea
          value={completedText}
          onChange={(e) => setCompletedText(e.target.value)}
          placeholder="Np. Poranny trening&#10;Napisałem moduł API"
          rows={3}
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200 resize-none text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Niezrealizowane zadania (jedno w linii)
        </label>
        <textarea
          value={uncompletedText}
          onChange={(e) => setUncompletedText(e.target.value)}
          placeholder="Np. Nauka hiszpańskiego"
          rows={3}
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200 resize-none text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Pozytywne zaniechania (jedno w linii)
        </label>
        <textarea
          value={avoidedText}
          onChange={(e) => setAvoidedText(e.target.value)}
          placeholder="Np. Bez słodyczy&#10;Brak social media przed snem"
          rows={3}
          disabled={loading}
          className="w-full bg-slate-50 focus:bg-slate-100/80 dark:bg-slate-900 dark:focus:bg-slate-950/50 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 border border-transparent focus:ring-0 focus:outline-none transition-colors duration-200 resize-none text-sm"
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
          {loading ? "Analizowanie..." : "Zapisz bilans"}
        </button>
      </div>
    </form>
  );
};

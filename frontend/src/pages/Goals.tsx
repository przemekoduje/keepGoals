import React from "react";
import { Link } from "react-router-dom";
import { Target, Lock, ArrowLeft } from "lucide-react";

export const Goals: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Target className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-800">
          <Lock className="w-4 h-4" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
        Moduł "Goals" jest wkrótce dostępny
      </h1>
      
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
        Obecnie pracujemy nad optymalizacją modułu zarządzania celami strategicznymi oraz integracją z AI. Ta funkcja zostanie udostępniona w nadchodzącej aktualizacji.
      </p>

      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-sm transition-colors duration-200 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Wróć do Notatek (keep)</span>
      </Link>
    </div>
  );
};

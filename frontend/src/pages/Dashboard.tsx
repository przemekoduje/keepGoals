import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchNotes } from "../services/api";
import type { Note } from "../services/api";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes()
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Nie udało się pobrać notatek. Upewnij się, że backend jest połączony.");
        setLoading(false);
      });
  }, []);

  const strategicNotes = notes.filter((n) => n.note_type === "strategic");
  const dailyNotes = notes.filter(
    (n) => n.note_type === "daily_morning" || n.note_type === "daily_evening"
  );

  const getNoteTypeStyles = (type: Note["note_type"]) => {
    switch (type) {
      case "strategic":
        return "bg-pastel-blue-light border-pastel-blue-light/35 text-slate-800";
      case "daily_morning":
        return "bg-pastel-green-light border-pastel-green-light/35 text-slate-800";
      case "daily_evening":
        return "bg-pastel-purple-light border-pastel-purple-light/35 text-slate-800";
      default:
        return "bg-slate-50 border-slate-100 text-slate-800";
    }
  };

  const formatTypeLabel = (type: Note["note_type"]) => {
    switch (type) {
      case "strategic":
        return "Cel Strategiczny";
      case "daily_morning":
        return "Plan Poranny";
      case "daily_evening":
        return "Refleksja Wieczorna";
      default:
        return "Notatka";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100">
      {/* Pasek nawigacyjny */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-pastel-blue-light text-pastel-blue-dark rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
              />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">keepGoals</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {user?.email}
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm"
          >
            Wyloguj się
          </button>
        </div>
      </nav>

      {/* Główna sekcja */}
      <main className="max-w-7xl mx-auto p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-300"></div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
              Ładowanie celów i refleksji...
            </p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <p className="text-rose-700 dark:text-rose-300 font-semibold mb-2">Błąd pobierania danych</p>
            <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kolumna 1: Cele Strategiczne */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-slate-100" />
                <span>Cele Strategiczne</span>
              </h2>
              {strategicNotes.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-[24px] p-8 border border-slate-100 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500">
                  Brak celów strategicznych.
                </div>
              ) : (
                <div className="space-y-4">
                  {strategicNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-6 rounded-[24px] border shadow-sm ${getNoteTypeStyles(note.note_type)}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-white/60 dark:bg-slate-950/20 rounded-full">
                          {formatTypeLabel(note.note_type)}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {note.title && <h3 className="text-lg font-bold mb-2">{note.title}</h3>}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Kolumna 2: Pętla Dzienna */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-slate-100" />
                <span>Pętla Dzienna (Plany i Refleksje)</span>
              </h2>
              {dailyNotes.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-[24px] p-8 border border-slate-100 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500">
                  Brak planów i refleksji.
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-6 rounded-[24px] border shadow-sm ${getNoteTypeStyles(note.note_type)}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-white/60 dark:bg-slate-950/20 rounded-full">
                          {formatTypeLabel(note.note_type)}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {note.title && <h3 className="text-lg font-bold mb-2">{note.title}</h3>}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

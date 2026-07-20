import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchNotes, generateMorningPlan } from "../services/api";
import type { Note } from "../services/api";
import { Modal } from "../components/Modal";
import { CreateGoalForm } from "../components/CreateGoalForm";
import { EveningReflectionForm } from "../components/EveningReflectionForm";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEveningModalOpen, setIsEveningModalOpen] = useState<boolean>(false);
  const [isMorningLoading, setIsMorningLoading] = useState<boolean>(false);
  const [morningError, setMorningError] = useState<string | null>(null);

  const loadNotes = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateSuccess = () => {
    setIsModalOpen(false);
    loadNotes();
  };

  const handleEveningSuccess = () => {
    setIsEveningModalOpen(false);
    loadNotes();
  };

  const handleGenerateMorning = async () => {
    setIsMorningLoading(true);
    setMorningError(null);
    try {
      await generateMorningPlan();
      loadNotes();
    } catch (err: any) {
      console.error(err);
      if (err.message === "NO_STRATEGIC_GOALS") {
        setMorningError("Brak celów strategicznych! Aby wygenerować plan poranny, najpierw utwórz cel strategiczny.");
      } else {
        setMorningError("Wystąpił błąd podczas generowania planu porannego.");
      }
    } finally {
      setIsMorningLoading(false);
    }
  };

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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-slate-100" />
                  <span>Cele Strategiczne</span>
                </h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
              
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-slate-100" />
                  <span>Pętla Dzienna (Plany i Refleksje)</span>
                </h2>
                
                <div className="flex items-center space-x-2">
                  {/* Wygeneruj Plan Poranny Button */}
                  <button
                    onClick={handleGenerateMorning}
                    disabled={isMorningLoading}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-2 shadow-sm ${
                      isMorningLoading
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-pastel-green-light hover:bg-pastel-green-light/80 text-pastel-green-dark border border-pastel-green-light/40"
                    }`}
                    title="Generuj Plan Poranny z AI"
                  >
                    {isMorningLoading ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                      </svg>
                    )}
                    <span>Plan Poranny</span>
                  </button>

                  {/* Wieczorny Bilans Button */}
                  <button
                    onClick={() => setIsEveningModalOpen(true)}
                    className="px-3 py-2 bg-pastel-purple-light hover:bg-pastel-purple-light/80 text-pastel-purple-dark border border-pastel-purple-light/40 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all duration-200"
                    title="Wieczorny Bilans AI"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                    <span>Bilans</span>
                  </button>
                </div>
              </div>

              {morningError && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-4 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between">
                  <span>{morningError}</span>
                  <button onClick={() => setMorningError(null)} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

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

      {/* Modal dodawania celu */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Dodaj Cel Strategiczny">
        <CreateGoalForm onSuccess={handleCreateSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* Modal wieczornego bilansu */}
      <Modal isOpen={isEveningModalOpen} onClose={() => setIsEveningModalOpen(false)} title="Wieczorny Bilans AI">
        <EveningReflectionForm onSuccess={handleEveningSuccess} onCancel={() => setIsEveningModalOpen(false)} />
      </Modal>
    </div>
  );
};

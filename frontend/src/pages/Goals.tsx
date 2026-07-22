import React, { useEffect, useState } from "react";
import { fetchNotes, generateMorningPlan, updateNote } from "../services/api";
import type { Note } from "../services/api";
import { Modal } from "../components/Modal";
import { CreateGoalForm } from "../components/CreateGoalForm";
import { EveningReflectionForm } from "../components/EveningReflectionForm";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export const Goals: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
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
        setError("Nie udało się pobrać danych. Upewnij się, że backend jest połączony.");
        setLoading(false);
      });
  };

  const handleNoteContentChange = async (noteId: string, newContent: string) => {
    // Optimistic UI update
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === noteId ? { ...n, content: newContent } : n))
    );
    try {
      await updateNote(noteId, { content: newContent });
    } catch (e) {
      console.error("Failed to update note content:", e);
      loadNotes(); // rollback
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateGoalSuccess = () => {
    setIsGoalModalOpen(false);
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

  const formatNoteDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const strategicNotes = notes.filter((n) => n.note_type === "strategic");
  
  // Filter AI operational reports (Morning plans & Evening reflections)
  const aiReports = notes.filter(
    (n) =>
      (n.note_type === "daily_morning" && n.title === "Plan Poranny") ||
      (n.note_type === "daily_evening" && n.title === "Refleksja Wieczorna")
  );

  const getReportStyles = (type: Note["note_type"]) => {
    switch (type) {
      case "daily_morning":
        return "bg-pastel-green-light border-pastel-green-light/35 text-slate-800";
      case "daily_evening":
        return "bg-pastel-purple-light border-pastel-purple-light/35 text-slate-800";
      default:
        return "bg-white border-slate-100 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100";
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-8">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-300"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
            Ładowanie centrum dowodzenia...
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <p className="text-rose-700 dark:text-rose-300 font-semibold mb-2">Błąd pobierania danych</p>
          <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: Strategic Goals */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-slate-100" />
                <span>Cele Strategiczne</span>
              </h2>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm font-semibold flex items-center space-x-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Dodaj Cel</span>
              </button>
            </div>

            {strategicNotes.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-100 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500 shadow-sm">
                <p className="text-base">Brak celów strategicznych. Dodaj pierwszy cel, aby wyznaczyć kierunek!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {strategicNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-6 rounded-2xl border shadow-sm bg-pastel-blue-light border-pastel-blue-light/35 text-slate-800 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/60 rounded-full">
                        Cel Strategiczny
                      </span>
                      <span className="text-[9px] text-slate-600 font-medium bg-white/40 px-2 py-0.5 rounded-full">
                        {formatNoteDate(note.created_at)}
                      </span>
                    </div>
                    {note.title && <h3 className="text-lg font-bold mb-2">{note.title}</h3>}
                    <div className="prose prose-sm max-w-none text-slate-700">
                      <MarkdownRenderer content={note.content} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT SIDE: AI Operational Reports & Pętla Dzienna */}
          <section className="lg:col-span-5 space-y-6 lg:border-l lg:border-slate-100 lg:dark:border-slate-800 lg:pl-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-pastel-purple-dark" />
                <span>Pętla Dzienna AI</span>
              </h2>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerateMorning}
                  disabled={isMorningLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-sm ${
                    isMorningLoading
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800"
                      : "bg-pastel-green-light hover:bg-pastel-green-light/80 text-pastel-green-dark"
                  }`}
                >
                  {isMorningLoading && <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full mr-1" />}
                  <span>Plan Poranny</span>
                </button>

                <button
                  onClick={() => setIsEveningModalOpen(true)}
                  className="px-3 py-1.5 bg-pastel-purple-light hover:bg-pastel-purple-light/80 text-pastel-purple-dark rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                >
                  <span>Bilans</span>
                </button>
              </div>
            </div>

            {morningError && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between mb-4">
                <span>{morningError}</span>
                <button onClick={() => setMorningError(null)} className="text-rose-400 hover:text-rose-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {aiReports.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500">
                <p className="text-sm">Brak wygenerowanych planów porannych lub bilansów wieczornych.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {aiReports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-5 rounded-2xl border shadow-sm ${getReportStyles(report.note_type)}`}
                  >
                    <div className="flex justify-between items-center mb-3 border-b border-black/5 pb-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded-full">
                        {report.title}
                      </span>
                      <span className="text-[9px] text-slate-600 font-medium">
                        {formatNoteDate(report.created_at)}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-800 dark:text-slate-100">
                      <MarkdownRenderer
                        content={report.content}
                        onChange={(newContent) => handleNoteContentChange(report.id, newContent)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      {/* Add Goal Modal */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Dodaj Cel Strategiczny">
        <CreateGoalForm onSuccess={handleCreateGoalSuccess} onCancel={() => setIsGoalModalOpen(false)} />
      </Modal>

      {/* Evening Reflection Modal */}
      <Modal isOpen={isEveningModalOpen} onClose={() => setIsEveningModalOpen(false)} title="Wieczorny Bilans AI">
        <EveningReflectionForm onSuccess={handleEveningSuccess} onCancel={() => setIsEveningModalOpen(false)} />
      </Modal>
    </main>
  );
};

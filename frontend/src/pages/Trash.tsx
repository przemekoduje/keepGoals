import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchTrashNotes, restoreNote, hardDeleteNote } from "../services/api";
import type { Note } from "../services/api";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import type { MainLayoutContextType } from "../layouts/MainLayout";
import { RefreshCcw, Trash2 } from "lucide-react";

const TrashNoteCard: React.FC<{
  note: Note;
  formatNoteDate: (dateStr: string) => string;
  onRestore: (noteId: string) => void;
  onHardDelete: (noteId: string) => void;
}> = ({ note, formatNoteDate, onRestore, onHardDelete }) => {
  return (
    <div className="group relative bg-white dark:bg-[#202124] rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 text-slate-800 dark:text-slate-100 flex flex-col justify-between h-fit w-full">
      <div className="w-full opacity-70">
        <div className="flex justify-between items-start mb-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            Usunięto: {note.deleted_at ? formatNoteDate(note.deleted_at) : "Brak danych"}
          </span>
        </div>

        {note.title && (
          <h3 className="text-base font-medium mb-2 text-slate-800 dark:text-slate-100 leading-snug line-through">
            {note.title}
          </h3>
        )}

        <div className="relative prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 max-h-[360px] overflow-hidden line-through">
          <MarkdownRenderer
            content={note.content}
            onChange={() => Promise.resolve()} // read only
          />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-[#202124] to-transparent pointer-events-none"></div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 space-x-2">
        <button
          onClick={() => onRestore(note.id)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors text-sm font-medium"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Przywróć</span>
        </button>
        <button
          onClick={() => {
            if (window.confirm("Czy na pewno chcesz trwale usunąć tę notatkę? Tej operacji nie można cofnąć.")) {
              onHardDelete(note.id);
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          <span>Usuń trwale</span>
        </button>
      </div>
    </div>
  );
};

export const Trash: React.FC = () => {
  const context = useOutletContext<MainLayoutContextType | null>();
  const isGridView = context?.isGridView ?? true;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = () => {
    setLoading(true);
    fetchTrashNotes()
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Nie udało się pobrać notatek z kosza.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleRestore = async (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
    try {
      await restoreNote(noteId);
    } catch (e) {
      console.error("Failed to restore note:", e);
      loadNotes(); 
    }
  };

  const handleHardDelete = async (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
    try {
      await hardDeleteNote(noteId);
    } catch (e) {
      console.error("Failed to permanently delete note:", e);
      loadNotes(); 
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

  const gridClass = isGridView
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 items-start"
    : "flex flex-col max-w-2xl mx-auto gap-4";

  return (
    <main className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex items-center space-x-3 mb-6">
        <Trash2 className="w-8 h-8 text-slate-800 dark:text-slate-200" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Kosz
        </h1>
      </div>
      
      <p className="text-slate-500 mb-8 italic">
        Notatki w koszu są usuwane automatycznie zgodnie z konfiguracją w Ustawieniach.
      </p>

      {loading ? (
        <div className="flex justify-center mt-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto mt-8">
          <p className="text-rose-700 dark:text-rose-300 font-semibold mb-2">Błąd pobierania danych</p>
          <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[24px] p-12 border border-slate-100 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500 shadow-sm mt-8 max-w-2xl mx-auto">
          <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Kosz jest pusty.</p>
        </div>
      ) : (
        <div className={gridClass}>
          {notes.map((note) => (
            <TrashNoteCard
              key={note.id}
              note={note}
              formatNoteDate={formatNoteDate}
              onRestore={handleRestore}
              onHardDelete={handleHardDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
};

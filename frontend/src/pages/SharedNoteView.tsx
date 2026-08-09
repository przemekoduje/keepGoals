import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicNote, completePublicNote } from "../services/api";
import type { PublicNote } from "../services/api";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { CheckCircle2, Clock, Sparkles, Loader2, Share2 } from "lucide-react";

export const SharedNoteView: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [note, setNote] = useState<PublicNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) return;

    fetchPublicNote(shareToken)
      .then((data) => {
        setNote(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Ta notatka nie istnieje, wygasła lub link jest niepoprawny.");
        setLoading(false);
      });
  }, [shareToken]);

  const handleComplete = async () => {
    if (!shareToken || !note) return;
    setActionLoading(true);
    try {
      await completePublicNote(shareToken);
      setNote((prev) => prev ? { ...prev, delegation_status: "done" } : null);
    } catch (err) {
      console.error(err);
      alert("Nie udało się oznaczyć zadania jako zrealizowane.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#AAAE7F]" />
        <span className="text-sm font-semibold text-slate-400 mt-3">Ładowanie szczegółów zadania...</span>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-900 border border-rose-950/40 p-8 rounded-3xl shadow-2xl">
          <div className="w-12 h-12 bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-900/50">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Błąd dostępu</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {error || "Nie znaleziono żądanej notatki."}
          </p>
        </div>
      </div>
    );
  }

  const isCompleted = note.delegation_status === "done";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans">
      
      {/* Top Brand Info */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="keepGoals" className="h-6 w-auto" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-[#AAAE7F] px-2 py-0.5 rounded border border-slate-700">
            Handoff
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Dla: <span className="font-bold text-slate-200">{note.delegated_to_name}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto my-auto py-8 space-y-6">
        
        {/* Status Badge Top */}
        <div className="flex justify-center">
          {isCompleted ? (
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-900/80 shadow-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Zadanie Zrealizowane</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-bold bg-amber-950/50 text-amber-400 border border-amber-900/80 shadow-md">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>Zadanie Aktywne</span>
            </div>
          )}
        </div>

        {/* AI Task Packet Card */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles className="w-24 h-24" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#AAAE7F] bg-[#AAAE7F]/10 px-2.5 py-1 rounded-lg border border-[#AAAE7F]/30 inline-flex items-center space-x-1.5 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zadania przygotowane przez AI</span>
            </span>
            
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight leading-snug">
              Podsumowanie delegacji
            </h1>
          </div>

          <div className="prose prose-invert max-w-none border-t border-slate-800/80 pt-6 text-slate-300">
            {note.ai_summary_for_delegate ? (
              <MarkdownRenderer content={note.ai_summary_for_delegate} onChange={() => Promise.resolve()} />
            ) : (
              <p className="italic text-slate-500">Brak szczegółowego podsumowania AI.</p>
            )}
          </div>
        </div>

        {/* Action Button Area */}
        <div className="flex justify-center pt-4">
          {isCompleted ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-400 font-medium">
                Dziękujemy! Oznaczono to zadanie jako zrealizowane.
              </p>
              <p className="text-xs text-slate-600">
                Właściciel notatki został powiadomiony w swoim panelu keepGoals.
              </p>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="w-full sm:w-auto min-w-[280px] py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Przetwarzanie...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Oznacz jako zrealizowane</span>
                </>
              )}
            </button>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-3xl w-full mx-auto pt-6 border-t border-slate-800 text-center text-xs text-slate-600 font-medium">
        keepGoals &copy; {new Date().getFullYear()} - Personal Productivity System
      </footer>

    </div>
  );
};

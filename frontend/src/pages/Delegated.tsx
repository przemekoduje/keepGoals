import React, { useEffect, useState } from "react";
import { fetchNotes } from "../services/api";
import type { Note, Delegation } from "../services/api";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { Share2, Copy, Check, Clock, Eye, CheckCircle2 } from "lucide-react";

interface FlatDelegation {
  note: Note;
  delegation: Delegation;
}

export const Delegated: React.FC = () => {
  const [delegations, setDelegations] = useState<FlatDelegation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadNotes = () => {
    setLoading(true);
    fetchNotes()
      .then((data) => {
        const flat: FlatDelegation[] = [];
        data.forEach((n) => {
          if (n.delegations && n.delegations.length > 0) {
            n.delegations.forEach((del) => {
              flat.push({ note: n, delegation: del });
            });
          }
        });
        setDelegations(flat);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Nie udało się pobrać wydelegowanych notatek.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCopyLink = (shareToken: string, delegationId: string) => {
    const magicLink = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(magicLink).then(() => {
      setCopiedId(delegationId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
            <Clock className="w-3.5 h-3.5" />
            <span>Przekazane</span>
          </span>
        );
      case "viewed":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50">
            <Eye className="w-3.5 h-3.5" />
            <span>Wyświetlone</span>
          </span>
        );
      case "done":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zrealizowane</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="w-full max-w-[1800px] mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#143109] dark:text-slate-100 flex items-center space-x-2">
          <Share2 className="w-6 h-6 text-[#143109] dark:text-[#AAAE7F]" />
          <span>Delegowane u innych</span>
        </h1>
        <p className="text-sm text-[#143109]/70 dark:text-slate-400">
          Notatki i zadania wydelegowane do innych osób wraz ze śledzeniem ich realizacji w czasie rzeczywistym.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-[#202124] h-48 rounded-3xl border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6 text-center max-w-lg mx-auto mt-8">
          <p className="text-rose-700 dark:text-rose-300 font-semibold mb-2">{error}</p>
        </div>
      ) : delegations.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 border border-[#AAAE7F]/30 text-center text-[#143109]/70 shadow-sm max-w-lg mx-auto mt-8">
          <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50 text-[#143109]" />
          <p className="text-lg font-semibold text-[#143109] dark:text-slate-200">Brak wydelegowanych notatek</p>
          <p className="text-xs text-slate-500 mt-2">
            Kliknij "Przekaż" na dowolnej notatce w kokpicie, aby wydelegować zadanie innej osobie.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {delegations.map(({ note, delegation }) => (
            <div 
              key={delegation.id} 
              className="bg-white dark:bg-[#202124] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow h-fit"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Odbiorca:
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {delegation.delegated_to_name}
                    </span>
                    {delegation.delegated_to_email && (
                      <span className="text-[11px] text-slate-500 truncate">
                        {delegation.delegated_to_email}
                      </span>
                    )}
                  </div>
                  {getStatusBadge(delegation.delegation_status)}
                </div>
 
                {note.title && (
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {note.title}
                  </h3>
                )}
 
                <div className="prose prose-sm dark:prose-invert max-h-40 overflow-hidden relative">
                  <MarkdownRenderer content={note.content} onChange={() => Promise.resolve()} />
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-[#202124] to-transparent pointer-events-none"></div>
                </div>
 
                {delegation.ai_summary_for_delegate && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#143109]/70 dark:text-[#AAAE7F] block mb-1">
                      Podsumowanie zadań dla odbiorcy:
                    </span>
                    <div className="prose prose-xs dark:prose-invert">
                      <MarkdownRenderer content={delegation.ai_summary_for_delegate} onChange={() => Promise.resolve()} />
                    </div>
                  </div>
                )}
              </div>
 
              {delegation.share_token && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleCopyLink(delegation.share_token, delegation.id)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#D0D6B3]/40 hover:bg-[#D0D6B3]/60 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#143109] dark:text-[#AAAE7F] text-xs font-semibold rounded-xl transition-all"
                    title="Kopiuj link do przekazania"
                  >
                    {copiedId === delegation.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Skopiowano!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopiuj link</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

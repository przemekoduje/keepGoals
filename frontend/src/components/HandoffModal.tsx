import React, { useState } from "react";
import { handoffNote } from "../services/api";
import { X, Share2, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface HandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  onSuccess?: () => void;
  prefilledName?: string;
}

export const HandoffModal: React.FC<HandoffModalProps> = ({
  isOpen,
  onClose,
  noteId,
  onSuccess,
  prefilledName = "",
}) => {
  const [delegateName, setDelegateName] = useState(prefilledName);
  const [delegateEmail, setDelegateEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setDelegateName(prefilledName);
      setShareToken(null);
      setAiSummary(null);
    }
  }, [isOpen, prefilledName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const updatedNote = await handoffNote(noteId, delegateName.trim(), delegateEmail.trim() || undefined);
      setShareToken(updatedNote.share_token || null);
      setAiSummary(updatedNote.ai_summary_for_delegate || null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setError("Nie udało się przekazać notatki. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  const getMagicLink = () => {
    if (!shareToken) return "";
    return `${window.location.origin}/shared/${shareToken}`;
  };

  const handleCopyLink = () => {
    const link = getMagicLink();
    if (!link) return;

    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="relative bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-[#143109] dark:text-[#AAAE7F]" />
            <span>Przekaż zadanie (Handoff)</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!shareToken ? (
          /* Handoff Request Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Przekaż notatkę wybranej osobie. AI przeanalizuje treść i wyciągnie z niej wyłącznie zadania i wątki przeznaczone dla tego odbiorcy.
            </p>
            
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Imię / Nazwa odbiorcy *
              </label>
              <input
                type="text"
                required
                value={delegateName}
                onChange={(e) => setDelegateName(e.target.value)}
                placeholder="np. Sergiusz, Wacław"
                className="w-full bg-[#EFEFEF] dark:bg-slate-900 border border-[#AAAE7F]/30 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:border-[#AAAE7F] text-[#143109] dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                E-mail odbiorcy (Opcjonalnie)
              </label>
              <input
                type="email"
                value={delegateEmail}
                onChange={(e) => setDelegateEmail(e.target.value)}
                placeholder="np. waclaw@example.com"
                className="w-full bg-[#EFEFEF] dark:bg-slate-900 border border-[#AAAE7F]/30 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:border-[#AAAE7F] text-[#143109] dark:text-slate-100"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-colors"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={loading || !delegateName.trim()}
                className="px-5 py-2 text-sm font-bold text-white bg-[#143109] dark:bg-[#D0D6B3] dark:text-[#143109] rounded-2xl hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI generuje zadania...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generuj Handoff</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Link & Summary Display */
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-start space-x-3">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Zadanie pomyślnie wydelegowane dla {delegateName}!
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Magic Link został wygenerowany. Odbiorca może podglądać zadania oraz oznaczyć je jako wykonane bez posiadania konta.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Bezpośredni Magic Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={getMagicLink()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 bg-[#EFEFEF] dark:bg-slate-900 border border-[#AAAE7F]/30 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-mono focus:outline-hidden text-[#143109] dark:text-slate-100"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-3 bg-[#D0D6B3]/40 hover:bg-[#D0D6B3]/60 dark:bg-slate-700 dark:hover:bg-slate-600 text-[#143109] dark:text-[#AAAE7F] rounded-2xl transition-all"
                  title="Skopiuj link"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {aiSummary && (
              <div className="border border-slate-100 dark:border-slate-700 rounded-3xl p-4 bg-slate-50 dark:bg-slate-900/50 max-h-60 overflow-y-auto">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#143109]/70 dark:text-[#AAAE7F] block mb-2">
                  Podsumowanie AI dla {delegateName}:
                </span>
                <div className="prose prose-sm dark:prose-invert">
                  <MarkdownRenderer content={aiSummary} onChange={() => Promise.resolve()} />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#143109] dark:bg-[#D0D6B3] dark:text-[#143109] rounded-2xl hover:opacity-90 transition-opacity"
              >
                Gotowe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

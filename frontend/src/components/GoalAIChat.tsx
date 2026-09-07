import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, ChevronUp, ChevronDown, Plus, Check, Bot, User, Trash2 } from "lucide-react";
import { chatAboutGoals, type ChatMessage, type AxisTile } from "../services/api";

interface GoalAIChatProps {
  currentTiles: AxisTile[];
  onAddTile: (title: string, x: number, y: number) => void;
}

const CHAT_STORAGE_KEY = "keepgoals_goals_chat_history_v1";

const QUICK_PROMPTS = [
  { label: "✨ Zaproponuj kolejny kafelek", query: "Jaki powinien być mój kolejny kafelek na osi 2D w oparciu o obecne cele i rozproszenia?" },
  { label: "⚖️ Jak zrównoważyć rozproszenia?", query: "Jak mogę zredukować kafelki po lewej stronie (brak realizacji) i przenieść energię na cele?" },
  { label: "🚀 Następny krok w celach", query: "Który cel z prawej strony osi powinien mieć teraz najwyższy priorytet i dlaczego?" },
];

export const GoalAIChat: React.FC<GoalAIChatProps> = ({ currentTiles, onAddTile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(() => messages.length > 0);
  const [addedTiles, setAddedTiles] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Zapis historii czatu w localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Autoscroll przy nowych wiadomościach
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);
    setIsExpanded(true);

    try {
      const { response } = await chatAboutGoals(updatedMessages, currentTiles);
      setMessages([...updatedMessages, { role: "assistant", content: response }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Przepraszam, wystąpił problem z połączeniem z serwerem AI. Upewnij się, że masz połączenie z siecią i spróbuj ponownie.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  const handleAddSuggestedTile = (title: string, rawX?: string, rawY?: string) => {
    const x = rawX ? parseFloat(rawX) : 75;
    const y = rawY ? parseFloat(rawY) : 60;
    onAddTile(title, x, y);
    setAddedTiles((prev) => [...prev, title]);
  };

  // Renderowanie treści wiadomości z obsługą znaczników <SUGGESTED_TILE>
  const renderMessageContent = (content: string) => {
    const tileRegex = /<SUGGESTED_TILE\s+title="([^"]+)"(?:\s+x="([^"]+)")?(?:\s+y="([^"]+)")?>([\s\S]*?)<\/SUGGESTED_TILE>/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tileRegex.exec(content)) !== null) {
      // Tekst przed znacznikiem
      if (match.index > lastIndex) {
        parts.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed">
            {content.substring(lastIndex, match.index)}
          </div>
        );
      }

      const title = match[1];
      const xVal = match[2] || "75";
      const yVal = match[3] || "60";
      const reason = match[4]?.trim();
      const isAlreadyAdded = addedTiles.includes(title) || currentTiles.some((t) => t.title.toLowerCase() === title.toLowerCase());

      parts.push(
        <div
          key={`tile-card-${match.index}`}
          className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-slate-800/80 border border-amber-300/70 dark:border-amber-700/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                  {parseFloat(xVal) > 60 ? "Cel" : parseFloat(xVal) < 40 ? "Rozproszenie" : "Bieżące"} (X: {xVal}%, Y: {yVal}%)
                </span>
              </div>
              {reason && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                  {reason}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isAlreadyAdded}
            onClick={() => handleAddSuggestedTile(title, xVal, yVal)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shrink-0 ${
              isAlreadyAdded
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default"
                : "bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-sm active:scale-95"
            }`}
          >
            {isAlreadyAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Na osi</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Dodaj na oś</span>
              </>
            )}
          </button>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Pozostały tekst
    if (lastIndex < content.length) {
      parts.push(
        <div key={`text-end`} className="whitespace-pre-wrap leading-relaxed">
          {content.substring(lastIndex)}
        </div>
      );
    }

    return parts;
  };

  return (
    <div className="w-full flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
      {/* Pasek nagłówka czatu z kontrolkami */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-slate-950 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            Gemini Goal Coach
          </span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            • Porozmawiaj o kafelkach, celach i priorytetach
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              title="Wyczyść rozmowę"
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            title={isExpanded ? "Zwiń czat" : "Rozwiń czat"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Rozwijana lista wiadomości */}
      {isExpanded && (
        <div className="p-4 max-h-56 sm:max-h-72 overflow-y-auto space-y-3 text-xs sm:text-sm">
          {messages.length === 0 ? (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 space-y-2">
              <p className="text-xs">Zadaj pytanie asystentowi lub wybierz jedną z szybkich propozycji poniżej.</p>
              <p className="text-[11px] opacity-75">AI potrafi zasugerować konkretny kafelek i od razu umieścić go na Twojej osi 2D!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs ${
                      isUser
                        ? "bg-amber-400 text-slate-950 font-medium ml-auto"
                        : "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50"
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    ) : (
                      renderMessageContent(msg.content)
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-start gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/90 rounded-2xl px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <span className="animate-pulse">Gemini analizuje układ kafelków i formułuje odpowiedź...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Szybkie pigułki z pytaniami (gdy brak wiadomości lub czat otwarty) */}
      <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.query)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-slate-600 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-200 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Pasek wprowadzania tekstu w stylu Gemini / ChatGPT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              if (messages.length > 0) setIsExpanded(true);
            }}
            placeholder="Porozmawiaj z AI o kolejnym kafelku, priorytetach lub celach..."
            className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow"
          />
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs disabled:opacity-40 transition-transform active:scale-95 shadow-sm flex items-center gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Wyślij</span>
        </button>
      </form>
    </div>
  );
};

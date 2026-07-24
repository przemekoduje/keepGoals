import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";
import { chatAboutNote, updateNote } from "../services/api";
import type { ChatMessage, Note } from "../services/api";

interface NoteAIChatModalProps {
  note: Note;
  onClose: () => void;
  onNoteUpdated: (updatedNote: Note) => void;
}

export const NoteAIChatModal: React.FC<NoteAIChatModalProps> = ({ note, onClose, onNoteUpdated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const { response } = await chatAboutNote(note.id, newMessages);
      setMessages([...newMessages, { role: "assistant", content: response }]);
    } catch (err: any) {
      console.error(err);
      setError("Wystąpił błąd komunikacji z AI. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = async (newContent: string) => {
    try {
      setIsLoading(true);
      const updated = await updateNote(note.id, { content: newContent });
      onNoteUpdated(updated);
      onClose(); // Zamknij czat po zastosowaniu zmian
    } catch (err) {
      console.error(err);
      setError("Nie udało się zaktualizować notatki.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper do renderowania wiadomości. Szuka <REWRITTEN_NOTE>
  const renderMessageContent = (content: string, role: string) => {
    if (role === "user") {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    // Proste parsowanie tagów <REWRITTEN_NOTE>
    const match = content.match(/<REWRITTEN_NOTE>([\s\S]*?)<\/REWRITTEN_NOTE>/);
    
    if (match) {
      const before = content.substring(0, match.index);
      const newNoteContent = match[1].trim();
      const after = content.substring(match.index! + match[0].length);

      return (
        <div className="flex flex-col space-y-3 w-full">
          {before && <p className="whitespace-pre-wrap">{before}</p>}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group w-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> PROPOZYCJA ZMIAN
            </p>
            <div className="text-sm text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap mb-3 border-l-2 border-slate-200 dark:border-slate-600 pl-2">
              {newNoteContent}
            </div>
            <button
              onClick={() => handleApplyChanges(newNoteContent)}
              disabled={isLoading}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Zastosuj tę wersję do notatki
            </button>
          </div>
          {after && <p className="whitespace-pre-wrap">{after}</p>}
        </div>
      );
    }

    return <p className="whitespace-pre-wrap">{content}</p>;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-[#202124] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col h-[70vh] sm:h-[600px] relative overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Supermoc AI</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Czat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-4 space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                <Bot className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-sm">
                Jestem asystentem redakcyjnym dla tej notatki. <br/>
                Powiedz mi, co chcesz w niej zmienić.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button onClick={() => setInputValue("Przepisz tę notatkę bardziej zwięźle.")} className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Zrób to zwięźlej
                </button>
                <button onClick={() => setInputValue("Sformatuj to jako listę TODO z checkboxami.")} className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Zrób listę zadań
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2 mt-1 ${
                  msg.role === 'user' 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' 
                    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm break-words ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-[#202124] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-sm shadow-sm'
                }`}>
                  {renderMessageContent(msg.content, msg.role)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="flex max-w-[90%] flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-2 mt-1">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="px-4 py-4 bg-white dark:bg-[#202124] border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center p-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg mx-4">
              {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder="Jak mam pomóc z tą notatką?"
              className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-800 dark:text-slate-100 text-sm transition-all outline-none shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-full transition-colors disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

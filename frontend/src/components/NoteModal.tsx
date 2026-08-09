import React, { useEffect, useState, useRef } from "react";
import { 
  Palette, Bell, Share2, Image as ImageIcon, Archive, MoreVertical, Pin, 
  Trash2, Type, Tag, Bold, Italic, Underline, Baseline, Eraser,
  List, ListOrdered, ListTodo, Sparkles, CalendarDays, X,
  Mail, FileText, Copy, Check, Send, ChevronDown, ChevronUp, FolderKanban,
  RotateCw, Loader2, AlertCircle, Clock, Eye, CheckCircle2
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { NoteAIChatModal } from "./NoteAIChatModal";
import { HandoffModal } from "./HandoffModal";
import { useAuth } from "../context/AuthContext";
import { sendNoteEmail } from "../services/api";
import type { Note, Project } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "";



interface NoteModalProps {
  note: Note;
  onClose: () => void;
  formatNoteDate: (dateStr: string) => string;
  handleNoteContentChange: (noteId: string, newContent: string) => Promise<void>;
  onTogglePin?: (noteId: string, currentPinStatus: boolean) => void;
  onDelete?: (noteId: string) => void;
  onUpdateTitle?: (noteId: string, newTitle: string) => void;
  onUpdateLabel?: (noteId: string, newLabel: string) => void;
  onUpdateProject?: (noteId: string, projectId: string | null) => void;
  onUpdateProjects?: (noteId: string, projectIds: string[]) => void;
  onHandoffSuccess?: () => void;
  onReanalyze?: (noteId: string) => void;
  projects?: Project[];
}



export const NoteModal: React.FC<NoteModalProps> = ({
  note,
  onClose,
  formatNoteDate,
  handleNoteContentChange,
  onTogglePin,
  onDelete,
  onUpdateTitle,
  onUpdateLabel,
  onUpdateProject,
  onUpdateProjects,
  onHandoffSuccess,
  onReanalyze,
  projects = [],
}) => {
  const { user } = useAuth();
  const isAudio = note.media_type?.startsWith("audio/");
  const isVideo = note.media_type?.startsWith("video/");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const currentProjectIds = note.project_ids && note.project_ids.length > 0 
    ? note.project_ids 
    : (note.project_id ? [note.project_id] : []);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFormattingBar, setShowFormattingBar] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [dismissedEvents, setDismissedEvents] = useState<number[]>([]);
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [handoffPrefillName, setHandoffPrefillName] = useState("");
  const [selectedDelegationId, setSelectedDelegationId] = useState<string | null>(null);
  const selectedDelegation = note.delegations?.find(d => d.id === selectedDelegationId);

  const [showTranscript, setShowTranscript] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(user?.email || "");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditContent(note.content);
  }, [note.content]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          setIsEditing(false);
          setShowFormattingBar(false);
          if (editContent !== note.content) {
            handleNoteContentChange(note.id, editContent);
          }
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isEditing, editContent, note.content, note.id, handleNoteContentChange]);

  // Click outside menu
  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutsideMenu);
    }
    return () => document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, [isMenuOpen]);

  // Click outside editor to exit edit mode
  useEffect(() => {
    const handleClickOutsideEditor = (event: MouseEvent) => {
      if (
        isEditing &&
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        setShowFormattingBar(false);
        if (editContent !== note.content) {
          handleNoteContentChange(note.id, editContent);
        }
      }
    };
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutsideEditor);
    }
    return () => document.removeEventListener("mousedown", handleClickOutsideEditor);
  }, [isEditing, editContent, note.content, note.id, handleNoteContentChange]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current && editorContainerRef.current) {
      const scrollPos = editorContainerRef.current.scrollTop;
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      editorContainerRef.current.scrollTop = scrollPos;
    }
  }, [editContent, isEditing]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      if (isEditing && editContent !== note.content) {
        handleNoteContentChange(note.id, editContent);
      }
      onClose();
    }
  };

  const applyFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = editContent.substring(start, end);
    const newText = editContent.substring(0, start) + prefix + selectedText + suffix + editContent.substring(end);
    setEditContent(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const toggleHeader = (level: number) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const textBefore = editContent.substring(0, start);
    const textAfter = editContent.substring(end);
    const selectedText = editContent.substring(start, end);

    const lastNewline = textBefore.lastIndexOf("\n");
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const textBeforeLine = editContent.substring(0, lineStart);
    let currentLine = editContent.substring(lineStart, end);
    
    currentLine = currentLine.replace(/^#{1,6}\s/, ""); // remove existing headers
    const newPrefix = level === 0 ? "" : "#".repeat(level) + " ";
    
    const newText = textBeforeLine + newPrefix + currentLine + textAfter;
    setEditContent(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = lineStart + newPrefix.length + (start - lineStart);
        textareaRef.current.setSelectionRange(newCursor, newCursor + selectedText.length);
      }
    }, 0);
  };

  const clearFormatting = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    let selectedText = editContent.substring(start, end);
    
    // Remove bold, italic, underline, headers
    selectedText = selectedText.replace(/\*\*(.*?)\*\*/g, "$1");
    selectedText = selectedText.replace(/\*(.*?)\*/g, "$1");
    selectedText = selectedText.replace(/<u>(.*?)<\/u>/g, "$1");
    
    const newText = editContent.substring(0, start) + selectedText + editContent.substring(end);
    setEditContent(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, start + selectedText.length);
      }
    }, 0);
  };

  const toggleList = (type: 'bullet' | 'ordered' | 'todo') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    const textBefore = editContent.substring(0, start);
    const textAfter = editContent.substring(end);
    
    const lastNewlineBefore = textBefore.lastIndexOf("\n");
    const lineStart = lastNewlineBefore === -1 ? 0 : lastNewlineBefore + 1;
    
    const firstNewlineAfter = textAfter.indexOf("\n");
    const lineEnd = firstNewlineAfter === -1 ? editContent.length : end + firstNewlineAfter;
    
    const textBeforeLines = editContent.substring(0, lineStart);
    const textAfterLines = editContent.substring(lineEnd);
    const selectedLinesText = editContent.substring(lineStart, lineEnd);
    
    const lines = selectedLinesText.split("\n");
    
    const isBullet = (l: string) => /^\s*[-*]\s(?!\[)/.test(l);
    const isOrdered = (l: string) => /^\s*\d+\.\s/.test(l);
    const isTodo = (l: string) => /^\s*-\s\[[ x]\]\s/i.test(l);
    
    let allHavePrefix = false;
    if (type === 'bullet') allHavePrefix = lines.every(l => l.trim() === '' || isBullet(l));
    if (type === 'ordered') allHavePrefix = lines.every(l => l.trim() === '' || isOrdered(l));
    if (type === 'todo') allHavePrefix = lines.every(l => l.trim() === '' || isTodo(l));
    
    let counter = 1;
    const newLines = lines.map(line => {
      if (line.trim() === '') return line;
      // Strip any existing list prefix first
      let cleanLine = line.replace(/^\s*([-*]\s\[[ x]\]\s|[-*]\s|\d+\.\s)/i, "");
      
      if (allHavePrefix) {
        return cleanLine;
      } else {
        if (type === 'bullet') return `- ${cleanLine}`;
        if (type === 'ordered') return `${counter++}. ${cleanLine}`;
        if (type === 'todo') return `- [ ] ${cleanLine}`;
        return cleanLine;
      }
    });
    
    const newSelectedText = newLines.join("\n");
    const newText = textBeforeLines + newSelectedText + textAfterLines;
    
    setEditContent(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(lineStart, lineStart + newSelectedText.length);
      }
    }, 0);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="relative bg-[#EFEFEF] dark:bg-[#202124] rounded-2xl shadow-2xl border border-[#AAAE7F]/40 w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Media Player Header */}
        {note.media_url && (
          <div className="w-full bg-black/5 dark:bg-black/20 flex items-center justify-center relative group">
            {isVideo && (
              <video 
                controls 
                autoPlay
                className="w-full max-h-[50vh] object-contain" 
                src={`${API_URL}${note.media_url}`}
              >
                Twoja przeglądarka nie obsługuje odtwarzacza wideo.
              </video>
            )}
            {isAudio && (
              <div className="w-full p-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <audio 
                  controls 
                  className="w-full max-w-md outline-none" 
                  src={`${API_URL}${note.media_url}`}
                >
                  Twoja przeglądarka nie obsługuje odtwarzacza audio.
                </audio>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-800 dark:text-slate-100 relative" ref={editorContainerRef}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-[#D0D6B3] text-[#143109] rounded-md">
                {note.note_type === 'daily_morning' || note.note_type === 'generic' ? 'Szybka Notatka' : note.note_type}
              </span>
              {projects.length > 0 && (
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 bg-[#D0D6B3]/60 text-[#143109] border border-[#AAAE7F]/40 rounded-lg cursor-pointer hover:bg-[#D0D6B3] transition-colors"
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>
                      {currentProjectIds.length === 0
                        ? "Dodaj projekty..."
                        : `${currentProjectIds.length} ${currentProjectIds.length === 1 ? "projekt" : "projekty"}`}
                    </span>
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>

                  {isProjectDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-30 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateProjects?.(note.id, []);
                          onUpdateProject?.(note.id, null);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          currentProjectIds.length === 0 ? "bg-slate-100 dark:bg-slate-700 font-bold text-slate-900 dark:text-white" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <span>Brak projektów</span>
                        {currentProjectIds.length === 0 && <Check className="w-3.5 h-3.5 text-blue-500" />}
                      </button>

                      {projects.map((p) => {
                        const isSelected = currentProjectIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              let updated: string[];
                              if (isSelected) {
                                updated = currentProjectIds.filter((id) => id !== p.id);
                              } else {
                                updated = [...currentProjectIds, p.id];
                              }
                              if (onUpdateProjects) {
                                onUpdateProjects(note.id, updated);
                              } else if (onUpdateProject) {
                                onUpdateProject(note.id, updated.length > 0 ? updated[0] : null);
                              }
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                              isSelected ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold" : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || "#3b82f6" }}></span>
                              <span className="truncate">{p.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {formatNoteDate(note.created_at)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {note.delegations && note.delegations.length > 0 && (
                <div className="flex flex-row-reverse space-x-reverse -space-x-1.5 mr-1">
                  {note.delegations.map((del) => {
                    const isSelected = selectedDelegationId === del.id;
                    return (
                      <button
                        key={del.id}
                        type="button"
                        onClick={() => setSelectedDelegationId(isSelected ? null : del.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all relative border cursor-pointer ${
                          isSelected
                            ? "bg-[#143109] text-[#F7F7F7] border-[#143109] scale-110 z-20 shadow-sm"
                            : "bg-[#D0D6B3] text-[#143109] border-[#AAAE7F]/40 hover:bg-[#D0D6B3]/80"
                        }`}
                        title={`Delegacja do: ${del.delegated_to_name} (kliknij, aby wyświetlić szczegóły)`}
                      >
                        {(() => {
                          const name = del.delegated_to_name || "?";
                          const parts = name.trim().split(/\s+/);
                          if (parts.length >= 2) {
                            return (parts[0][0] + parts[1][0]).toUpperCase();
                          }
                          return parts[0].slice(0, 2).toUpperCase();
                        })()}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-800 ${
                          del.delegation_status === "done" ? "bg-emerald-500" : del.delegation_status === "viewed" ? "bg-blue-500" : "bg-amber-500"
                        }`} />
                      </button>
                    );
                  })}
                </div>
              )}

              <button 
                type="button"
                onClick={() => onTogglePin?.(note.id, !!note.is_pinned)}
                className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors ${
                  note.is_pinned
                    ? "text-amber-500 fill-amber-500 hover:text-amber-600 dark:text-amber-400 dark:fill-amber-400"
                    : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                }`}
                title={note.is_pinned ? "Odpnij notatkę" : "Przypnij notatkę"}
              >
                <Pin className={`w-5 h-5 ${note.is_pinned ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Processing Status Banner */}


          {note.processing_status === "pending" && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#D0D6B3]/50 border border-[#AAAE7F]/40 flex items-center space-x-2 text-xs font-semibold text-[#143109]">
              <Loader2 className="w-4 h-4 animate-spin text-[#143109]" />
              <span>Transkrypcja i synteza AI są w trakcie przetwarzania w tle...</span>
            </div>
          )}

          {(note.processing_status === "error_transcription" || note.processing_status === "error_ai") && (
            <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#143109]">
              <div className="flex items-center space-x-2 font-semibold">
                <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0" />
                <span>Wystąpił błąd podczas analizy AI. Oryginalny plik/transkrypcja są bezpieczne w bazie.</span>
              </div>
              {onReanalyze && (
                <button
                  type="button"
                  onClick={() => onReanalyze(note.id)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold bg-[#143109] text-[#F7F7F7] px-3 py-1.5 rounded-xl hover:bg-[#143109]/90 transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Ponów analizę AI</span>
                </button>
              )}
            </div>
          )}

          {note.title && (
            <h2 className="text-2xl font-bold mb-4 text-[#143109] dark:text-white">
              {note.title}
            </h2>
          )}

          {/* Delegation Status (Handoff) info block */}
          {selectedDelegation && (
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-2.5">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-[#143109] dark:text-[#AAAE7F]" />
                  <span>Wydelegowane do: {selectedDelegation.delegated_to_name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Status:</span>
                  {selectedDelegation.delegation_status === "sent" && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Przekazane</span>
                    </span>
                  )}
                  {selectedDelegation.delegation_status === "viewed" && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Wyświetlone</span>
                    </span>
                  )}
                  {selectedDelegation.delegation_status === "done" && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Załatwione</span>
                    </span>
                  )}
                </div>
              </div>

              {selectedDelegation.delegated_to_email && (
                <div className="text-xs text-slate-500">
                  Adres e-mail: {selectedDelegation.delegated_to_email}
                </div>
              )}

              {selectedDelegation.share_token && (
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-500 font-mono select-all truncate flex-1">
                    {window.location.origin}/shared/{selectedDelegation.share_token}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shared/${selectedDelegation.share_token}`);
                      alert("Skopiowano Magic Link!");
                    }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-[#143109] dark:text-[#AAAE7F]"
                    title="Kopiuj link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}

              {selectedDelegation.ai_summary_for_delegate && (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#143109]/70 dark:text-[#AAAE7F] block mb-1">
                    Zadania wyciągnięte przez AI:
                  </span>
                  <div className="prose prose-xs dark:prose-invert">
                    <MarkdownRenderer content={selectedDelegation.ai_summary_for_delegate} onChange={() => Promise.resolve()} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Handoff Strip */}
          {note.suggested_assignees && note.suggested_assignees.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#143109]/50">Sugestie odbiorców AI:</span>
              {note.suggested_assignees.map((person) => {
                return (
                  <button
                    key={person}
                    type="button"
                    onClick={() => {
                      setHandoffPrefillName(person);
                      setIsHandoffOpen(true);
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-slate-50 dark:bg-slate-900 border-[#AAAE7F]/30 hover:bg-[#D0D6B3]/40 hover:border-[#AAAE7F] transition-all cursor-pointer text-[#143109] dark:text-slate-300"
                    title={`Przekaż zadanie do: ${person}`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{person}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div 
            className="prose prose-slate dark:prose-invert max-w-none min-h-[100px]"
            onClick={() => {
              if (!isEditing) setIsEditing(true);
            }}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.currentTarget;
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    const value = target.value;
                    
                    const textBefore = value.substring(0, start);
                    const lines = textBefore.split('\n');
                    const currentLine = lines[lines.length - 1];
                    
                    const match = currentLine.match(/^(\s*)([-*]\s\[[ x]\]\s|[-*]\s|\d+\.\s)/i);
                    if (match) {
                      e.preventDefault();
                      const indent = match[1];
                      const prefix = match[2];
                      
                      if (currentLine.trim() === prefix.trim()) {
                        // Empty list item, remove it and exit list
                        const newTextBefore = lines.slice(0, -1).join('\n') + '\n' + indent;
                        setEditContent(newTextBefore + value.substring(end));
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newTextBefore.length;
                          }
                        }, 0);
                      } else {
                        // Add new list item
                        let newPrefix = prefix;
                        if (/^\d+\.\s/.test(prefix)) {
                          const num = parseInt(prefix, 10);
                          newPrefix = `${num + 1}. `;
                        } else if (/\[x\]/i.test(prefix)) {
                          newPrefix = prefix.replace(/x/i, ' '); // New checkbox is unchecked
                        }
                        
                        const insert = `\n${indent}${newPrefix}`;
                        setEditContent(textBefore + insert + value.substring(end));
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + insert.length;
                          }
                        }, 0);
                      }
                    }
                  }
                }}
                autoFocus
                className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 m-0 text-slate-700 dark:text-slate-300 font-sans text-sm leading-relaxed outline-none"
                placeholder="Wpisz treść notatki..."
              />
            ) : (
              <MarkdownRenderer
                content={note.content}
                onChange={(newContent) => handleNoteContentChange(note.id, newContent)}
              />
            )}
          </div>

          {/* Events */}
          {note.events && note.events.filter((_, i) => !(dismissedEvents || []).includes(i)).length > 0 && (
            <div className="mt-6 mb-2 space-y-3 relative z-10 border-t border-[#AAAE7F]/30 pt-4">
              <h3 className="text-sm font-semibold text-[#143109] dark:text-slate-200 mb-3 flex items-center">
                <CalendarDays className="w-4 h-4 mr-2 text-[#143109] dark:text-[#AAAE7F]" />
                Wykryte wydarzenia
              </h3>
              {note.events.map((event, idx) => {
                if ((dismissedEvents || []).includes(idx)) return null;
                const startStr = (event.date_start || "").replace(/[-:]/g, "");
                const endStr = (event.date_end || event.date_start || "").replace(/[-:]/g, "");
                
                let displayTime = "";
                if (event.date_start) {
                  try {
                    displayTime = new Date(event.date_start).toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' });
                    if (event.date_end) {
                      displayTime += ' - ' + new Date(event.date_end).toLocaleString('pl-PL', { timeStyle: 'short' });
                    }
                  } catch (e) {
                    displayTime = event.date_start;
                  }
                }

                return (
                  <div key={idx} className="group/event relative bg-[#D0D6B3]/40 dark:bg-slate-900/40 border border-[#AAAE7F]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setDismissedEvents(prev => [...(prev || []), idx])}
                      className="absolute top-2 right-2 p-0.5 rounded opacity-0 group-hover/event:opacity-100 transition-opacity bg-[#D0D6B3] text-[#143109] hover:bg-[#AAAE7F]"
                      title="Usuń propozycję"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 pr-5">
                      <div className="text-[#143109] dark:text-slate-200 font-bold text-base mb-1">
                        {event.title}
                      </div>
                      {displayTime && (
                        <div className="text-sm text-[#143109]/80 dark:text-[#AAAE7F] mb-2 font-medium">
                          {displayTime}
                        </div>
                      )}
                      {event.description && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {event.description}
                        </div>
                      )}
                    </div>
                    <a 
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}${event.description ? `&details=${encodeURIComponent(event.description)}` : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center whitespace-nowrap bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] px-4 py-2.5 rounded-lg font-bold transition-colors text-sm shadow-sm flex-shrink-0"
                      title="Dodaj do kalendarza Google"
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Dodaj
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* Raw Transcript Section for Audio/Video notes */}
          {(isAudio || isVideo || note.raw_transcript) && (
            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Pełna surowa transkrypcja ({isAudio ? 'Audio' : isVideo ? 'Wideo' : 'Nagranie'})</span>
                  {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const textToCopy = note.raw_transcript || note.content;
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedTranscript(true);
                      setTimeout(() => setCopiedTranscript(false), 2000);
                    }}
                    className="inline-flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors font-medium"
                    title="Kopiuj pełną transkrypcję do schowka"
                  >
                    {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTranscript ? 'Skopiowano' : 'Kopiuj'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!recipientEmail && user?.email) setRecipientEmail(user.email);
                      setShowEmailModal(true);
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] font-semibold transition-colors shadow-sm"
                    title="Wyślij transkrypcję na adres e-mail"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Wyślij e-mail</span>
                  </button>
                </div>
              </div>

              {showTranscript && (
                <div className="bg-[#EFEFEF] dark:bg-slate-800/80 border border-[#AAAE7F]/40 rounded-xl p-4 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {note.raw_transcript || note.content}
                </div>
              )}
            </div>
          )}

          {/* Formatting Toolbar */}
          {showFormattingBar && isEditing && (
            <div className="absolute bottom-0 left-6 bg-[#EFEFEF] dark:bg-slate-800 border border-[#AAAE7F]/40 shadow-xl rounded-lg p-1.5 flex items-center space-x-1 animate-in slide-in-from-bottom-2 fade-in duration-200 z-10">
              <button type="button" onClick={() => toggleHeader(1)} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-[#143109] dark:text-slate-300 font-semibold" title="Nagłówek 1">
                H1
              </button>
              <button type="button" onClick={() => toggleHeader(2)} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-[#143109] dark:text-slate-300 font-semibold" title="Nagłówek 2">
                H2
              </button>
              <button type="button" onClick={() => toggleHeader(0)} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-[#143109] dark:text-slate-300 font-semibold flex items-center justify-center h-9 w-9" title="Zwykły tekst">
                Aa
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button type="button" onClick={() => applyFormatting("**", "**")} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Pogrubienie">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => applyFormatting("*", "*")} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Kursywa">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => applyFormatting("<u>", "</u>")} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Podkreślenie">
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button type="button" onClick={() => toggleList('bullet')} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Lista wypunktowana">
                <List className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => toggleList('ordered')} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Lista numerowana">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => toggleList('todo')} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Lista zadań (Checkbox)">
                <ListTodo className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button type="button" onClick={clearFormatting} className="p-2 hover:bg-[#D0D6B3]/40 rounded text-slate-600 dark:text-slate-300" title="Usuń formatowanie">
                <Eraser className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="px-6 py-3 border-t border-[#AAAE7F]/30 flex items-center justify-between bg-[#EFEFEF]/50 dark:bg-slate-900/20">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button type="button" className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors" title="Zmień kolor">
              <Palette className="w-5 h-5" />
            </button>
            <button type="button" className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors hidden sm:block" title="Przypomnij mi">
              <Bell className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsHandoffOpen(true)}
              className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors"
              title="Przekaż zadanie (Handoff)"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button type="button" className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors" title="Dodaj obraz">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button type="button" className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors" title="Archiwizuj">
              <Archive className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] transition-colors relative group" 
              title="Supermoc AI"
              onClick={() => setShowAiChat(true)}
            >
              <Sparkles className="w-5 h-5 text-[#143109]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#143109] rounded-full border-2 border-white dark:border-[#202124]"></span>
            </button>
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(true);
                setShowFormattingBar(!showFormattingBar);
              }}
              className={`rounded-full p-2 transition-colors ${
                showFormattingBar 
                  ? 'bg-[#D0D6B3] text-[#143109]' 
                  : 'hover:bg-[#D0D6B3]/40 text-[#143109] dark:text-slate-400'
              }`}
              title="Opcje formatowania"
            >
              <Baseline className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={menuRef}>
              <button 
                type="button" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-[#D0D6B3]/40 rounded-full p-2 text-[#143109] dark:text-slate-400 transition-colors" 
                title="Więcej"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-48 bg-[#EFEFEF] dark:bg-slate-800 rounded-xl shadow-xl border border-[#AAAE7F]/40 overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      const newTitle = window.prompt("Podaj nowy tytuł notatki:", note.title || "");
                      if (newTitle !== null) {
                        onUpdateTitle?.(note.id, newTitle);
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-[#143109] dark:text-slate-200 hover:bg-[#D0D6B3]/40 flex items-center space-x-3 border-b border-[#AAAE7F]/30 transition-colors"
                  >
                    <Type className="w-4 h-4" />
                    <span>Zmień tytuł</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      const currentLabel = note.note_type === 'daily_morning' || note.note_type === 'generic' ? 'Szybka Notatka' : note.note_type;
                      const newLabel = window.prompt("Podaj nową etykietę:", currentLabel);
                      if (newLabel !== null && newLabel.trim() !== "") {
                        onUpdateLabel?.(note.id, newLabel.trim());
                      }
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-[#143109] dark:text-slate-200 hover:bg-[#D0D6B3]/40 flex items-center space-x-3 border-b border-[#AAAE7F]/30 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Zmień etykietę</span>
                  </button>

                  {onReanalyze && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onReanalyze(note.id);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-[#143109] dark:text-slate-200 hover:bg-[#D0D6B3]/40 flex items-center space-x-3 border-b border-[#AAAE7F]/30 transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                      <span>Ponów analizę AI</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (isEditing && editContent !== note.content) {
                        handleNoteContentChange(note.id, editContent);
                      }
                      onClose();
                      onDelete?.(note.id);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center space-x-3 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Usuń notatkę</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (isEditing && editContent !== note.content) {
                handleNoteContentChange(note.id, editContent);
              }
              onClose();
            }}
            className="px-6 py-2 bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            Zamknij
          </button>
        </div>
      </div>

      {showEmailModal && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            onMouseDown={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#202124] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Wyślij transkrypcję e-mailem
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmailModal(false);
                  setEmailStatusMessage(null);
                }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Wprowadź adres e-mail, na który ma zostać wysłana notatka wraz z pełną transkrypcją z nagrania.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adres e-mail odbiorcy
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  placeholder="np. jan.kowalski@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {emailStatusMessage && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                  {emailStatusMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 space-x-2">
                <a
                  href={`mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(`[keepGoals] Pełna Transkrypcja: ${note.title || 'Notatka z nagrania'}`)}&body=${encodeURIComponent(`Cześć!\n\nPrzesyłamy pełną transkrypcję (słowo w słowo z nagrania) z aplikacji keepGoals.\n\n--- PEŁNA TRANSKRYPCJA (SŁOWO W SŁOWO Z NAGRANIA) ---\n${note.raw_transcript || note.content}\n\n${note.raw_transcript ? `--- PODSUMOWANIE I ZADANIA AI ---\n${note.content}` : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                  title="Otwórz domyślny program pocztowy z gotową wiadomością"
                >
                  Program pocztowy
                </a>

                <button
                  type="button"
                  disabled={isSendingEmail || !recipientEmail.trim()}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setIsSendingEmail(true);
                    setEmailStatusMessage(null);
                    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail.trim())}?subject=${encodeURIComponent(`[keepGoals] Pełna Transkrypcja: ${note.title || 'Notatka z nagrania'}`)}&body=${encodeURIComponent(`Cześć!\n\nPrzesyłamy pełną transkrypcję (słowo w słowo z nagrania) z aplikacji keepGoals.\n\n--- PEŁNA TRANSKRYPCJA (SŁOWO W SŁOWO Z NAGRANIA) ---\n${note.raw_transcript || note.content}\n\n${note.raw_transcript ? `--- PODSUMOWANIE I ZADANIA AI ---\n${note.content}` : ''}`)}`;
                    
                    try {
                      const res = await sendNoteEmail(note.id, recipientEmail.trim());
                      setEmailStatusMessage(res.message);
                    } catch (err: any) {
                      const errorMsg = err.message || 'Brak serwera SMTP w .env.';
                      setEmailStatusMessage(`${errorMsg} Otwieram program pocztowy...`);
                      // Auto fallback to client mail app
                      setTimeout(() => {
                        window.location.href = mailtoUrl;
                      }, 500);
                    } finally {
                      setIsSendingEmail(false);
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Wysyłanie...' : 'Wyślij teraz'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAiChat && (
        <NoteAIChatModal
          note={{ ...note, content: editContent }} // przekaż aktualnie edytowaną treść
          onClose={() => setShowAiChat(false)}
          onNoteUpdated={(updatedNote) => {
            setEditContent(updatedNote.content);
            handleNoteContentChange(updatedNote.id, updatedNote.content);
          }}
        />
      )}

      <HandoffModal
        isOpen={isHandoffOpen}
        onClose={() => {
          setIsHandoffOpen(false);
          setHandoffPrefillName("");
        }}
        noteId={note.id}
        prefilledName={handoffPrefillName}
        onSuccess={() => {
          if (onHandoffSuccess) onHandoffSuccess();
        }}
      />
    </div>
  );
};

import React, { useState, useRef, useEffect } from "react";
import { Palette, Bell, Share2, Image, Archive, MoreVertical, Pin, Check, Trash2, Type, Tag, GripHorizontal, Play, Headphones, CalendarDays, FolderKanban, X, RotateCw, Loader2, AlertCircle, Clock, Eye, CheckCircle2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { HandoffModal } from "./HandoffModal";
import type { Note, Project } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface NoteCardProps {
  note: Note;
  formatNoteDate?: (dateStr: string) => string;
  handleNoteContentChange: (noteId: string, newContent: string) => Promise<void>;
  onTogglePin?: (noteId: string, currentPinStatus: boolean) => void;
  onDelete?: (noteId: string) => void;
  onUpdateTitle?: (noteId: string, newTitle: string) => void;
  onUpdateLabel?: (noteId: string, newLabel: string) => void;
  onUpdateProject?: (noteId: string, projectId: string | null) => void;
  onUpdateProjects?: (noteId: string, projectIds: string[]) => void;
  onReanalyze?: (noteId: string) => void;
  onUpdateAssignees?: (noteId: string, assigneeIds: string[]) => void;
  onHandoffSuccess?: () => void;
  projects?: Project[];
  onClick?: (noteId: string) => void;
}



export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  handleNoteContentChange,
  onTogglePin,
  onDelete,
  onUpdateTitle,
  onUpdateLabel,
  onUpdateProject,
  onUpdateProjects,
  onReanalyze,
  onHandoffSuccess,
  projects = [],
  onClick,
}) => {
  const isAudio = note.media_type?.startsWith("audio/");
  const isVideo = note.media_type?.startsWith("video/");
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [dismissedEvents, setDismissedEvents] = useState<number[]>([]);
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [handoffPrefillName, setHandoffPrefillName] = useState("");
  const [selectedDelegationId, setSelectedDelegationId] = useState<string | null>(null);
  const selectedDelegation = note.delegations?.find(d => d.id === selectedDelegationId);

  const menuRef = useRef<HTMLDivElement>(null);
  
  // Extract all assigned projects (from project_ids or legacy project_id)
  const currentProjectIds = note.project_ids && note.project_ids.length > 0 
    ? note.project_ids 
    : (note.project_id ? [note.project_id] : []);

  const assignedProjects = projects.filter((p) => currentProjectIds.includes(p.id));

  const isPending = note.processing_status === "pending";
  const isError = note.processing_status === "error_transcription" || note.processing_status === "error_ai";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : undefined,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      onClick={() => onClick?.(note.id)}
      className={`group relative bg-[#EFEFEF] dark:bg-[#202124] rounded-2xl border ${isDragging ? 'border-[#AAAE7F] shadow-xl' : 'border-[#AAAE7F]/30 hover:border-[#AAAE7F] hover:shadow-md'} transition-colors transition-shadow duration-200 p-4 sm:p-5 text-[#143109] dark:text-slate-100 flex flex-col justify-between h-fit w-full break-inside-avoid mb-4 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes}
        {...listeners}
        className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity bg-gradient-to-b from-black/5 to-transparent dark:from-white/5"
      >
        <GripHorizontal className="w-4 h-4 text-slate-400" />
      </div>

      {/* Top Left Selection Check */}
      <button 
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-[#F7F7F7] dark:bg-[#202124] hover:bg-[#D0D6B3]/40 border border-[#AAAE7F]/40 rounded-full shadow-sm text-[#143109] cursor-pointer z-10"
        title="Wybierz"
      >
        <Check className="w-3.5 h-3.5" />
      </button>

      {/* Top Right Delegation Avatars */}
      {note.delegations && note.delegations.length > 0 && (
        <div 
          className="absolute right-2 flex flex-row-reverse space-x-reverse -space-x-1.5 z-10"
          style={{ top: '-14px' }}
        >
          {note.delegations.map((del) => {
            const isSelected = selectedDelegationId === del.id;
            return (
              <button
                key={del.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDelegationId(isSelected ? null : del.id);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border cursor-pointer transition-all shadow-sm ${
                  isSelected
                    ? "bg-[#143109] text-[#F7F7F7] border-[#143109] scale-110 z-20"
                    : "bg-[#D0D6B3] text-[#143109] border-[#AAAE7F]/40 hover:bg-[#D0D6B3]/80 hover:scale-105"
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
                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-800 ${
                  del.delegation_status === "done" ? "bg-emerald-500" : del.delegation_status === "viewed" ? "bg-blue-500" : "bg-amber-500"
                }`} />
              </button>
            );
          })}
        </div>
      )}

      {/* Top Right Pin Icon */}
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin?.(note.id, !!note.is_pinned);
        }}
        className={`absolute top-2 transition-all p-1.5 bg-[#F7F7F7]/90 dark:bg-[#202124]/90 hover:bg-[#D0D6B3]/40 border border-[#AAAE7F]/40 rounded-full shadow-sm cursor-pointer z-10 ${
          note.delegations && note.delegations.length > 0 ? "right-11" : "right-2"
        } ${
          note.is_pinned
            ? "opacity-100 text-[#143109] fill-[#143109] hover:text-[#143109]/80 dark:text-[#AAAE7F] dark:fill-[#AAAE7F]"
            : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#143109]"
        }`}
        title={note.is_pinned ? "Odpnij notatkę" : "Przypnij notatkę"}
      >
        <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? "fill-current" : ""}`} />
      </button>

      <div className="w-full">
        {/* Status Indicators */}
        {isPending && (
          <div className="mb-2 inline-flex items-center space-x-1.5 text-[11px] font-semibold text-[#143109] bg-[#D0D6B3]/70 px-2.5 py-1 rounded-lg border border-[#AAAE7F]/50">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#143109]" />
            <span>Przetwarzanie AI w tle...</span>
          </div>
        )}

        {isError && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 min-w-0">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Błąd analizy AI</span>
            </div>
            {onReanalyze && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReanalyze(note.id);
                }}
                className="inline-flex items-center space-x-1 text-[11px] font-bold bg-[#143109] text-[#F7F7F7] px-2.5 py-1 rounded-lg hover:bg-[#143109]/90 transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
                title="Ponów analizę AI dla tej notatki"
              >
                <RotateCw className="w-3 h-3" />
                <span>Ponów</span>
              </button>
            )}
          </div>
        )}
        {/* Zaproszenie Banner */}
        {user && note.pending_user_ids?.includes(user.uid) && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between text-xs cursor-default">
            <span className="font-medium text-blue-800">Masz zaproszenie do notatki</span>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Oczekujące</span>
          </div>
        )}

        {/* Title */}
        {note.title && (
          <h3 className="text-base font-bold mb-2 text-[#143109] dark:text-slate-100 leading-snug pr-20">
            {note.title}
          </h3>
        )}

        {/* Project Badges */}
        {assignedProjects.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {assignedProjects.map((p) => (
              <span 
                key={p.id}
                style={{ color: p.color || "#143109", borderColor: `${p.color || "#143109"}50`, backgroundColor: `${p.color || "#143109"}18` }}
                className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
              >
                <FolderKanban className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[140px]">{p.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* Handoff Status Badge */}
        {selectedDelegation && (
          <div className="mb-2 flex items-center space-x-1.5 flex-wrap gap-y-1 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Delegacja ({selectedDelegation.delegated_to_name}):
            </span>
            {selectedDelegation.delegation_status === "sent" && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
                <Clock className="w-3 h-3 animate-pulse" />
                <span>Przekazane</span>
              </span>
            )}
            {selectedDelegation.delegation_status === "viewed" && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50">
                <Eye className="w-3 h-3" />
                <span>Wyświetlone</span>
              </span>
            )}
            {selectedDelegation.delegation_status === "done" && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                <CheckCircle2 className="w-3 h-3" />
                <span>Załatwione</span>
              </span>
            )}
          </div>
        )}

        {/* Media Indicator */}
        {note.media_url && (
          <div className="mb-3 flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            {isAudio && (
              <div title="Notatka audio" className="inline-flex items-center">
                <Headphones className="w-5 h-5 text-[#143109] dark:text-[#AAAE7F]" />
              </div>
            )}
            {isVideo && (
              <div title="Notatka wideo" className="inline-flex items-center">
                <Play className="w-5 h-5 fill-current text-[#143109] dark:text-[#AAAE7F]" />
              </div>
            )}
          </div>
        )}

        {/* Content with max-height and fade-out for long notes on grid */}
        <div className="relative prose prose-sm dark:prose-invert max-w-none text-[#143109]/90 dark:text-slate-300 max-h-[360px] overflow-hidden">
          <MarkdownRenderer
            content={note.content}
            onChange={(newContent) => handleNoteContentChange(note.id, newContent)}
          />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#EFEFEF] dark:from-[#202124] to-transparent pointer-events-none"></div>
        </div>

        {/* Events */}
        {note.events && note.events.filter((_, i) => !(dismissedEvents || []).includes(i)).length > 0 && (
          <div className="mt-3 space-y-2 relative z-10">
            {note.events.map((event, idx) => {
              if ((dismissedEvents || []).includes(idx)) return null;
              const startStr = (event.date_start || "").replace(/[-:]/g, "");
              const endStr = (event.date_end || event.date_start || "").replace(/[-:]/g, "");
              
              let displayTime = "";
              if (event.date_start) {
                try {
                  displayTime = new Date(event.date_start).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
                  if (event.date_end) {
                    displayTime += ' - ' + new Date(event.date_end).toLocaleString('pl-PL', { timeStyle: 'short' });
                  }
                } catch (e) {
                  displayTime = event.date_start;
                }
              }

              return (
                <div key={idx} className="group/event relative bg-[#D0D6B3]/40 dark:bg-slate-900/40 border border-[#AAAE7F]/40 rounded-xl p-2.5 flex flex-col space-y-1.5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDismissedEvents(prev => [...(prev || []), idx]); }}
                    className="absolute top-1.5 right-1.5 p-0.5 rounded opacity-0 group-hover/event:opacity-100 transition-opacity bg-[#D0D6B3] text-[#143109] hover:bg-[#AAAE7F]"
                    title="Usuń propozycję"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex items-start justify-between pr-5">
                    <div className="flex items-center space-x-1.5 text-[#143109] dark:text-slate-200 font-semibold text-sm min-w-0">
                      <CalendarDays className="w-4 h-4 flex-shrink-0 text-[#143109] dark:text-[#AAAE7F]" />
                      <span className="line-clamp-1">{event.title}</span>
                    </div>
                    <a 
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}${event.description ? `&details=${encodeURIComponent(event.description)}` : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-semibold bg-[#F7F7F7] dark:bg-slate-800 border border-[#AAAE7F]/50 hover:bg-[#D0D6B3]/40 text-[#143109] dark:text-[#AAAE7F] px-2 py-1 rounded-lg transition-colors whitespace-nowrap ml-2"
                      title="Dodaj do kalendarza Google"
                    >
                      Dodaj
                    </a>
                  </div>
                  {displayTime && (
                    <div className="text-xs text-[#143109]/80 dark:text-[#AAAE7F] pl-5 font-medium">
                      {displayTime}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Handoff Strip */}
      {note.suggested_assignees && note.suggested_assignees.length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex flex-wrap gap-1.5 items-center"
        >
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
            Sugerowani odbiorcy:
          </span>
          {note.suggested_assignees.map((person) => {
            return (
              <button
                key={person}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHandoffPrefillName(person);
                  setIsHandoffOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-slate-50 dark:bg-slate-800 text-[#143109] dark:text-[#AAAE7F] border-[#AAAE7F]/30 hover:bg-[#D0D6B3]/40 hover:border-[#AAAE7F] transition-all cursor-pointer"
                title={`Przekaż zadanie do: ${person}`}
              >
                <Share2 className="w-3 h-3" />
                <span>{person}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Hover Toolbar */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50"
      >
        <div className="flex items-center space-x-1">
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Zmień kolor">
            <Palette className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Przypomnij mi">
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              setIsHandoffOpen(true);
            }}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" 
            title="Przekaż (Handoff)"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Dodaj obraz">
            <Image className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Archiwizuj">
            <Archive className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" 
            title="Więcej"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  setIsProjectModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-2 transition-colors border-b border-slate-100 dark:border-slate-700"
              >
                <FolderKanban className="w-4 h-4 text-blue-500" />
                <span>{currentProjectIds.length > 0 ? "Zarządzaj projektami" : "Dołącz do projektów"}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  const newTitle = window.prompt("Podaj nowy tytuł notatki:", note.title || "");
                  if (newTitle !== null) {
                    onUpdateTitle?.(note.id, newTitle);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-2 transition-colors border-b border-slate-100 dark:border-slate-700"
              >
                <Type className="w-4 h-4" />
                <span>Zmień tytuł</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  const currentLabel = note.note_type === 'daily_morning' || note.note_type === 'generic' ? 'Szybka Notatka' : note.note_type;
                  const newLabel = window.prompt("Podaj nową etykietę:", currentLabel);
                  if (newLabel !== null && newLabel.trim() !== "") {
                    onUpdateLabel?.(note.id, newLabel.trim());
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-2 transition-colors border-b border-slate-100 dark:border-slate-700"
              >
                <Tag className="w-4 h-4" />
                <span>Zmień etykietę</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onDelete?.(note.id);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Usuń notatkę</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal wyboru projektów (Multi-select) */}
      {isProjectModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsProjectModalOpen(false);
          }}
        >
          <div 
            className="bg-white dark:bg-[#202124] rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Przypisz do projektów</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onUpdateProjects?.(note.id, []);
                  onUpdateProject?.(note.id, null);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentProjectIds.length === 0 ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span>Brak projektów (odepnij wszystkie)</span>
                {currentProjectIds.length === 0 && <Check className="w-4 h-4 text-blue-500" />}
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
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || "#3b82f6" }}></span>
                      <span className="truncate">{p.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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

export const NoteCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#202124] rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-5 flex flex-col justify-between animate-pulse h-40 w-full">
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-4 pr-6">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        {/* Title Skeleton */}
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
        {/* Content Skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-4/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

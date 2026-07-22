import React, { useState, useRef, useEffect } from "react";
import { Palette, Bell, Users, Image, Archive, MoreVertical, Pin, Check, Trash2, Type, Tag, GripHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { Note } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "";

interface NoteCardProps {
  note: Note;
  formatNoteDate: (dateStr: string) => string;
  handleNoteContentChange: (noteId: string, newContent: string) => Promise<void>;
  onTogglePin?: (noteId: string, currentPinStatus: boolean) => void;
  onDelete?: (noteId: string) => void;
  onUpdateTitle?: (noteId: string, newTitle: string) => void;
  onUpdateLabel?: (noteId: string, newLabel: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  formatNoteDate,
  handleNoteContentChange,
  onTogglePin,
  onDelete,
  onUpdateTitle,
  onUpdateLabel,
}) => {
  const isAudio = note.media_type?.startsWith("audio/");
  const isVideo = note.media_type?.startsWith("video/");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`break-inside-avoid mb-4 group relative bg-white dark:bg-[#202124] rounded-xl border ${isDragging ? 'border-blue-500 shadow-xl opacity-90' : 'border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'} transition-all duration-200 overflow-hidden p-5 text-slate-800 dark:text-slate-100 flex flex-col justify-between`}
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
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white dark:bg-[#202124] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer z-10"
        title="Wybierz"
      >
        <Check className="w-3.5 h-3.5" />
      </button>

      {/* Top Right Pin Icon */}
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin?.(note.id, !!note.is_pinned);
        }}
        className={`absolute top-2 right-2 transition-all p-1.5 bg-white/90 dark:bg-[#202124]/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm cursor-pointer z-10 ${
          note.is_pinned
            ? "opacity-100 text-amber-500 fill-amber-500 hover:text-amber-600 dark:text-amber-400 dark:fill-amber-400"
            : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
        }`}
        title={note.is_pinned ? "Odpnij notatkę" : "Przypnij notatkę"}
      >
        <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? "fill-current" : ""}`} />
      </button>

      <div className="w-full">
        {/* Header containing meta */}
        <div className="flex justify-between items-start mb-2.5 pr-6">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 rounded-md">
            {note.note_type === 'daily_morning' || note.note_type === 'generic' ? 'Szybka Notatka' : note.note_type}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {formatNoteDate(note.created_at)}
          </span>
        </div>

        {/* Title */}
        {note.title && (
          <h3 className="text-base font-bold mb-1.5 text-slate-900 dark:text-white leading-snug">
            {note.title}
          </h3>
        )}

        {/* Media Player */}
        {note.media_url && (
          <div className="mb-3 w-full overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            {isAudio && (
              <audio controls className="w-full h-10 outline-none" src={`${API_URL}${note.media_url}`}>
                Twoja przeglądarka nie obsługuje odtwarzacza audio.
              </audio>
            )}
            {isVideo && (
              <video controls className="w-full h-auto max-h-48 object-cover outline-none" src={`${API_URL}${note.media_url}`}>
                Twoja przeglądarka nie obsługuje odtwarzacza wideo.
              </video>
            )}
          </div>
        )}

        {/* Content with line-clamp-6 for long notes on mobile */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 line-clamp-6 overflow-hidden">
          <MarkdownRenderer
            content={note.content}
            onChange={(newContent) => handleNoteContentChange(note.id, newContent)}
          />
        </div>
      </div>

      {/* Bottom Hover Toolbar */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center space-x-1">
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Zmień kolor">
            <Palette className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Przypomnij mi">
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" title="Współpracownik">
            <Users className="w-3.5 h-3.5" />
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
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
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
    </div>
  );
};

export const NoteCardSkeleton: React.FC = () => {
  return (
    <div className="break-inside-avoid mb-4 bg-white dark:bg-[#202124] rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-5 flex flex-col justify-between animate-pulse h-40">
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

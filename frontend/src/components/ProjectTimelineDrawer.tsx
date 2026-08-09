import React, { useEffect, useMemo, useState } from "react";
import { X, CalendarDays, Clock, ExternalLink, FolderKanban, FileText } from "lucide-react";
import type { Project, Note, NoteEvent } from "../services/api";

interface ProjectTimelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  notes: Note[];
  onSelectNote?: (noteId: string) => void;
}

export interface TimelineItem {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string;
  description?: string;
  noteId: string;
  noteTitle: string;
  type: "event" | "milestone";
}

export const ProjectTimelineDrawer: React.FC<ProjectTimelineDrawerProps> = ({
  isOpen,
  onClose,
  project,
  notes,
  onSelectNote,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setIsMounted(true);
      timer = setTimeout(() => {
        setIsAnimating(true);
      }, 20);
    } else {
      setIsAnimating(false);
      timer = setTimeout(() => {
        setIsMounted(false);
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Aggregate and sort timeline items chronologically
  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    notes.forEach((note) => {
      // 1. Structured AI Extracted Events
      if (note.events && note.events.length > 0) {
        note.events.forEach((evt: NoteEvent, idx: number) => {
          items.push({
            id: `${note.id}-evt-${idx}`,
            title: evt.title,
            dateStart: evt.date_start,
            dateEnd: evt.date_end,
            description: evt.description,
            noteId: note.id,
            noteTitle: note.title || "Notatka projektowa",
            type: "event",
          });
        });
      } else {
        // 2. Note Milestones (Fallback for notes with title or content)
        items.push({
          id: `${note.id}-created`,
          title: note.title || "Wpis w projekcie",
          dateStart: note.created_at,
          description: note.content.slice(0, 120) + (note.content.length > 120 ? "..." : ""),
          noteId: note.id,
          noteTitle: note.title || "Notatka projektowa",
          type: "milestone",
        });
      }
    });

    // Sort chronologically ascending
    return items.sort((a, b) => {
      const timeA = new Date(a.dateStart).getTime() || 0;
      const timeB = new Date(b.dateStart).getTime() || 0;
      return timeA - timeB;
    });
  }, [notes]);

  const formatTimeRange = (startStr: string, endStr?: string) => {
    try {
      const start = new Date(startStr);
      if (isNaN(start.getTime())) return startStr;

      const datePart = start.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const startTime = start.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (endStr) {
        const end = new Date(endStr);
        if (!isNaN(end.getTime())) {
          const endTime = end.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `${datePart}, ${startTime} - ${endTime}`;
        }
      }

      return `${datePart}, ${startTime}`;
    } catch {
      return startStr;
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with smooth opacity transition */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md sm:max-w-lg bg-white dark:bg-[#202124] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-out ${
            isAnimating ? "translate-x-0" : "translate-x-full"
          }`}
        >
          
          {/* Top Header */}
          <div 
            style={{ borderBottomColor: project.color || "#143109" }}
            className="p-5 sm:p-6 border-b-2 flex items-center justify-between bg-[#EFEFEF]/50 dark:bg-slate-900/50"
          >
            <div>
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-5 h-5" style={{ color: project.color || "#143109" }} />
                <h2 className="text-lg font-bold text-[#143109] dark:text-white">Oś Czasu Projektu</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {project.name} • {timelineItems.length} {timelineItems.length === 1 ? "wydarzenie" : "wydarzeń"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zamknij (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timeline Content List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 relative">
            {timelineItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-3">
                <CalendarDays className="w-12 h-12 mx-auto opacity-70 text-[#143109] dark:text-[#AAAE7F]" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Brak zaplanowanych wydarzeń
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Nagrania głosowe i notatki z terminami wygenerują chronologiczną oś czasu dla tego projektu.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6">
                {/* Vertical Continuous Line */}
                <div 
                  style={{ backgroundColor: `${project.color || "#143109"}45` }}
                  className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-0.5"
                />

                {timelineItems.map((item) => {
                  const isEvent = item.type === "event";

                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        style={{
                          backgroundColor: project.color || "#143109",
                          boxShadow: `0 0 0 4px ${project.color || "#143109"}25`,
                        }}
                        className="absolute -left-6 sm:-left-8 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#202124] flex items-center justify-center transition-transform group-hover:scale-125"
                      />

                      {/* Event Card Container */}
                      <div className="bg-[#EFEFEF]/60 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 hover:border-[#AAAE7F] transition-all shadow-sm space-y-2.5">
                        
                        {/* Header Badge & Date */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {isEvent ? (
                              <Clock className="w-3.5 h-3.5 text-[#143109] dark:text-[#AAAE7F]" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className="text-[11px]">
                              {formatTimeRange(item.dateStart, item.dateEnd)}
                            </span>
                          </div>

                          {isEvent && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D0D6B3] text-[#143109] border border-[#AAAE7F]/40">
                              Spotkanie
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-[#143109] dark:text-white leading-snug">
                          {item.title}
                        </h4>

                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {item.description}
                          </p>
                        )}

                        {/* Footer Action Buttons */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectNote?.(item.noteId);
                              onClose();
                            }}
                            className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[160px]">{item.noteTitle}</span>
                          </button>

                          {isEvent && item.dateStart && (
                            <a
                              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&dates=${item.dateStart.replace(/[-:]/g, "")}/${(item.dateEnd || item.dateStart).replace(/[-:]/g, "")}${item.description ? `&details=${encodeURIComponent(item.description)}` : ""}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#143109] hover:text-[#143109]/80 dark:text-[#AAAE7F] dark:hover:text-[#AAAE7F]/80 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-[#AAAE7F]/50 hover:bg-[#D0D6B3]/30 transition-colors"
                              title="Dodaj do Kalendarza Google"
                            >
                              <span>Google Calendar</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-xs text-slate-400 dark:text-slate-500">
            Automatyczna synteza chronologiczna na podstawie ustaleń w projekcie
          </div>
        </div>
      </div>
    </div>
  );
};

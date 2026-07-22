import React from "react";
import { CheckSquare, Edit3, Mic, Image as ImageIcon } from "lucide-react";

interface MobileBottomBarProps {
  onNewNote: () => void;
  onNewList?: () => void;
  onNewAudio?: () => void;
  onNewImage?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onNewNote,
  onNewList,
  onNewAudio,
  onNewImage,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#202124] border-t border-slate-200/80 dark:border-slate-800 h-14 flex items-center justify-between px-5 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {/* Quick Tool Icons */}
      <div className="flex items-center space-x-5 text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={onNewList || onNewNote}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Nowa lista zadań"
        >
          <CheckSquare className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onNewNote}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Rysowanie"
        >
          <Edit3 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onNewAudio || onNewNote}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Nagranie głosowe"
        >
          <Mic className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onNewImage || onNewNote}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="Dodaj zdjęcie"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Google-Style Floating Action Button (FAB) */}
      <div className="relative">
        <button
          type="button"
          onClick={onNewNote}
          className="absolute right-0 bottom-[-6px] w-14 h-14 bg-white dark:bg-[#202124] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Utwórz nową notatkę"
        >
          {/* Google Plus Icon with Brand Colors */}
          <svg className="w-7 h-7" viewBox="0 0 36 36">
            <path fill="#4285F4" d="M16 16v14h4V20h14v-4H20V2h-4v14H2z" />
            <path fill="#EA4335" d="M16 16H2v4h14v14h4V20h14v-4H20V2h-4v14z" />
            <path fill="#FBBC05" d="M16 16v14h4V20h14v-4H20V2h-4v14H2z" clipPath="url(#cp1)" />
            <path fill="#34A853" d="M16 16H2v4h14v14h4V20h14v-4H20V2h-4v14z" clipPath="url(#cp2)" />
          </svg>
        </button>
      </div>
    </div>
  );
};

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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#EFEFEF] dark:bg-[#202124] border-t border-[#AAAE7F]/40 h-14 flex items-center justify-between px-5 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {/* Quick Tool Icons */}
      <div className="flex items-center space-x-5 text-[#143109] dark:text-slate-300">
        <button
          type="button"
          onClick={onNewNote}
          className="p-1.5 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
          title="Nowa notatka tekstowa"
        >
          <Edit3 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onNewList || onNewNote}
          className="p-1.5 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
          title="Nowa lista zadań"
        >
          <CheckSquare className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onNewImage || onNewNote}
          className="p-1.5 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
          title="Dodaj zdjęcie"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Floating Action Button (FAB) - Microphone Voice/Video Note */}
      <div className="relative">
        <button
          type="button"
          onClick={onNewAudio || onNewNote}
          className="absolute right-0 bottom-[-6px] w-14 h-14 bg-[#143109] text-[#F7F7F7] rounded-full shadow-xl border-2 border-[#F7F7F7] dark:border-slate-800 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          aria-label="Nagranie głosowe lub wideo"
          title="Nagranie głosowe lub wideo"
        >
          <Mic className="w-6 h-6 text-[#F7F7F7]" />
        </button>
      </div>
    </div>
  );
};

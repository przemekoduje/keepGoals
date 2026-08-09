import React from "react";
import { Globe, Check, X, Clock } from "lucide-react";

interface TimezoneModalProps {
  isOpen: boolean;
  detectedTimezone: string;
  currentTimezone: string;
  onConfirm: (newTimezone: string) => void;
  onKeepCurrent: () => void;
}

export const TimezoneModal: React.FC<TimezoneModalProps> = ({
  isOpen,
  detectedTimezone,
  currentTimezone,
  onConfirm,
  onKeepCurrent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#EFEFEF] dark:bg-slate-900 border border-[#AAAE7F]/40 rounded-2xl shadow-xl overflow-hidden p-6 text-[#143109] dark:text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onKeepCurrent}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#D0D6B3]/40 text-[#143109] dark:text-slate-400 transition-colors"
          title="Zamknij"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#D0D6B3]/60 dark:bg-slate-800 flex items-center justify-center text-[#143109] dark:text-[#AAAE7F] border border-[#AAAE7F]/30">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#143109] dark:text-slate-100 leading-tight">
              Wykryto nową strefę czasową
            </h3>
            <p className="text-xs text-[#143109]/70 dark:text-slate-400 font-medium">
              Wykryto zmianę Twojej lokalizacji czasowej
            </p>
          </div>
        </div>

        <div className="my-5 p-4 rounded-xl bg-[#F7F7F7] dark:bg-slate-800/80 border border-[#AAAE7F]/30 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#143109]/70 dark:text-slate-400 font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-[#AAAE7F]" />
              Wykryta strefa (urządzenie):
            </span>
            <span className="font-bold text-[#143109] dark:text-slate-200 bg-[#D0D6B3]/40 dark:bg-slate-700 px-2.5 py-0.5 rounded-md border border-[#AAAE7F]/40">
              {detectedTimezone}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#143109]/70 dark:text-slate-400 font-medium">
              Obecnie zapisana strefa:
            </span>
            <span className="font-medium text-[#143109]/80 dark:text-slate-400">
              {currentTimezone}
            </span>
          </div>
        </div>

        <p className="text-xs text-[#143109]/80 dark:text-slate-300 mb-6 leading-relaxed">
          Czy chcesz zaktualizować strefę czasową aplikacji? Pozwoli to AI poprawnie transkrybować godziny oraz wyświetlać terminy wydarzeń w Twoim aktualnym czasie.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => onConfirm(detectedTimezone)}
            className="flex-1 inline-flex items-center justify-center space-x-2 bg-[#143109] hover:bg-[#143109]/90 text-[#F7F7F7] font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95 text-sm"
          >
            <Check className="w-4 h-4" />
            <span>Zaktualizuj ({detectedTimezone})</span>
          </button>
          
          <button
            type="button"
            onClick={onKeepCurrent}
            className="inline-flex items-center justify-center bg-transparent border border-[#AAAE7F] text-[#143109] dark:text-slate-300 font-semibold px-4 py-2.5 rounded-xl hover:bg-[#D0D6B3]/30 transition-all cursor-pointer text-sm"
          >
            <span>Zachowaj obecną</span>
          </button>
        </div>
      </div>
    </div>
  );
};

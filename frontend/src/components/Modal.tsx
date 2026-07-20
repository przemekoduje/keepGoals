import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
      {/* Tło zamykające modal po kliknięciu */}
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-800 rounded-[24px] shadow-xl border border-slate-100 dark:border-slate-700 max-w-md w-full p-8 transition-all duration-200 transform scale-100 z-10">
        {/* Nagłówek modala */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Zawartość */}
        <div>{children}</div>
      </div>
    </div>
  );
};

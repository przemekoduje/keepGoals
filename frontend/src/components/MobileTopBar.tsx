import React from "react";
import { Menu, Search, LayoutGrid, List, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface MobileTopBarProps {
  onOpenMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isGridView: boolean;
  onToggleView: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onOpenMenu,
  searchQuery,
  onSearchChange,
  isGridView,
  onToggleView,
}) => {
  const { user } = useAuth();

  return (
    <div className="w-full px-3 py-2 md:hidden">
      <div className="bg-white dark:bg-[#202124] rounded-full border border-slate-200 dark:border-slate-700/80 shadow-md flex items-center px-3 py-1.5 space-x-2">
        {/* Menu Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Otwórz menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="flex-1 flex items-center space-x-2">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Wyszukaj notatki"
            className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-0"
          />
        </div>

        {/* View Toggle Button */}
        <button
          type="button"
          onClick={onToggleView}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          title={isGridView ? "Widok jednokolumnowy" : "Widok dwukolumnowy"}
        >
          {isGridView ? (
            <List className="w-5 h-5" />
          ) : (
            <LayoutGrid className="w-5 h-5" />
          )}
        </button>

        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-300 dark:border-amber-700">
            {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </div>
  );
};

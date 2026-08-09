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
      <div className="bg-[#EFEFEF] dark:bg-[#202124] rounded-full border border-[#AAAE7F]/40 shadow-md flex items-center px-3 py-1.5 space-x-2">
        {/* Menu Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="p-1.5 text-[#143109] dark:text-slate-300 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
          aria-label="Otwórz menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="flex-1 flex items-center space-x-2">
          <Search className="w-4 h-4 text-[#143109]/60 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Wyszukaj notatki"
            className="w-full bg-transparent border-none text-[#143109] dark:text-slate-100 placeholder-[#143109]/60 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-0"
          />
        </div>

        {/* View Toggle Button */}
        <button
          type="button"
          onClick={onToggleView}
          className="p-1.5 text-[#143109] dark:text-slate-300 hover:bg-[#D0D6B3]/40 rounded-full transition-colors"
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
          <div className="w-8 h-8 rounded-full bg-[#D0D6B3] text-[#143109] flex items-center justify-center font-bold text-xs border border-[#AAAE7F]">
            {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass = "flex items-center space-x-3 px-4 py-3 font-semibold transition-all duration-200 group text-sm";
    const activeClass = "bg-amber-100/60 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 rounded-r-full border-r-4 border-amber-400";
    const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-full border-r-4 border-transparent hover:border-slate-200 dark:hover:border-slate-700";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div className="w-64 h-full bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col py-4">
      {/* Nagłówek / Logo */}
      <div className="px-6 pb-6 flex items-center space-x-3 mb-2">
        <div className="h-10 w-10 bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 rounded-xl flex items-center justify-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
          </svg>
        </div>
        <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">keepGoals</span>
      </div>

      {/* Menu Nawigacyjne */}
      <nav className="flex-1 pr-4">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" className={navItemClass} onClick={onNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
              </svg>
              <span>Notatki</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/goals" className={navItemClass} onClick={onNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Cele Strategiczne</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Dolny pasek uzytkownika */}
      <div className="px-6 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 truncate" title={user?.email || ""}>
          {user?.email}
        </div>
        <button
          onClick={logout}
          className="w-full py-2 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 rounded-xl text-sm font-semibold transition-colors duration-200"
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
};

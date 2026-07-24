import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

interface SidebarProps {
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, isCollapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [ignoreHover, setIgnoreHover] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showFull = !isCollapsed || isHovered;

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isCollapsed && !ignoreHover) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (isCollapsed) {
      setIsHovered(false);
      setIgnoreHover(false);
    }
  };

  const handleToggle = () => {
    if (onToggleCollapse) onToggleCollapse();
    if (!isCollapsed) {
      setIsHovered(false);
      setIgnoreHover(true);
    } else {
      setIgnoreHover(false);
    }
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass = `flex items-center py-3 font-semibold transition-all duration-200 group text-sm ${showFull ? 'px-4 space-x-3 rounded-r-full' : 'justify-center mx-2 rounded-full'}`;
    const activeClass = "bg-[#feefc3] dark:bg-[#41331c] text-slate-900 dark:text-amber-100";
    const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-full bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col py-4 transition-all duration-200 z-40 ${
        isCollapsed 
          ? (isHovered ? 'w-64 absolute shadow-2xl left-0 top-0 bottom-0' : 'w-[72px] relative') 
          : 'w-64 relative'
      }`}
    >
      {/* Header / Logo */}
      <div className={`px-4 pb-6 flex items-center mb-2 ${showFull ? 'space-x-2' : 'justify-center'}`}>
        {onToggleCollapse && (
          <button 
            onClick={handleToggle} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 flex-shrink-0"
            title={isCollapsed ? "Rozwiń menu" : "Zwiń menu"}
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        {showFull && (
          <div className="flex items-center overflow-hidden">
            <img src="/logo.png" alt="keepGoals Logo" className="h-7 w-auto object-contain" />
          </div>
        )}
      </div>

      {/* Menu Nawigacyjne */}
      <nav className={`flex-1 ${showFull ? 'pr-4' : ''}`}>
        <ul className="space-y-1">
          <li>
            <NavLink to="/" className={navItemClass} onClick={onNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
              </svg>
              {showFull && <span className="whitespace-nowrap overflow-hidden">keep</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/goals" className={navItemClass} onClick={onNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {showFull && <span className="whitespace-nowrap overflow-hidden">goals</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/trash" className={navItemClass} onClick={onNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              {showFull && <span className="whitespace-nowrap overflow-hidden">kosz</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={navItemClass} onClick={onNavigate}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              {showFull && <span className="whitespace-nowrap overflow-hidden">ustawienia</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Dolny pasek uzytkownika */}
      <div className={`px-4 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto flex flex-col ${showFull ? 'items-start' : 'items-center'}`}>
        {showFull ? (
          <>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 truncate w-full px-2" title={user?.email || ""}>
              {user?.email}
            </div>
            <button
              onClick={logout}
              className="w-full py-2 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 rounded-xl text-sm font-semibold transition-colors duration-200"
            >
              Wyloguj się
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            title="Wyloguj się"
            className="p-2 bg-slate-50 text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 rounded-full transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

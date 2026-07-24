import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { MobileTopBar } from '../components/MobileTopBar';
import { MobileBottomBar } from '../components/MobileBottomBar';
import { MediaRecorderBase } from '../components/MediaRecorderBase';
import { X } from 'lucide-react';

export interface MainLayoutContextType {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isGridView: boolean;
  setIsGridView: React.Dispatch<React.SetStateAction<boolean>>;
  isAudioRecorderOpen: boolean;
  setIsAudioRecorderOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex h-full flex-shrink-0 transition-all duration-200 relative ${isSidebarCollapsed ? 'w-[72px]' : 'w-64'}`}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-white dark:bg-slate-800 z-10 shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label="Zamknij menu"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-800 relative">
        {/* Mobile Top Navigation Bar */}
        <MobileTopBar
          onOpenMenu={() => setMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isGridView={isGridView}
          onToggleView={() => setIsGridView((prev) => !prev)}
        />

        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet context={{
            searchQuery,
            setSearchQuery,
            isGridView,
            setIsGridView,
            isAudioRecorderOpen,
            setIsAudioRecorderOpen,
            refreshTrigger,
            triggerRefresh,
          } satisfies MainLayoutContextType} />
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomBar
          onNewNote={() => {
            const inputEl = document.getElementById("keep-input-bar");
            if (inputEl) {
              inputEl.scrollIntoView({ behavior: "smooth" });
              inputEl.focus();
            }
          }}
          onNewAudio={() => setIsAudioRecorderOpen(true)}
        />

        {/* MediaRecorderBase modal integration for mobile voice notes */}
        <MediaRecorderBase
          isOpenExternal={isAudioRecorderOpen}
          onCloseExternal={() => setIsAudioRecorderOpen(false)}
          onUploadSuccess={() => {
            setIsAudioRecorderOpen(false);
            triggerRefresh();
          }}
        />
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { MobileTopBar } from '../components/MobileTopBar';
import { MobileBottomBar } from '../components/MobileBottomBar';
import { MediaRecorderBase } from '../components/MediaRecorderBase';
import { TimezoneModal } from '../components/TimezoneModal';
import { fetchUserSettings, updateUserSettings } from '../services/api';
import { getBrowserTimezone } from '../utils/dateUtils';
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
  userTimezone: string;
}

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Timezone state
  const [userTimezone, setUserTimezone] = useState<string>("Europe/Warsaw");
  const [detectedTimezone, setDetectedTimezone] = useState<string>("");
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const checkTimezone = async () => {
      try {
        const settings = await fetchUserSettings();
        const storedTz = settings.timezone || "Europe/Warsaw";
        setUserTimezone(storedTz);

        const browserTz = getBrowserTimezone();
        if (browserTz && storedTz && browserTz !== storedTz) {
          setDetectedTimezone(browserTz);
          setIsTimezoneModalOpen(true);
        }
      } catch (err) {
        console.error("Błąd podczas sprawdzania strefy czasowej:", err);
      }
    };
    checkTimezone();
  }, []);

  const handleConfirmTimezone = async (newTz: string) => {
    try {
      await updateUserSettings({ timezone: newTz });
      setUserTimezone(newTz);
      setIsTimezoneModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error("Błąd zapisu nowej strefy czasowej:", err);
      setIsTimezoneModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F7] dark:bg-slate-900 font-sans text-[#143109] dark:text-slate-100">
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
          <div className="relative w-64 max-w-[80vw] h-full bg-[#F7F7F7] dark:bg-slate-800 z-10 shadow-2xl">
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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F7F7F7] dark:bg-slate-800 relative">
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
            userTimezone,
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

        {/* Timezone detection modal */}
        <TimezoneModal
          isOpen={isTimezoneModalOpen}
          detectedTimezone={detectedTimezone}
          currentTimezone={userTimezone}
          onConfirm={handleConfirmTimezone}
          onKeepCurrent={() => setIsTimezoneModalOpen(false)}
        />
      </div>
    </div>
  );
};


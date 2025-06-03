import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Chat from "@/components/Chat";
import PlanTimeline from "@/components/PlanTimeline";
import SettingsModal from "@/components/SettingsModal";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon } from "lucide-react";

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Glitter Overlay */}
      <div className="fixed inset-0 glitter-overlay pointer-events-none z-0"></div>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar onSettingsClick={() => setShowSettings(true)} />
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-pink-200 dark:border-violet-400/30 z-20 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading gradient-text">AgenticHQ</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gradient-to-r from-pink-400 to-violet-400 text-white hover:scale-110"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-xl bg-gradient-to-r from-pink-400 to-violet-400 text-white"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed left-0 top-20 bottom-0 w-80 bg-white dark:bg-gray-900 p-4" onClick={(e) => e.stopPropagation()}>
            <Sidebar onSettingsClick={() => { setShowSettings(true); setShowMobileMenu(false); }} />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 md:mt-0 mt-20">
        <div className="flex-1 flex">
          <Chat />
          
          {/* Desktop Plan Timeline */}
          <div className="hidden xl:block">
            <PlanTimeline />
          </div>
        </div>
      </main>
      
      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

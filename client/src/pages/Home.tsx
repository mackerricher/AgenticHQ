import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Chat from "@/components/Chat";
import SettingsModal from "@/components/SettingsModal";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar onSettingsClick={() => setShowSettings(true)} />
      </div>

      {/* Mobile Menu Button - Fixed Position */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 bg-gray-800 text-white hover:bg-gray-700 rounded-lg"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <Sidebar onSettingsClick={() => { setShowSettings(true); setShowMobileMenu(false); }} />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Chat />
      </main>
      
      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Moon, Sun, Home } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "wouter";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-pink-200 dark:border-violet-400/30">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/">
          <Button variant="ghost" className="text-lg font-bold gradient-text hover:bg-pink-50 dark:hover:bg-violet-900/20">
            <Home className="h-5 w-5 mr-2" />
            AgenticHQ
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-violet-900/20"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
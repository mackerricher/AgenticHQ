import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { api } from "@/lib/api";
import logoSrc from "@assets/main_logo.png";
import { 
  MessageCircle, 
  Settings, 
  Users, 
  Package, 
  Wrench, 
  Bot,
  Sun, 
  Moon,
  Plug
} from "lucide-react";

interface SidebarProps {
  onSettingsClick: () => void;
}

export default function Sidebar({ onSettingsClick }: SidebarProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Check API key statuses
  const { data: openaiStatus } = useQuery({
    queryKey: ["/api/keys/openai"],
    refetchInterval: 30000,
  });

  const { data: githubStatus } = useQuery({
    queryKey: ["/api/keys/github"],
    refetchInterval: 30000,
  });

  const { data: gmailStatus } = useQuery({
    queryKey: ["/api/keys/gmail"],
    refetchInterval: 30000,
  });

  const getStatusIndicator = (hasKey: boolean) => {
    return (
      <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-gray-700 dark:bg-gray-300' : 'bg-gray-400 dark:bg-gray-600'}`} />
    );
  };

  return (
    <aside className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header with Home link and Theme Toggle */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="cursor-pointer hover:opacity-80 transition-opacity">
              <img 
                src={logoSrc} 
                alt="AgenticHQ" 
                className="h-12 w-auto"
              />
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 transition-colors ${
              location === "/" 
                ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
        </Link>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Workflow Builder
          </h3>

          <Link href="/clients">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 transition-colors ${
                location === "/clients" 
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Bot className="h-4 w-4" />
              Clients
            </Button>
          </Link>

          <Link href="/agents">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 transition-colors ${
                location === "/agents" 
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Users className="h-4 w-4" />
              Agents
            </Button>
          </Link>

          <Link href="/subagents">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 transition-colors ${
                location === "/subagents" 
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Package className="h-4 w-4" />
              Sub-Agents
            </Button>
          </Link>

          <Link href="/tools">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 transition-colors ${
                location === "/tools" 
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Wrench className="h-4 w-4" />
              Tools
            </Button>
          </Link>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Configuration
          </h3>

          <Button
            variant="ghost"
            onClick={onSettingsClick}
            className="w-full justify-between hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Plug className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span>Connections</span>
            </div>
            <div className="flex items-center gap-1">
              {getStatusIndicator((openaiStatus as any)?.hasKey || false)}
              {getStatusIndicator((githubStatus as any)?.hasKey || false)}
              {getStatusIndicator((gmailStatus as any)?.hasKey || false)}
            </div>
          </Button>
        </div>
      </nav>


    </aside>
  );
}

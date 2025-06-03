import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { api } from "@/lib/api";
import { 
  MessageCircle, 
  Settings, 
  Users, 
  Package, 
  Wrench, 
  Bot,
  Sun, 
  Moon,
  Leaf,
  ExternalLink,
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
      <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-400' : 'bg-gray-400'}`} />
    );
  };

  return (
    <aside className="w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-pink-200 dark:border-violet-400/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-pink-200 dark:border-violet-400/30">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading gradient-text">AgenticHQ</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gradient-to-r from-pink-400 to-violet-400 text-white hover:scale-110 transition-transform duration-200"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          AI-powered workflow automation
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/">
          <Button
            variant={location === "/" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 ${
              location === "/" 
                ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg" 
                : "hover:bg-white/50 dark:hover:bg-violet-400/20"
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
              variant={location === "/clients" ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                location === "/clients" 
                  ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg" 
                  : "hover:bg-white/50 dark:hover:bg-violet-400/20"
              }`}
            >
              <Bot className="h-4 w-4" />
              Clients
            </Button>
          </Link>

          <Link href="/agents">
            <Button
              variant={location === "/agents" ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                location === "/agents" 
                  ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg" 
                  : "hover:bg-white/50 dark:hover:bg-violet-400/20"
              }`}
            >
              <Users className="h-4 w-4" />
              Agents
            </Button>
          </Link>

          <Link href="/subagents">
            <Button
              variant={location === "/subagents" ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                location === "/subagents" 
                  ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg" 
                  : "hover:bg-white/50 dark:hover:bg-violet-400/20"
              }`}
            >
              <Package className="h-4 w-4" />
              Sub-Agents
            </Button>
          </Link>

          <Link href="/tools">
            <Button
              variant={location === "/tools" ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                location === "/tools" 
                  ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg" 
                  : "hover:bg-white/50 dark:hover:bg-violet-400/20"
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
            className="w-full justify-between hover:bg-white/50 dark:hover:bg-violet-400/20 text-gray-700 dark:text-gray-300"
          >
            <div className="flex items-center gap-3">
              <Plug className="h-4 w-4 text-green-500" />
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

      {/* Eco Footer */}
      <div className="p-4 border-t border-pink-200 dark:border-violet-400/30">
        <Link href="/eco-pledge">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            <Leaf className="h-4 w-4" />
            <span>Eco Pledge</span>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
        </Link>
      </div>
    </aside>
  );
}

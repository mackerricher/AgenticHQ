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
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <Link href="/clients">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-left ${
              location === "/clients" 
                ? "bg-gray-700 text-white" 
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="text-sm">Clients</span>
            <span className="ml-auto text-xs bg-gray-600 px-1.5 py-0.5 rounded">1</span>
          </Button>
        </Link>

        <Link href="/agents">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-left ${
              location === "/agents" 
                ? "bg-gray-700 text-white" 
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span className="text-sm">Servers</span>
            <span className="ml-auto text-xs bg-gray-600 px-1.5 py-0.5 rounded">3</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          onClick={onSettingsClick}
          className="w-full justify-start gap-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <Plug className="h-4 w-4" />
          <span className="text-sm">LLM Connections</span>
        </Button>
      </nav>
    </aside>
  );
}

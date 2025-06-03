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
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center">
            <div className="w-6 h-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-80"></div>
              <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
          <h1 className="text-white font-semibold text-lg">AgenticHQ</h1>
        </div>
      </div>

      {/* Chat Section */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Chat</h3>
        <Link href="/">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-left ${
              location === "/" 
                ? "bg-gray-700 text-white" 
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">General Chat</span>
          </Button>
        </Link>
      </div>

      {/* Workflow Section */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Workflow</h3>
        <div className="space-y-1">
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
        </div>
      </div>

      {/* Settings Section */}
      <div className="mt-auto p-3 border-t border-gray-700">
        <Button
          variant="ghost"
          onClick={onSettingsClick}
          className="w-full justify-start gap-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Settings</span>
        </Button>

        <Button
          variant="ghost"
          onClick={onSettingsClick}
          className="w-full justify-start gap-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white mt-1"
        >
          <Plug className="h-4 w-4" />
          <span className="text-sm">LLM Connections</span>
          <div className="ml-auto flex items-center gap-1">
            {getStatusIndicator((openaiStatus as any)?.hasKey || false)}
            {getStatusIndicator((githubStatus as any)?.hasKey || false)}
            {getStatusIndicator((gmailStatus as any)?.hasKey || false)}
          </div>
        </Button>
      </div>
    </aside>
  );
}

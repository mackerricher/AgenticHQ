import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Paperclip, 
  Bot, 
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  planId?: number;
  steps?: any[];
}

interface PlanStep {
  tool: string;
  args: Record<string, any>;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [planSteps, setPlanSteps] = useState<PlanStep[]>([]);
  const [stepStatuses, setStepStatuses] = useState<Record<number, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat history
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/history"],
    refetchInterval: 5000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: api.chat.send,
    onSuccess: (data) => {
      if (data.planId && data.steps) {
        setActivePlanId(data.planId);
        setPlanSteps(data.steps);
        
        // Initialize step statuses
        const statuses: Record<number, string> = {};
        data.steps.forEach((_, index) => {
          statuses[index] = "pending";
        });
        setStepStatuses(statuses);

        // Set up Server-Sent Events for plan progress
        const eventSource = api.plans.events(data.planId);
        
        eventSource.onmessage = (event) => {
          const eventData = JSON.parse(event.data);
          
          if (eventData.stepIndex !== undefined) {
            setStepStatuses(prev => ({
              ...prev,
              [eventData.stepIndex]: eventData.result ? "completed" : eventData.error ? "failed" : "running"
            }));
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
        };

        // Clean up event source after 30 seconds
        setTimeout(() => {
          eventSource.close();
          setActivePlanId(null);
        }, 30000);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    autoResize();
  }, [message]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "✓ Completed";
      case "running":
        return "⏳ Running";
      case "failed":
        return "✗ Failed";
      default:
        return "⏸️ Pending";
    }
  };

  const getStepBackgroundClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-400/30";
      case "running":
        return "bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border-blue-200 dark:border-blue-400/30";
      case "failed":
        return "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-400/30";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-600/30";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">GC</span>
          </div>
          <div>
            <h2 className="text-white font-medium">General Chat Client</h2>
            <p className="text-gray-400 text-sm">Chat interface • 0 servers connected</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-sm">
              History
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-sm">
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 text-sm">
              Clear Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900">
        {Array.isArray(messages) && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-white text-lg font-medium mb-2">Welcome to AgenticHQ</h3>
              <p className="text-gray-400 text-sm max-w-md">
                Start a conversation with your AI assistant. I can help automate workflows and execute multi-step tasks.
              </p>
            </div>
          </div>
        )}

        {Array.isArray(messages) && messages.map((msg: ChatMessage) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "user" ? "bg-gray-600" : "bg-blue-500"
              }`}>
                {msg.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className={`rounded-lg p-4 ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white ml-auto max-w-md"
                  : "bg-gray-700 text-gray-100"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className="text-xs opacity-70 mt-2">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>

              {/* Show plan steps if this message has them */}
              {msg.steps && msg.steps.length > 0 && (
                <div className="space-y-2 mt-2">
                  {msg.steps.map((step: PlanStep, index: number) => {
                    const status = stepStatuses[index] || "pending";
                    return (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            Calling tool: {step.tool}
                          </span>
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                            success
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Shift+Enter for new line)"
              className="resize-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[50px] max-h-32"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Press Ctrl+Enter to send • 0 tools available
        </div>
      </div>
    </div>
  );
}

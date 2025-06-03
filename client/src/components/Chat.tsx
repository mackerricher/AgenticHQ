import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useRoute } from "wouter";
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
  const [match, params] = useRoute("/chat/:clientId");
  const clientId = params?.clientId ? parseInt(params.clientId) : null;
  
  const [message, setMessage] = useState("");
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [planSteps, setPlanSteps] = useState<PlanStep[]>([]);
  const [stepStatuses, setStepStatuses] = useState<Record<number, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch client data to get assigned agents and their tools
  const { data: client } = useQuery({
    queryKey: ["/api/clients", clientId],
    enabled: !!clientId,
  });

  // Fetch chat history for this client
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat/history", clientId],
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

  // Helper functions for inline timeline
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

  const getStepBackgroundClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-400/30";
      case "running":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-400/30";
      case "failed":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-400/30";
      default:
        return "bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-600/30";
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
        return "⏸ Pending";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-32">
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">Welcome to AgenticHQ</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    I'm your AI workflow assistant! I can help you automate multi-step tasks by creating plans and executing them step-by-step. 
                    Try asking me to do something like:
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm">
                      <span className="font-mono text-gray-800 dark:text-gray-200">"Create a GitHub repo for my project and email me when it's ready"</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm">
                      <span className="font-mono text-gray-800 dark:text-gray-200">"Write a README file and add it to my repository"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg: ChatMessage) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto chat-message"
            >
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 max-w-md text-gray-900 dark:text-gray-100">
                    <p>{msg.content}</p>
                    <div className="text-xs opacity-75 mt-2">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {msg.content}
                      </div>
                      
                      {/* Show plan steps if this is an active plan */}
                      {msg.planId === activePlanId && planSteps.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="font-heading text-lg gradient-text">Execution Plan:</h4>
                          {planSteps.map((step, index) => (
                            <div
                              key={index}
                              className={`plan-step flex items-center gap-3 p-3 rounded-lg border ${getStepBackgroundClass(stepStatuses[index] || "pending")}`}
                            >
                              {getStepIcon(stepStatuses[index] || "pending")}
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                  {step.tool.replace('.', ' - ')}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {JSON.stringify(step.args)}
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {getStepStatusText(stepStatuses[index] || "pending")}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 md:left-80 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AgenticHQ..."
                className="resize-none bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-gray-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 min-h-[50px] max-h-32"
                rows={1}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

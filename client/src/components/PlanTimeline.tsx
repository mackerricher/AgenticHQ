import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, AlertCircle, Loader2, TrendingUp } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "step" | "plan";
  status: "pending" | "running" | "completed" | "failed";
  title: string;
  description: string;
  timestamp: Date;
  progress?: number;
}

export default function PlanTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: "1",
      type: "step",
      status: "completed",
      title: "Repository Created",
      description: "HelloWorld repository initialized",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
      id: "2",
      type: "step",
      status: "running",
      title: "Creating README",
      description: "Generating project documentation...",
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      progress: 75,
    },
    {
      id: "3",
      type: "step",
      status: "pending",
      title: "Add File to Repo",
      description: "Waiting for previous step...",
      timestamp: new Date(),
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "from-green-300 to-blue-300 dark:from-green-600 dark:to-blue-600";
      case "running":
        return "from-blue-300 to-violet-300 dark:from-blue-600 dark:to-violet-600";
      case "failed":
        return "from-red-300 to-pink-300 dark:from-red-600 dark:to-pink-600";
      default:
        return "from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700";
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-200 dark:border-green-400/30";
      case "running":
        return "border-blue-200 dark:border-blue-400/30";
      case "failed":
        return "border-red-200 dark:border-red-400/30";
      default:
        return "border-gray-200 dark:border-gray-600/30";
    }
  };

  return (
    <div className="w-80 border-l border-pink-200 dark:border-violet-400/30 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
      <div className="p-4 border-b border-pink-200 dark:border-violet-400/30">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-pink-500" />
          <h3 className="font-heading text-lg gradient-text">Plan Timeline</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Live execution progress</p>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <AnimatePresence>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-lg z-10">
                  {getStatusIcon(event.status)}
                </div>
                <div className="flex-1">
                  <motion.div
                    className={`bg-white/60 dark:bg-gray-900/60 rounded-lg p-3 border ${getBorderColor(event.status)} backdrop-blur-sm`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={`font-semibold text-sm ${
                      event.status === "completed" ? "text-green-800 dark:text-green-300" :
                      event.status === "running" ? "text-blue-800 dark:text-blue-300" :
                      event.status === "failed" ? "text-red-800 dark:text-red-300" :
                      "text-gray-600 dark:text-gray-400"
                    }`}>
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {event.description}
                    </div>
                    
                    {/* Progress bar for running tasks */}
                    {event.status === "running" && event.progress && (
                      <div className="mt-2">
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                          <motion.div
                            className="bg-blue-500 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${event.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {event.progress}% complete
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {event.timestamp.toLocaleTimeString()}
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Timeline connector */}
              {index < events.length - 1 && (
                <div className={`absolute left-4 top-8 bottom-0 w-px bg-gradient-to-b ${getStatusColor(event.status)}`} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No active plans. Start a conversation to see execution progress here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

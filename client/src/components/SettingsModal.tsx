import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  Brain, 
  Github, 
  Mail, 
  Eye, 
  EyeOff, 
  Save, 
  Trash2, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keys, setKeys] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query key statuses
  const { data: openaiStatus, isLoading: openaiLoading } = useQuery({
    queryKey: ["/api/keys/openai"],
  });

  const { data: deepseekStatus, isLoading: deepseekLoading } = useQuery({
    queryKey: ["/api/keys/deepseek"],
  });

  const { data: githubStatus, isLoading: githubLoading } = useQuery({
    queryKey: ["/api/keys/github"],
  });

  const { data: gmailStatus, isLoading: gmailLoading } = useQuery({
    queryKey: ["/api/keys/gmail"],
  });

  // Mutations
  const saveKeyMutation = useMutation({
    mutationFn: ({ provider, key }: { provider: string; key: string }) =>
      api.keys.set(provider, key),
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `${variables.provider} API key saved successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/keys/${variables.provider}`] });
      setKeys(prev => ({ ...prev, [variables.provider]: "" }));
    },
    onError: (error, variables) => {
      toast({
        title: "Error",
        description: `Failed to save ${variables.provider} API key: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (provider: string) => api.keys.delete(provider),
    onSuccess: (_, provider) => {
      toast({
        title: "Success",
        description: `${provider} API key deleted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/keys/${provider}`] });
    },
    onError: (error, provider) => {
      toast({
        title: "Error",
        description: `Failed to delete ${provider} API key: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSaveKey = (provider: string) => {
    const key = keys[provider];
    if (!key || !key.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    saveKeyMutation.mutate({ provider, key: key.trim() });
  };

  const handleDeleteKey = (provider: string) => {
    deleteKeyMutation.mutate(provider);
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const getStatusIndicator = (status: any, isLoading: boolean) => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }
    
    if (status?.hasKey) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (status: any, isLoading: boolean) => {
    if (isLoading) return "Checking...";
    return status?.hasKey ? "Connected" : "Not Connected";
  };

  const getStatusColor = (status: any, isLoading: boolean) => {
    if (isLoading) return "text-gray-500";
    return status?.hasKey ? "text-green-600 dark:text-green-400" : "text-gray-500";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-pink-200 dark:border-violet-400/30 w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-pink-200 dark:border-violet-400/30">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading gradient-text">Settings</h2>
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your API keys and integrations
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs defaultValue="llm" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="llm" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  LLM Providers
                </TabsTrigger>
                <TabsTrigger value="github" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </TabsTrigger>
                <TabsTrigger value="gmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Gmail
                </TabsTrigger>
              </TabsList>

              <TabsContent value="llm" className="space-y-4">
                {/* OpenAI */}
                <div className="p-4 bg-gradient-to-r from-pink-50 to-violet-50 dark:from-violet-900/20 dark:to-pink-900/20 rounded-xl border border-pink-200 dark:border-violet-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-pink-500" />
                      <span className="font-semibold">OpenAI</span>
                      <div className="flex items-center gap-2">
                        {getStatusIndicator(openaiStatus, openaiLoading)}
                        <span className={`text-xs ${getStatusColor(openaiStatus, openaiLoading)}`}>
                          {getStatusText(openaiStatus, openaiLoading)}
                        </span>
                      </div>
                    </div>
                    {openaiStatus?.hasKey && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey("openai")}
                        disabled={deleteKeyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="openai-key">API Key</Label>
                      <div className="relative">
                        <Input
                          id="openai-key"
                          type={showKeys.openai ? "text" : "password"}
                          placeholder="sk-..."
                          value={keys.openai || ""}
                          onChange={(e) => setKeys(prev => ({ ...prev, openai: e.target.value }))}
                          className="pr-20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowKey("openai")}
                          >
                            {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveKey("openai")}
                            disabled={saveKeyMutation.isPending || !keys.openai?.trim()}
                          >
                            {saveKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DeepSeek */}
                <div className="p-4 bg-gradient-to-r from-pink-50 to-violet-50 dark:from-violet-900/20 dark:to-pink-900/20 rounded-xl border border-pink-200 dark:border-violet-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-violet-500" />
                      <span className="font-semibold">DeepSeek</span>
                      <div className="flex items-center gap-2">
                        {getStatusIndicator(deepseekStatus, deepseekLoading)}
                        <span className={`text-xs ${getStatusColor(deepseekStatus, deepseekLoading)}`}>
                          {getStatusText(deepseekStatus, deepseekLoading)}
                        </span>
                      </div>
                    </div>
                    {deepseekStatus?.hasKey && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey("deepseek")}
                        disabled={deleteKeyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="deepseek-key">API Key</Label>
                      <div className="relative">
                        <Input
                          id="deepseek-key"
                          type={showKeys.deepseek ? "text" : "password"}
                          placeholder="Enter DeepSeek API key..."
                          value={keys.deepseek || ""}
                          onChange={(e) => setKeys(prev => ({ ...prev, deepseek: e.target.value }))}
                          className="pr-20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowKey("deepseek")}
                          >
                            {showKeys.deepseek ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveKey("deepseek")}
                            disabled={saveKeyMutation.isPending || !keys.deepseek?.trim()}
                          >
                            {saveKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="github" className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">GitHub Personal Access Token</span>
                      <div className="flex items-center gap-2">
                        {getStatusIndicator(githubStatus, githubLoading)}
                        <span className={`text-xs ${getStatusColor(githubStatus, githubLoading)}`}>
                          {getStatusText(githubStatus, githubLoading)}
                        </span>
                      </div>
                    </div>
                    {githubStatus?.hasKey && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey("github")}
                        disabled={deleteKeyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="github-token">Personal Access Token</Label>
                      <div className="relative">
                        <Input
                          id="github-token"
                          type={showKeys.github ? "text" : "password"}
                          placeholder="ghp_..."
                          value={keys.github || ""}
                          onChange={(e) => setKeys(prev => ({ ...prev, github: e.target.value }))}
                          className="pr-20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowKey("github")}
                          >
                            {showKeys.github ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveKey("github")}
                            disabled={saveKeyMutation.isPending || !keys.github?.trim()}
                          >
                            {saveKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Required scopes: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">repo</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">user</code>
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gmail" className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-red-600" />
                      <span className="font-semibold">Gmail OAuth Credentials</span>
                      <div className="flex items-center gap-2">
                        {getStatusIndicator(gmailStatus, gmailLoading)}
                        <span className={`text-xs ${getStatusColor(gmailStatus, gmailLoading)}`}>
                          {getStatusText(gmailStatus, gmailLoading)}
                        </span>
                      </div>
                    </div>
                    {gmailStatus?.hasKey && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey("gmail")}
                        disabled={deleteKeyMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="gmail-credentials">OAuth JSON Credentials</Label>
                      <div className="relative">
                        <Input
                          id="gmail-credentials"
                          type={showKeys.gmail ? "text" : "password"}
                          placeholder="Paste Gmail OAuth credentials JSON..."
                          value={keys.gmail || ""}
                          onChange={(e) => setKeys(prev => ({ ...prev, gmail: e.target.value }))}
                          className="pr-20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowKey("gmail")}
                          >
                            {showKeys.gmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveKey("gmail")}
                            disabled={saveKeyMutation.isPending || !keys.gmail?.trim()}
                          >
                            {saveKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Get OAuth credentials from Google Cloud Console. Required scopes: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">gmail.send</code>
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

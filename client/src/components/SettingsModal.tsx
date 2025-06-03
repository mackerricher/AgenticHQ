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
  const { data: openaiStatus = { hasKey: false }, isLoading: openaiLoading } = useQuery({
    queryKey: ["/api/keys/openai"],
  });

  const { data: deepseekStatus = { hasKey: false }, isLoading: deepseekLoading } = useQuery({
    queryKey: ["/api/keys/deepseek"],
  });

  const { data: githubStatus = { hasKey: false }, isLoading: githubLoading } = useQuery({
    queryKey: ["/api/keys/github"],
  });

  const { data: gmailStatus = { hasKey: false }, isLoading: gmailLoading } = useQuery({
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

  const testConnectionMutation = useMutation({
    mutationFn: (provider: string) => api.keys.test(provider),
    onSuccess: (result, provider) => {
      toast({
        title: "Connection Test",
        description: result.success ? `${provider} connection successful` : `${provider} connection failed: ${result.error}`,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error, provider) => {
      toast({
        title: "Connection Test Failed",
        description: `Failed to test ${provider} connection: ${error.message}`,
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

  const getMaskedKey = (status: any, inputValue: string) => {
    if (status?.hasKey && status?.keyPreview && !inputValue) {
      return status.keyPreview + 'xxxxxxxxxxxxxx';
    }
    return inputValue;
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
          className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
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
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold">OpenAI</span>
                      <div className="flex items-center gap-2">
                        {getStatusIndicator(openaiStatus, openaiLoading)}
                        <span className={`text-xs ${getStatusColor(openaiStatus, openaiLoading)}`}>
                          {getStatusText(openaiStatus, openaiLoading)}
                        </span>
                      </div>
                    </div>
                    {openaiStatus?.hasKey && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnectionMutation.mutate("openai")}
                          disabled={testConnectionMutation.isPending}
                        >
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey("openai")}
                          disabled={deleteKeyMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="openai-key">API Key</Label>
                      <div className="relative">
                        <Input
                          id="openai-key"
                          type={showKeys.openai ? "text" : "password"}
                          placeholder={openaiStatus?.hasKey ? "" : "sk-..."}
                          value={getMaskedKey(openaiStatus, keys.openai || "")}
                          onChange={(e) => setKeys(prev => ({ ...prev, openai: e.target.value }))}
                          className="mb-3"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleShowKey("openai")}
                            className="flex-1"
                          >
                            {showKeys.openai ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            {showKeys.openai ? "Hide" : "Show"}
                          </Button>
                          <Button
                            onClick={() => handleSaveKey("openai")}
                            disabled={saveKeyMutation.isPending || !keys.openai?.trim()}
                            className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                          >
                            {saveKeyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DeepSeek */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold">DeepSeek</span>
                      <div className="flex items-center gap-2">
                        {getStatusIndicator(deepseekStatus, deepseekLoading)}
                        <span className={`text-xs ${getStatusColor(deepseekStatus, deepseekLoading)}`}>
                          {getStatusText(deepseekStatus, deepseekLoading)}
                        </span>
                      </div>
                    </div>
                    {deepseekStatus?.hasKey && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnectionMutation.mutate("deepseek")}
                          disabled={testConnectionMutation.isPending}
                        >
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey("deepseek")}
                          disabled={deleteKeyMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="deepseek-key">API Key</Label>
                      <div className="relative">
                        <Input
                          id="deepseek-key"
                          type={showKeys.deepseek ? "text" : "password"}
                          placeholder={deepseekStatus?.hasKey ? "" : "Enter DeepSeek API key..."}
                          value={getMaskedKey(deepseekStatus, keys.deepseek || "")}
                          onChange={(e) => setKeys(prev => ({ ...prev, deepseek: e.target.value }))}
                          className="mb-3"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleShowKey("deepseek")}
                            className="flex-1"
                          >
                            {showKeys.deepseek ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            {showKeys.deepseek ? "Hide" : "Show"}
                          </Button>
                          <Button
                            onClick={() => handleSaveKey("deepseek")}
                            disabled={saveKeyMutation.isPending || !keys.deepseek?.trim()}
                            className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                          >
                            {saveKeyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="github" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold">GitHub Personal Access Token</span>
                      <div className="flex items-center gap-2">
                        {getStatusIndicator(githubStatus, githubLoading)}
                        <span className={`text-xs ${getStatusColor(githubStatus, githubLoading)}`}>
                          {getStatusText(githubStatus, githubLoading)}
                        </span>
                      </div>
                    </div>
                    {githubStatus?.hasKey && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnectionMutation.mutate("github")}
                          disabled={testConnectionMutation.isPending}
                        >
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey("github")}
                          disabled={deleteKeyMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="github-token">Personal Access Token</Label>
                      <div className="relative">
                        <Input
                          id="github-token"
                          type={showKeys.github ? "text" : "password"}
                          placeholder={githubStatus?.hasKey ? "" : "ghp_..."}
                          value={getMaskedKey(githubStatus, keys.github || "")}
                          onChange={(e) => setKeys(prev => ({ ...prev, github: e.target.value }))}
                          className="mb-3"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleShowKey("github")}
                            className="flex-1"
                          >
                            {showKeys.github ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            {showKeys.github ? "Hide" : "Show"}
                          </Button>
                          <Button
                            onClick={() => handleSaveKey("github")}
                            disabled={saveKeyMutation.isPending || !keys.github?.trim()}
                            className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                          >
                            {saveKeyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
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
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold">Gmail SMTP</span>
                      <div className="flex items-center gap-2">
                        {getStatusIndicator(gmailStatus, gmailLoading)}
                        <span className={`text-xs ${getStatusColor(gmailStatus, gmailLoading)}`}>
                          {getStatusText(gmailStatus, gmailLoading)}
                        </span>
                      </div>
                    </div>
                    {gmailStatus?.hasKey && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnectionMutation.mutate("gmail")}
                          disabled={testConnectionMutation.isPending}
                        >
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey("gmail")}
                          disabled={deleteKeyMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="gmail-credentials">Gmail SMTP Configuration</Label>
                      <div className="relative">
                        <Input
                          id="gmail-credentials"
                          type={showKeys.gmail ? "text" : "password"}
                          placeholder={gmailStatus?.hasKey ? "" : '{"email": "your@gmail.com", "appPassword": "xxxx xxxx xxxx xxxx"}'}
                          value={getMaskedKey(gmailStatus, keys.gmail || "")}
                          onChange={(e) => setKeys(prev => ({ ...prev, gmail: e.target.value }))}
                          className="mb-3"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleShowKey("gmail")}
                            className="flex-1"
                          >
                            {showKeys.gmail ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            {showKeys.gmail ? "Hide" : "Show"}
                          </Button>
                          <Button
                            onClick={() => handleSaveKey("gmail")}
                            disabled={saveKeyMutation.isPending || !keys.gmail?.trim()}
                            className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                          >
                            {saveKeyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                      <p><strong>Setup Instructions:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Enable 2-Factor Authentication on your Gmail account</li>
                        <li>Go to Google Account Settings → Security → 2-Step Verification</li>
                        <li>Generate an App Password for "Mail"</li>
                        <li>Use the JSON format above with your email and 16-character app password</li>
                      </ol>
                    </div>
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

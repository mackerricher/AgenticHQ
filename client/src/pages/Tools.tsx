import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Wrench, FileText, Code, Settings } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  type: "local" | "api";
  category: string;
}

export default function Tools() {
  const [tools, setTools] = useState<Tool[]>([
    {
      id: "file-creator",
      name: "createMarkdown",
      description: "Create markdown files with given text content",
      type: "local",
      category: "File Operations"
    }
  ]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    type: "local" as "local" | "api",
    category: ""
  });

  const handleCreateTool = () => {
    if (!newTool.name.trim()) return;
    
    const tool: Tool = {
      id: `tool-${Date.now()}`,
      name: newTool.name,
      description: newTool.description,
      type: newTool.type,
      category: newTool.category || "Custom"
    };
    
    setTools([...tools, tool]);
    setNewTool({ name: "", description: "", type: "local", category: "" });
    setIsCreateModalOpen(false);
  };

  const getToolIcon = (type: string) => {
    switch (type) {
      case "local":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "api":
        return <Code className="h-5 w-5 text-blue-500" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-500" />;
    }
  };

  const groupedTools = tools.reduce((acc, tool) => {
    const category = tool.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-blue-200 to-violet-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      <div className="glitter-overlay fixed inset-0 pointer-events-none"></div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading gradient-text mb-2">Tools</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage individual tools that can be attached to agents and sub-agents
              </p>
            </div>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tool
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-900 border border-pink-200 dark:border-violet-400/30">
                <DialogHeader>
                  <DialogTitle className="gradient-text">Add New Tool</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Tool Name</Label>
                    <Input
                      id="name"
                      value={newTool.name}
                      onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., processImage, sendSlackMessage"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTool.description}
                      onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this tool does"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newTool.category}
                      onChange={(e) => setNewTool(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., File Operations, API Calls, Data Processing"
                    />
                  </div>
                  
                  <div>
                    <Label>Type</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={newTool.type === "local" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewTool(prev => ({ ...prev, type: "local" }))}
                        className="flex-1"
                      >
                        <FileText className="h-3 w-3 mr-2" />
                        Local Function
                      </Button>
                      <Button
                        variant={newTool.type === "api" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewTool(prev => ({ ...prev, type: "api" }))}
                        className="flex-1"
                      >
                        <Code className="h-3 w-3 mr-2" />
                        API Call
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-400/30">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Note: This is a mock interface. Tool creation functionality will be implemented in a future update.
                    </p>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleCreateTool}
                      disabled={!newTool.name.trim()}
                      className="flex-1 bg-gradient-to-r from-pink-400 to-violet-400"
                    >
                      Add Tool
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedTools).map(([category, categoryTools]) => (
              <div key={category}>
                <h2 className="text-xl font-heading text-gray-800 dark:text-gray-200 mb-4">
                  {category}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTools.map((tool) => (
                    <Card 
                      key={tool.id}
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-pink-200 dark:border-violet-400/30 hover:scale-105 transition-transform duration-200"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {getToolIcon(tool.type)}
                          <div>
                            <CardTitle className="text-lg">{tool.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={tool.type === "local" ? "secondary" : "default"} className="text-xs">
                                {tool.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tool.description}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
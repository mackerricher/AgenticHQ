import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        return <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      case "api":
        return <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Tools</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage individual tools that can be attached to agents and sub-agents
            </p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Add New Tool</DialogTitle>
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
                  <Label htmlFor="type">Tool Type</Label>
                  <Select 
                    value={newTool.type} 
                    onValueChange={(value: "local" | "api") => setNewTool(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tool type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Tool</SelectItem>
                      <SelectItem value="api">API Tool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newTool.category}
                    onChange={(e) => setNewTool(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., File Operations, Communications"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateTool}
                    className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
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
          {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTools.map((tool) => (
                  <Card 
                    key={tool.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {getToolIcon(tool.type)}
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={tool.type === "local" ? "default" : "secondary"} className="text-xs">
                          {tool.type === "local" ? "Local" : "API"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Delete
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
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Wrench, Package, Settings } from "lucide-react";

interface SubAgent {
  id: string;
  name: string;
  description: string;
  tools: string[];
}

export default function SubAgents() {
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSubAgent, setNewSubAgent] = useState({
    name: "",
    description: "",
    tools: [] as string[]
  });

  const availableTools = ["createMarkdown"];

  const handleCreateSubAgent = () => {
    if (!newSubAgent.name.trim()) return;
    
    const subAgent: SubAgent = {
      id: `subagent-${Date.now()}`,
      name: newSubAgent.name,
      description: newSubAgent.description,
      tools: [...newSubAgent.tools]
    };
    
    setSubAgents([...subAgents, subAgent]);
    setNewSubAgent({ name: "", description: "", tools: [] });
    setIsCreateModalOpen(false);
  };

  const toggleTool = (toolName: string) => {
    setNewSubAgent(prev => ({
      ...prev,
      tools: prev.tools.includes(toolName)
        ? prev.tools.filter(t => t !== toolName)
        : [...prev.tools, toolName]
    }));
  };

  const attachToolToSubAgent = (subAgentId: string, toolName: string) => {
    setSubAgents(prev => prev.map(sa => 
      sa.id === subAgentId
        ? { ...sa, tools: sa.tools.includes(toolName) ? sa.tools : [...sa.tools, toolName] }
        : sa
    ));
  };

  const detachToolFromSubAgent = (subAgentId: string, toolName: string) => {
    setSubAgents(prev => prev.map(sa => 
      sa.id === subAgentId
        ? { ...sa, tools: sa.tools.filter(t => t !== toolName) }
        : sa
    ));
  };

  return (
    <div className="flex-1 p-6 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Sub-Agents</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Create reusable sub-agents that can be attached to multiple agents
              </p>
            </div>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sub-Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-900 border border-pink-200 dark:border-violet-400/30">
                <DialogHeader>
                  <DialogTitle className="gradient-text">Create New Sub-Agent</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newSubAgent.name}
                      onChange={(e) => setNewSubAgent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter sub-agent name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSubAgent.description}
                      onChange={(e) => setNewSubAgent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this sub-agent does"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Available Tools</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableTools.map((tool) => (
                        <Button
                          key={tool}
                          variant={newSubAgent.tools.includes(tool) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTool(tool)}
                          className="justify-start"
                        >
                          <Wrench className="h-3 w-3 mr-2" />
                          {tool}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleCreateSubAgent}
                      disabled={!newSubAgent.name.trim()}
                      className="flex-1 bg-gradient-to-r from-pink-400 to-violet-400"
                    >
                      Create
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

          {subAgents.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-heading text-gray-600 dark:text-gray-300 mb-2">
                No Sub-Agents Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first sub-agent to get started with modular workflows
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-pink-400 to-violet-400 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Sub-Agent
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subAgents.map((subAgent) => (
                <Card 
                  key={subAgent.id}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-pink-200 dark:border-violet-400/30 hover:scale-105 transition-transform duration-200"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-pink-500" />
                      <div>
                        <CardTitle className="text-lg">{subAgent.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subAgent.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Wrench className="h-3 w-3" />
                        Tools ({subAgent.tools.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {subAgent.tools.map((tool) => (
                          <Badge 
                            key={tool} 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                            onClick={() => detachToolFromSubAgent(subAgent.id, tool)}
                          >
                            {tool} ×
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Available tools to attach:</p>
                        <div className="flex flex-wrap gap-1">
                          {availableTools
                            .filter(tool => !subAgent.tools.includes(tool))
                            .map((tool) => (
                              <Badge 
                                key={tool}
                                variant="outline" 
                                className="text-xs cursor-pointer hover:bg-green-100 dark:hover:bg-green-900"
                                onClick={() => attachToolToSubAgent(subAgent.id, tool)}
                              >
                                + {tool}
                              </Badge>
                            ))
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
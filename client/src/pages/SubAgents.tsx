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

  const availableTools = ["createMarkdown", "createRepo", "addFile", "sendEmail"];

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

  return (
    <div className="p-6">
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
            <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Create New Sub-Agent</DialogTitle>
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
                    className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    Create Sub-Agent
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
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Sub-Agents Created</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sub-agents are reusable components that can be attached to multiple agents.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subAgents.map((subAgent) => (
              <Card 
                key={subAgent.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <CardTitle className="text-lg">{subAgent.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subAgent.description}
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
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
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
        )}
      </div>
    </div>
  );
}
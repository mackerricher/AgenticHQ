import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Bot, Settings, Check } from "lucide-react";

interface Client {
  id: string;
  name: string;
  description: string;
  agents: string[];
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    description: "",
    agents: [] as string[]
  });

  const availableAgents = [
    { id: "github-agent", name: "GitHub Agent", description: "Repository management" },
    { id: "gmail-agent", name: "Gmail Agent", description: "Email automation" }
  ];

  const handleCreateClient = () => {
    if (!newClient.name.trim()) return;
    
    const client: Client = {
      id: `client-${Date.now()}`,
      name: newClient.name,
      description: newClient.description,
      agents: [...newClient.agents]
    };
    
    setClients([...clients, client]);
    setNewClient({ name: "", description: "", agents: [] });
    setIsCreateModalOpen(false);
  };

  const toggleAgent = (agentId: string) => {
    setNewClient(prev => ({
      ...prev,
      agents: prev.agents.includes(agentId)
        ? prev.agents.filter(a => a !== agentId)
        : [...prev.agents, agentId]
    }));
  };

  const getAgentDetails = (agentId: string) => {
    return availableAgents.find(a => a.id === agentId);
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Clients</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create AI clients by combining agents for specific workflows
            </p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                Create Client
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Create New Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Development Assistant, Marketing Bot"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newClient.description}
                    onChange={(e) => setNewClient(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this client will do"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Available Agents</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {availableAgents.map((agent) => (
                      <Button
                        key={agent.id}
                        variant={newClient.agents.includes(agent.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAgent(agent.id)}
                        className="justify-start p-3 h-auto"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Bot className="h-4 w-4" />
                          <div className="text-left">
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.description}</div>
                          </div>
                          {newClient.agents.includes(agent.id) && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateClient}
                    className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    Create Client
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

        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Clients Created</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Clients combine multiple agents to create powerful AI workflows for specific use cases.
            </p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Client
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card 
                key={client.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {client.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Bot className="h-3 w-3" />
                      Agents ({client.agents.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {client.agents.map((agentId) => {
                        const agent = getAgentDetails(agentId);
                        return (
                          <Badge key={agentId} variant="secondary" className="text-xs">
                            {agent?.name || agentId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Deploy
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
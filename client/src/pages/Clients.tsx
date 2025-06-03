import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Bot, Users, Github, Mail, MessageCircle, Settings } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SettingsModal from "@/components/SettingsModal";

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
    { id: "github-agent", name: "GitHub Agent", icon: Github },
    { id: "gmail-agent", name: "Gmail Agent", icon: Mail }
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

  const attachAgentToClient = (clientId: string, agentId: string) => {
    setClients(prev => prev.map(c => 
      c.id === clientId
        ? { ...c, agents: c.agents.includes(agentId) ? c.agents : [...c.agents, agentId] }
        : c
    ));
  };

  const detachAgentFromClient = (clientId: string, agentId: string) => {
    setClients(prev => prev.map(c => 
      c.id === clientId
        ? { ...c, agents: c.agents.filter(a => a !== agentId) }
        : c
    ));
  };

  const getAgentDetails = (agentId: string) => {
    return availableAgents.find(a => a.id === agentId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-blue-200 to-violet-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      <div className="glitter-overlay fixed inset-0 pointer-events-none"></div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading gradient-text mb-2">Clients</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Create AI clients by combining agents for specific workflows
              </p>
            </div>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Client
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-900 border border-pink-200 dark:border-violet-400/30">
                <DialogHeader>
                  <DialogTitle className="gradient-text">Create New Client</DialogTitle>
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
                      placeholder="Describe what this client will help with"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Attach Agents</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {availableAgents.map((agent) => {
                        const IconComponent = agent.icon;
                        return (
                          <Button
                            key={agent.id}
                            variant={newClient.agents.includes(agent.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleAgent(agent.id)}
                            className="justify-start"
                          >
                            <IconComponent className="h-3 w-3 mr-2" />
                            {agent.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleCreateClient}
                      disabled={!newClient.name.trim()}
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

          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-heading text-gray-600 dark:text-gray-300 mb-2">
                No Clients Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first AI client to start building automated workflows
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-pink-400 to-violet-400 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Client
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card 
                  key={client.id}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-pink-200 dark:border-violet-400/30 hover:scale-105 transition-transform duration-200"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Bot className="h-5 w-5 text-pink-500" />
                      <div>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {client.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Agents ({client.agents.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {client.agents.map((agentId) => {
                          const agent = getAgentDetails(agentId);
                          const IconComponent = agent?.icon || Users;
                          return (
                            <Badge 
                              key={agentId} 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 flex items-center gap-1"
                              onClick={() => detachAgentFromClient(client.id, agentId)}
                            >
                              <IconComponent className="h-2 w-2" />
                              {agent?.name || agentId} ×
                            </Badge>
                          );
                        })}
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Available agents to attach:</p>
                        <div className="flex flex-wrap gap-1">
                          {availableAgents
                            .filter(agent => !client.agents.includes(agent.id))
                            .map((agent) => {
                              const IconComponent = agent.icon;
                              return (
                                <Badge 
                                  key={agent.id}
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 flex items-center gap-1"
                                  onClick={() => attachAgentToClient(client.id, agent.id)}
                                >
                                  <IconComponent className="h-2 w-2" />
                                  + {agent.name}
                                </Badge>
                              );
                            })
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {client.agents.length > 0 && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-pink-400 to-violet-400"
                          onClick={() => window.location.href = '/'}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Chat
                        </Button>
                      )}
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
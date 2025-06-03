import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, Trash2, Loader2, Settings, MessageCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertClientSchema, type Client, type Agent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const createClientFormSchema = insertClientSchema.extend({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

type CreateClientForm = z.infer<typeof createClientFormSchema>;

export default function Clients() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: availableAgents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: CreateClientForm) => {
      const clientData = {
        ...data,
        agents: selectedAgents,
      };
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });
      if (!response.ok) throw new Error("Failed to create client");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsCreateModalOpen(false);
      form.reset();
      setSelectedAgents([]);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateClientForm }) => {
      const clientData = {
        ...data,
        agents: selectedAgents,
      };
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });
      if (!response.ok) throw new Error("Failed to update client");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsEditModalOpen(false);
      setEditingClient(null);
      editForm.reset();
      setSelectedAgents([]);
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete client");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateClientForm>({
    resolver: zodResolver(createClientFormSchema),
    defaultValues: {
      name: "",
      description: "",
      agents: [],
    },
  });

  const editForm = useForm<CreateClientForm>({
    resolver: zodResolver(createClientFormSchema),
    defaultValues: {
      name: "",
      description: "",
      agents: [],
    },
  });

  const onSubmit = (data: CreateClientForm) => {
    createClientMutation.mutate(data);
  };

  const onEditSubmit = (data: CreateClientForm) => {
    if (!editingClient) return;
    updateClientMutation.mutate({ id: editingClient.id, data });
  };

  const toggleAgent = (agentId: number) => {
    setSelectedAgents(prev =>
      prev.includes(agentId.toString())
        ? prev.filter(id => id !== agentId.toString())
        : [...prev, agentId.toString()]
    );
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setSelectedAgents(Array.isArray(client.agents) ? client.agents : []);
    editForm.reset({
      name: client.name,
      description: client.description,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleChatWithClient = (client: Client) => {
    // Navigate to chat with client ID as parameter
    setLocation(`/chat/${client.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Client</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 block">Client Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter client name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 block">Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe what this client does" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Available Agents</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {availableAgents.map((agent) => (
                        <Button
                          key={agent.id}
                          type="button"
                          variant={selectedAgents.includes(agent.id.toString()) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAgent(agent.id)}
                          className="justify-start h-auto p-3"
                        >
                          <div className="text-left">
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-xs opacity-70">{agent.description.length > 23 ? agent.description.substring(0, 23) + '...' : agent.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createClientMutation.isPending}
                      className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                    >
                      {createClientMutation.isPending ? "Creating..." : "Create Client"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Client Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Client</DialogTitle>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6 py-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 block">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter client name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 block">Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe what this client does" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <h3 className="text-sm font-medium mb-3">Available Agents</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {availableAgents.map((agent) => (
                        <Button
                          key={agent.id}
                          type="button"
                          variant={selectedAgents.includes(agent.id.toString()) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAgent(agent.id)}
                          className="justify-start h-auto p-3"
                        >
                          <div className="text-left">
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-xs opacity-70">{agent.description.length > 23 ? agent.description.substring(0, 23) + '...' : agent.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateClientMutation.isPending}
                      className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                    >
                      {updateClientMutation.isPending ? "Updating..." : "Update Client"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No clients yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Get started by creating your first AI client using the button above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {clients.map((client) => (
              <Card key={client.id} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {client.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChatWithClient(client)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClient(client)}
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {client.description}
                  </p>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agents:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Array.isArray(client.agents) && client.agents.length > 0 ? (
                        client.agents.map((agentId, index) => {
                          const agent = availableAgents?.find(a => a.id === parseInt(agentId));
                          return (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {agent?.name || `Agent ${agentId}`}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No agents assigned</span>
                      )}
                    </div>
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
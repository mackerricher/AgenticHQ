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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Github, Mail, Wrench, Users, Trash2, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { insertAgentSchema, type Agent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const createAgentFormSchema = insertAgentSchema.extend({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Type is required"),
});

type CreateAgentForm = z.infer<typeof createAgentFormSchema>;

export default function Agents() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: CreateAgentForm) => {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create agent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      setIsCreateModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Agent created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive",
      });
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/agents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete agent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete agent",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateAgentForm>({
    resolver: zodResolver(createAgentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      tools: [],
      subAgents: [],
      type: "",
    },
  });

  const onSubmit = (data: CreateAgentForm) => {
    createAgentMutation.mutate(data);
  };

  const handleDeleteAgent = (id: number) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      deleteAgentMutation.mutate(id);
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "github":
        return <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      case "gmail":
        return <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Wrench className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Agents</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create and manage AI agents for automated workflows
            </p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter agent name" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe what this agent does" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select agent type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="github">GitHub Agent</SelectItem>
                            <SelectItem value="gmail">Gmail Agent</SelectItem>
                            <SelectItem value="custom">Custom Agent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      disabled={createAgentMutation.isPending}
                      className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                    >
                      {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {agents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No agents yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Get started by creating your first AI agent using the button above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getAgentIcon(agent.type)}
                      <div>
                        <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {agent.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {agent.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {agent.description}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tools:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(agent.tools) && agent.tools.length > 0 ? (
                          agent.tools.map((tool, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">No tools assigned</span>
                        )}
                      </div>
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
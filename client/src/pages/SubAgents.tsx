import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Wrench, Package, Trash2, Loader2, Edit } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { insertSubAgentSchema, type SubAgent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const createSubAgentFormSchema = insertSubAgentSchema.extend({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

type CreateSubAgentForm = z.infer<typeof createSubAgentFormSchema>;

export default function SubAgents() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubAgent, setEditingSubAgent] = useState<SubAgent | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const { toast } = useToast();

  const availableTools = ["createMarkdown", "createRepo", "addFile", "sendEmail"];

  const { data: subAgents = [], isLoading } = useQuery<SubAgent[]>({
    queryKey: ["/api/subagents"],
  });

  const createSubAgentMutation = useMutation({
    mutationFn: async (data: CreateSubAgentForm) => {
      const response = await fetch("/api/subagents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create sub-agent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subagents"] });
      setIsCreateModalOpen(false);
      form.reset();
      setSelectedTools([]);
      toast({
        title: "Success",
        description: "Sub-agent created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sub-agent",
        variant: "destructive",
      });
    },
  });

  const updateSubAgentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateSubAgentForm }) => {
      const response = await fetch(`/api/subagents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update sub-agent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subagents"] });
      setIsEditModalOpen(false);
      setEditingSubAgent(null);
      editForm.reset();
      setSelectedTools([]);
      toast({
        title: "Success",
        description: "Sub-agent updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sub-agent",
        variant: "destructive",
      });
    },
  });

  const deleteSubAgentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/subagents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete sub-agent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subagents"] });
      toast({
        title: "Success",
        description: "Sub-agent deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sub-agent",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateSubAgentForm>({
    resolver: zodResolver(createSubAgentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      tools: [],
    },
  });

  const editForm = useForm<CreateSubAgentForm>({
    resolver: zodResolver(createSubAgentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      tools: [],
    },
  });

  const onSubmit = (data: CreateSubAgentForm) => {
    const subAgentData = {
      ...data,
      tools: selectedTools,
    };
    createSubAgentMutation.mutate(subAgentData);
  };

  const onEditSubmit = (data: CreateSubAgentForm) => {
    if (!editingSubAgent) return;
    const subAgentData = {
      ...data,
      tools: selectedTools,
    };
    updateSubAgentMutation.mutate({ id: editingSubAgent.id, data: subAgentData });
  };

  const toggleTool = (toolName: string) => {
    setSelectedTools(prev =>
      prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName]
    );
  };

  const handleEditSubAgent = (subAgent: SubAgent) => {
    setEditingSubAgent(subAgent);
    editForm.reset({
      name: subAgent.name,
      description: subAgent.description,
      tools: Array.isArray(subAgent.tools) ? subAgent.tools : [],
    });
    setSelectedTools(Array.isArray(subAgent.tools) ? subAgent.tools : []);
    setIsEditModalOpen(true);
  };

  const handleDeleteSubAgent = (id: number) => {
    if (confirm("Are you sure you want to delete this sub-agent?")) {
      deleteSubAgentMutation.mutate(id);
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 block">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter sub-agent name" {...field} />
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
                          <Textarea placeholder="Describe what this sub-agent does" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <Label className="mb-2 block">Available Tools</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableTools.map((tool) => (
                        <Button
                          key={tool}
                          type="button"
                          variant={selectedTools.includes(tool) ? "default" : "outline"}
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
                      type="submit"
                      disabled={createSubAgentMutation.isPending}
                      className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                      {createSubAgentMutation.isPending ? "Creating..." : "Create Sub-Agent"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {subAgents.map((subAgent) => (
              <Card 
                key={subAgent.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <CardTitle className="text-lg">{subAgent.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subAgent.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubAgent(subAgent.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Wrench className="h-3 w-3" />
                      Tools ({Array.isArray(subAgent.tools) ? subAgent.tools.length : 0})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(subAgent.tools) && subAgent.tools.length > 0 ? (
                        subAgent.tools.map((tool, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No tools assigned</span>
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
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Github, Mail, Wrench, Users } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  tools: string[];
  subAgents: string[];
  type: "github" | "gmail";
}

export default function Agents() {
  const [agents] = useState<Agent[]>([
    {
      id: "github-agent",
      name: "GitHub Agent",
      description: "Create repositories and manage files on GitHub",
      tools: ["createRepo", "addFile"],
      subAgents: [],
      type: "github"
    },
    {
      id: "gmail-agent", 
      name: "Gmail Agent",
      description: "Send emails via Gmail API",
      tools: ["sendEmail"],
      subAgents: [],
      type: "gmail"
    }
  ]);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "github":
        return <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      case "gmail":
        return <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      default:
        return <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 p-6 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Agents</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your workflow agents that combine tools and sub-agents
            </p>
          </div>
          <Button 
            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card 
              key={agent.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getAgentIcon(agent.type)}
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {agent.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Wrench className="h-3 w-3" />
                    Tools ({agent.tools.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Sub-Agents ({agent.subAgents.length})
                  </h4>
                  {agent.subAgents.length === 0 ? (
                    <p className="text-xs text-gray-500">No sub-agents attached</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {agent.subAgents.map((subAgent) => (
                        <Badge key={subAgent} variant="outline" className="text-xs">
                          {subAgent}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Attach
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
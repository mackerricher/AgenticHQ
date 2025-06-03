import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Code, Wrench } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  type: "local" | "api";
  category: string;
}

export default function Tools() {
  const tools: Tool[] = [
    {
      id: "file-creator",
      name: "createMarkdown",
      description: "Create markdown files with given text content",
      type: "local",
      category: "File Operations"
    },
    {
      id: "github-create-repo",
      name: "createRepo",
      description: "Create a new GitHub repository",
      type: "api",
      category: "GitHub Operations"
    },
    {
      id: "github-add-file",
      name: "addFile",
      description: "Add files to a GitHub repository",
      type: "api",
      category: "GitHub Operations"
    },
    {
      id: "gmail-send-email",
      name: "sendEmail",
      description: "Send emails through Gmail",
      type: "api",
      category: "Email Operations"
    }
  ];

  const getToolIcon = (type: string) => {
    switch (type) {
      case "local":
        return <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "api":
        return <Code className="h-5 w-5 text-green-600 dark:text-green-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
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
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Tools</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Available tools for AI agent workflows
          </p>
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
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant={tool.type === "local" ? "default" : "secondary"} className="text-xs">
                          {tool.type === "local" ? "Local" : "API"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
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
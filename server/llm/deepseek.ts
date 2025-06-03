import OpenAI from "openai";
import { secretService } from "../secretService";
import { PlanStep } from "@shared/schema";

export class DeepSeekService {
  private client: OpenAI | null = null;

  private async getClient(): Promise<OpenAI> {
    if (!this.client) {
      const apiKey = await secretService.getKey("deepseek");
      if (!apiKey) {
        throw new Error("DeepSeek API key not configured");
      }
      this.client = new OpenAI({ 
        apiKey,
        baseURL: "https://api.deepseek.com"
      });
    }
    return this.client;
  }

  async generatePlan(userMessage: string, availableTools: string[]): Promise<PlanStep[]> {
    const client = await this.getClient();
    
    const systemPrompt = `You are an AI assistant that creates executable plans from user requests. 
    
Available tools:
${availableTools.map(tool => `- ${tool}`).join('\n')}

Analyze the user's request. If it can be accomplished using the available tools, create a JSON plan with steps. If it's a general question, creative request, or doesn't require tools, return an empty steps array.

For tool-based requests, create steps with:
- tool: the tool name (e.g., "GitHub.createRepo", "FileCreator.createMarkdown")
- args: object with the arguments for the tool

CRITICAL: When using FileCreator.createMarkdown, the 'contents' parameter must contain the actual detailed content that answers the user's request, not just a title or basic description. 

For any documentation request:
- Generate complete, practical content that fulfills the user's specific needs
- Include relevant details, instructions, examples, and explanations
- Write the actual content the user is asking for, not placeholder text

Example plan format:
{
  "steps": [
    { "tool": "GitHub.createRepo", "args": { "name": "MyProject", "description": "A new project" } },
    { "tool": "FileCreator.createMarkdown", "args": { "filename": "README.md", "contents": "# MyProject\\n\\nA comprehensive description of this project and its purpose.\\n\\n## Installation\\n\\n1. First, install Node.js:\\n   \`\`\`bash\\n   brew install node\\n   \`\`\`\\n\\n2. Clone this repository:\\n   \`\`\`bash\\n   git clone https://github.com/user/MyProject.git\\n   cd MyProject\\n   \`\`\`\\n\\n3. Install dependencies:\\n   \`\`\`bash\\n   npm install\\n   \`\`\`\\n\\n## Usage\\n\\nRun the application:\\n\\n\`\`\`bash\\nnpm start\\n\`\`\`\\n\\n## Features\\n\\n- Feature 1: Description\\n- Feature 2: Description\\n- Feature 3: Description" } },
    { "tool": "GitHub.addFile", "args": { "repo": "MyProject", "path": "README.md", "contentRef": 2 } }
  ]
}

For general questions, poetry, explanations, or conversations, return:
{
  "steps": []
}

Respond only with valid JSON.`;

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.steps || [];
  }

  async generateDirectResponse(userMessage: string): Promise<string> {
    const client = await this.getClient();
    
    const systemPrompt = `You are a helpful AI assistant. Respond naturally and conversationally to the user's request. Be creative, informative, and engaging.`;

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm here to help! Please let me know what you need.";
  }

  async generateResponse(userMessage: string, planResult: any): Promise<string> {
    const client = await this.getClient();
    
    const systemPrompt = `You are a helpful AI assistant. The user made a request and a plan was executed. 
    Provide a friendly, conversational response about what was accomplished.
    Be specific about what was done and encourage the user to try more workflows.`;

    const userPrompt = `User request: "${userMessage}"
    
Plan execution result: ${JSON.stringify(planResult, null, 2)}

Provide a friendly response about what was accomplished.`;

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Plan executed successfully!";
  }
}

export const deepseekService = new DeepSeekService();
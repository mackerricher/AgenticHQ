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

Create a JSON plan with steps that use these tools. Each step should have:
- tool: the tool name (e.g., "GitHub.createRepo", "FileCreator.createMarkdown")
- args: object with the arguments for the tool

Example plan format:
{
  "steps": [
    { "tool": "GitHub.createRepo", "args": { "name": "MyProject", "description": "A new project" } },
    { "tool": "FileCreator.createMarkdown", "args": { "text": "# MyProject\\nThis is my project." } },
    { "tool": "GitHub.addFile", "args": { "repo": "MyProject", "path": "README.md", "contentRef": 1 } }
  ]
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
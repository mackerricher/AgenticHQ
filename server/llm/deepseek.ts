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

IMPORTANT: When creating documentation files (README, installation guides, tutorials), provide comprehensive, detailed, and practical content that fully addresses the user's request. Include step-by-step instructions, commands, code examples, and explanations.

For installation guides, include:
- Multiple installation methods (homebrew, direct download, version managers)
- Prerequisites and system requirements
- Step-by-step commands with code blocks
- Verification steps to confirm installation
- Troubleshooting common issues
- Next steps or usage examples

Example plan format:
{
  "steps": [
    { "tool": "GitHub.createRepo", "args": { "name": "MyProject", "description": "A new project" } },
    { "tool": "FileCreator.createMarkdown", "args": { "filename": "README.md", "contents": "# NodeJS Installation Guide for Mac\\n\\nThis guide provides multiple methods to install Node.js on macOS.\\n\\n## Prerequisites\\n\\n- macOS 10.15 or later\\n- Administrative access to your Mac\\n\\n## Method 1: Using Homebrew (Recommended)\\n\\n1. Install Homebrew if you haven't already:\\n   \`\`\`bash\\n   /bin/bash -c \\"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\\"\\n   \`\`\`\\n\\n2. Install Node.js:\\n   \`\`\`bash\\n   brew install node\\n   \`\`\`\\n\\n3. Verify installation:\\n   \`\`\`bash\\n   node --version\\n   npm --version\\n   \`\`\`\\n\\n## Method 2: Using Node Version Manager (nvm)\\n\\n1. Install nvm:\\n   \`\`\`bash\\n   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\\n   \`\`\`\\n\\n2. Restart your terminal or run:\\n   \`\`\`bash\\n   source ~/.bashrc\\n   \`\`\`\\n\\n3. Install the latest LTS version:\\n   \`\`\`bash\\n   nvm install --lts\\n   nvm use --lts\\n   \`\`\`\\n\\n## Method 3: Direct Download\\n\\n1. Visit [nodejs.org](https://nodejs.org/)\\n2. Download the macOS installer\\n3. Run the .pkg file and follow the installation wizard\\n\\n## Verification\\n\\nRun these commands to confirm successful installation:\\n\\n\`\`\`bash\\nnode --version\\nnpm --version\\n\`\`\`\\n\\n## Troubleshooting\\n\\n- **Permission errors**: Use \`sudo\` prefix for global npm installs\\n- **PATH issues**: Restart terminal or add Node.js to your PATH\\n- **Version conflicts**: Use nvm to manage multiple Node.js versions\\n\\n## Next Steps\\n\\n- Create your first Node.js project: \`mkdir my-project && cd my-project && npm init -y\`\\n- Install packages: \`npm install express\`\\n- Run JavaScript files: \`node app.js\`" } },
    { "tool": "GitHub.addFile", "args": { "repo": "MyProject", "path": "README.md", "contentRef": 1 } }
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
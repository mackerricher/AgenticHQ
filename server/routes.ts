import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { secretService } from "./secretService";
import { deepseekService } from "./llm/deepseek";
import { planRunner } from "./planRunner";
import { insertChatMessageSchema, insertPlanSchema } from "@shared/schema";
import { z } from "zod";

// Test connection functions
async function testOpenAIConnection(apiKey: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    return response.ok ? { success: true } : { success: false, error: "Invalid API key" };
  } catch (error) {
    return { success: false, error: "Connection failed" };
  }
}

async function testDeepSeekConnection(apiKey: string) {
  try {
    const response = await fetch("https://api.deepseek.com/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    return response.ok ? { success: true } : { success: false, error: "Invalid API key" };
  } catch (error) {
    return { success: false, error: "Connection failed" };
  }
}

async function testGitHubConnection(apiKey: string) {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: { "Authorization": `token ${apiKey}` }
    });
    return response.ok ? { success: true } : { success: false, error: "Invalid token" };
  } catch (error) {
    return { success: false, error: "Connection failed" };
  }
}

async function testGmailConnection(credentials: string) {
  try {
    const nodemailer = await import("nodemailer");
    const gmailConfig = JSON.parse(credentials);
    
    if (!gmailConfig.email || !gmailConfig.appPassword) {
      return { success: false, error: "Missing email or appPassword fields" };
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailConfig.email,
        pass: gmailConfig.appPassword
      }
    });

    // Verify SMTP connection
    await transporter.verify();
    
    return { success: true };
  } catch (error) {
    let errorMessage = "Failed to connect to Gmail SMTP";
    if (error instanceof Error) {
      if (error.message.includes("Invalid login")) {
        errorMessage = "Invalid email or app password";
      } else if (error.message.includes("Authentication failed")) {
        errorMessage = "Authentication failed - ensure 2FA is enabled and using app password";
      } else {
        errorMessage = error.message;
      }
    }
    return { success: false, error: errorMessage };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { userMessage } = req.body;
      
      if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({ error: "User message is required" });
      }

      // Save user message
      await storage.createChatMessage({
        role: "user",
        content: userMessage,
      });

      // Generate plan
      const availableTools = planRunner.getAllAvailableTools();
      const planSteps = await deepseekService.generatePlan(userMessage, availableTools);
      
      if (planSteps.length === 0) {
        const assistantMessage = "I understand your request, but I'm not sure how to create a plan for that. Could you try rephrasing or asking for something specific like creating a repository or sending an email?";
        
        await storage.createChatMessage({
          role: "assistant",
          content: assistantMessage,
        });

        return res.json({ assistantMessage });
      }

      // Create plan in database
      const plan = await storage.createPlan({
        steps: planSteps,
        status: "pending",
        currentStep: 0,
      });

      // Execute plan asynchronously
      setImmediate(() => {
        planRunner.executePlan(plan.id, planSteps).catch(console.error);
      });

      // Generate initial response
      const assistantMessage = `Perfect! I've created a plan to help you with that. I'll execute ${planSteps.length} steps to complete your request. You can watch the progress in the timeline.`;
      
      await storage.createChatMessage({
        role: "assistant",
        content: assistantMessage,
      });

      res.json({ 
        assistantMessage,
        planId: plan.id,
        steps: planSteps,
      });
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Get chat history
  app.get("/api/chat/history", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Clear chat history
  app.delete("/api/chat/history", async (req, res) => {
    try {
      await storage.clearChatMessages();
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing chat history:", error);
      res.status(500).json({ error: "Failed to clear chat history" });
    }
  });

  // Get plan status
  app.get("/api/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      const executions = await storage.getPlanExecutions(planId);
      
      res.json({
        ...plan,
        executions,
      });
    } catch (error) {
      console.error("Error fetching plan:", error);
      res.status(500).json({ error: "Failed to fetch plan" });
    }
  });

  // Server-Sent Events for plan progress
  app.get("/api/plans/:id/events", (req, res) => {
    const planId = parseInt(req.params.id);
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const handlePlanEvent = (eventData: any) => {
      if (eventData.planId === planId) {
        sendEvent('planUpdate', eventData);
      }
    };

    const handleStepEvent = (eventData: any) => {
      if (eventData.planId === planId) {
        sendEvent('stepUpdate', eventData);
      }
    };

    planRunner.on('planStart', handlePlanEvent);
    planRunner.on('planComplete', handlePlanEvent);
    planRunner.on('planError', handlePlanEvent);
    planRunner.on('stepStart', handleStepEvent);
    planRunner.on('stepComplete', handleStepEvent);
    planRunner.on('stepError', handleStepEvent);

    req.on('close', () => {
      planRunner.off('planStart', handlePlanEvent);
      planRunner.off('planComplete', handlePlanEvent);
      planRunner.off('planError', handlePlanEvent);
      planRunner.off('stepStart', handleStepEvent);
      planRunner.off('stepComplete', handleStepEvent);
      planRunner.off('stepError', handleStepEvent);
    });
  });

  // API Keys management
  app.get("/api/keys/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const keyInfo = await secretService.hasKey(provider);
      res.json(keyInfo);
    } catch (error) {
      console.error("Error checking key:", error);
      res.status(500).json({ error: "Failed to check key status" });
    }
  });

  app.post("/api/keys/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const { key } = req.body;
      
      console.log(`[DEBUG] Saving key for provider: ${provider}`);
      console.log(`[DEBUG] Key length: ${key ? key.length : 'undefined'}`);
      console.log(`[DEBUG] MASTER_SECRET set: ${!!process.env.MASTER_SECRET}`);
      
      if (!key || typeof key !== 'string') {
        console.log(`[ERROR] Invalid key provided for ${provider}`);
        return res.status(400).json({ error: "API key is required" });
      }

      await secretService.setKey(provider, key);
      const keyInfo = await secretService.hasKey(provider);
      
      console.log(`[SUCCESS] Key saved for ${provider}:`, keyInfo);
      res.json({ success: true, ...keyInfo });
    } catch (error) {
      console.error(`[ERROR] Failed to save key for ${req.params.provider}:`, error);
      console.error(`[ERROR] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        error: "Failed to save API key",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.delete("/api/keys/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      await secretService.deleteKey(provider);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key:", error);
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  app.post("/api/keys/:provider/test", async (req, res) => {
    try {
      const { provider } = req.params;
      const apiKey = await secretService.getKey(provider);
      
      if (!apiKey) {
        return res.json({ success: false, error: "No API key found" });
      }

      let testResult = { success: false, error: "Test not implemented" };

      // Test different providers
      switch (provider) {
        case "openai":
          testResult = await testOpenAIConnection(apiKey);
          break;
        case "deepseek":
          testResult = await testDeepSeekConnection(apiKey);
          break;
        case "github":
          testResult = await testGitHubConnection(apiKey);
          break;
        case "gmail":
          testResult = await testGmailConnection(apiKey);
          break;
        default:
          testResult = { success: false, error: "Unknown provider" };
      }

      res.json(testResult);
    } catch (error) {
      console.error("Error testing connection:", error);
      res.status(500).json({ error: "Failed to test connection" });
    }
  });

  // Client management routes
  app.get("/api/clients", async (_req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // Client-specific chat routes
  app.get("/api/chat/history/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      // For now, return the general chat history - can be extended to be client-specific
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  app.post("/api/chat/send/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const { message } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get client data to access assigned agent tools
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Get available tools from client's assigned agents
      const availableTools = planRunner.getAllAvailableTools();

      // Store user message
      await storage.createChatMessage({
        role: "user",
        content: message.trim(),
      });

      // Generate plan using DeepSeek with client-specific tools
      const plan = await deepseekService.generatePlan(message.trim(), availableTools);

      if (plan.length === 0) {
        // Handle direct conversation without tools
        const directResponse = await deepseekService.generateDirectResponse(message.trim());
        
        await storage.createChatMessage({
          role: "assistant",
          content: directResponse,
        });

        return res.json({
          assistantMessage: directResponse,
        });
      }

      // Create plan record for tool-based requests
      const planRecord = await storage.createPlan({
        userMessage: message.trim(),
        steps: JSON.stringify(plan),
        status: "pending",
      });

      // Execute plan and wait for initial validation
      setImmediate(async () => {
        try {
          await planRunner.executePlan(planRecord.id, plan);
        } catch (error) {
          console.error("Plan execution error:", error);
        }
      });

      // Generate initial response indicating plan creation
      const assistantResponse = `I've created a plan to help you with that. I'll execute ${plan.length} steps to complete your request. You can watch the progress below.`;
      
      const assistantMessage = await storage.createChatMessage({
        role: "assistant",
        content: assistantResponse,
        planId: planRecord.id,
      });

      res.json({
        assistantMessage: assistantResponse,
        planId: planRecord.id,
        steps: plan,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const { insertClientSchema } = await import("@shared/schema");
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.updateClient(id, req.body);
      if (!client) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      if (!success) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // Plans routes
  app.get("/api/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error fetching plan:", error);
      res.status(500).json({ error: "Failed to fetch plan" });
    }
  });

  // Agent management routes
  app.get("/api/agents", async (_req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const { insertAgentSchema } = await import("@shared/schema");
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validatedData);
      res.json(agent);
    } catch (error) {
      console.error("Error creating agent:", error);
      res.status(500).json({ error: "Failed to create agent" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAgent(id);
      if (!agent) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }
      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ error: "Failed to fetch agent" });
    }
  });

  app.put("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.updateAgent(id, req.body);
      if (!agent) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }
      res.json(agent);
    } catch (error) {
      console.error("Error updating agent:", error);
      res.status(500).json({ error: "Failed to update agent" });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAgent(id);
      if (!success) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ error: "Failed to delete agent" });
    }
  });

  // SubAgent routes
  app.get("/api/subagents", async (_req, res) => {
    try {
      const subAgents = await storage.getSubAgents();
      res.json(subAgents);
    } catch (error) {
      console.error("Error fetching subagents:", error);
      res.status(500).json({ error: "Failed to fetch subagents" });
    }
  });

  app.post("/api/subagents", async (req, res) => {
    try {
      const subAgent = await storage.createSubAgent(req.body);
      res.json(subAgent);
    } catch (error) {
      console.error("Error creating subagent:", error);
      res.status(500).json({ error: "Failed to create subagent" });
    }
  });

  app.delete("/api/subagents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubAgent(id);
      if (!success) {
        res.status(404).json({ error: "SubAgent not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subagent:", error);
      res.status(500).json({ error: "Failed to delete subagent" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

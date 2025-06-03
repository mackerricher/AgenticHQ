import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { secretService } from "./secretService";
import { openaiService } from "./llm/openai";
import { planRunner } from "./planRunner";
import { insertChatMessageSchema, insertPlanSchema } from "@shared/schema";
import { z } from "zod";

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
      const planSteps = await openaiService.generatePlan(userMessage, availableTools);
      
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
      
      if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: "API key is required" });
      }

      await secretService.setKey(provider, key);
      const keyInfo = await secretService.hasKey(provider);
      
      res.json({ success: true, ...keyInfo });
    } catch (error) {
      console.error("Error saving key:", error);
      res.status(500).json({ error: "Failed to save API key" });
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

  const httpServer = createServer(app);
  return httpServer;
}

import { EventEmitter } from "events";
import { storage } from "./storage";
import { githubAgent } from "./agents/github";
import { gmailAgent } from "./agents/gmail";
import { fileCreatorAgent } from "./agents/fileCreator";
import { PlanStep, PlanStepExecution } from "@shared/schema";

export class PlanRunner extends EventEmitter {
  private contentRefs: Map<number, any> = new Map();

  async executePlan(planId: number, steps: PlanStep[]): Promise<void> {
    this.emit('planStart', { planId, totalSteps: steps.length });

    await storage.updatePlan(planId, { status: "running" });

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      this.emit('stepStart', { planId, stepIndex: i, step });

      // Create execution record
      const execution = await storage.createPlanExecution({
        planId,
        stepIndex: i,
        status: "running",
      });

      try {
        const result = await this.executeStep(step);
        
        if (!result.success) {
          // Handle step failure
          await storage.updatePlanExecution(execution.id, {
            status: "failed",
            error: result.error || "Step failed",
          });

          this.emit('stepError', { planId, stepIndex: i, error: result.error });
          
          // Stop execution on error
          await storage.updatePlan(planId, { status: "failed", currentStep: i });
          this.emit('planError', { planId, error: result.error });
          return;
        }
        
        // Store content references for later steps (1-indexed for user reference)
        if (result.result && typeof result.result === 'object') {
          this.contentRefs.set(i + 1, result.result);
        }

        await storage.updatePlanExecution(execution.id, {
          status: "completed",
          result: JSON.stringify(result.result),
        });

        this.emit('stepComplete', { planId, stepIndex: i, result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        await storage.updatePlanExecution(execution.id, {
          status: "failed",
          error: errorMessage,
        });

        this.emit('stepError', { planId, stepIndex: i, error: errorMessage });
        
        // Stop execution on error
        await storage.updatePlan(planId, { status: "failed", currentStep: i });
        this.emit('planError', { planId, error: errorMessage });
        return;
      }

      await storage.updatePlan(planId, { currentStep: i + 1 });
    }

    await storage.updatePlan(planId, { status: "completed" });
    this.emit('planComplete', { planId });
  }

  private async executeStep(step: PlanStep): Promise<{ success: boolean; result?: any; error?: string }> {
    const [agentName, toolName] = step.tool.split('.');
    const args = this.resolveContentRefs(step.args);

    switch (agentName) {
      case 'GitHub':
        return this.executeGitHubTool(toolName, args);
      case 'Gmail':
        return this.executeGmailTool(toolName, args);
      case 'FileCreator':
        return this.executeFileCreatorTool(toolName, args);
      default:
        throw new Error(`Unknown agent: ${agentName}`);
    }
  }

  private resolveContentRefs(args: Record<string, any>): Record<string, any> {
    const resolved = { ...args };
    
    for (const [key, value] of Object.entries(resolved)) {
      if (key === 'contentRef' && typeof value === 'number') {
        const contentObj = this.contentRefs.get(value);
        if (contentObj) {
          // Extract the actual content string from the FileCreator result
          if (typeof contentObj === 'string') {
            resolved.content = contentObj;
          } else if (contentObj && typeof contentObj === 'object' && contentObj.content) {
            resolved.content = contentObj.content;
          } else if (contentObj && typeof contentObj === 'object') {
            // Fallback: try to find content in common properties
            resolved.content = contentObj.text || contentObj.body || contentObj.data || JSON.stringify(contentObj);
          } else {
            resolved.content = String(contentObj);
          }
          delete resolved.contentRef;
        }
      }
    }
    
    return resolved;
  }

  private async executeGitHubTool(toolName: string, args: Record<string, any>): Promise<{ success: boolean; result?: any; error?: string }> {
    switch (toolName) {
      case 'createRepo':
        return githubAgent.createRepo(args.name, args.description);
      case 'addFile':
        return githubAgent.addFile(args.repo, args.path, args.content);
      default:
        throw new Error(`Unknown GitHub tool: ${toolName}`);
    }
  }

  private async executeGmailTool(toolName: string, args: Record<string, any>): Promise<{ success: boolean; result?: any; error?: string }> {
    switch (toolName) {
      case 'sendEmail':
        return gmailAgent.sendEmail(args.to, args.subject, args.body);
      default:
        throw new Error(`Unknown Gmail tool: ${toolName}`);
    }
  }

  private async executeFileCreatorTool(toolName: string, args: Record<string, any>): Promise<{ success: boolean; result?: any; error?: string }> {
    switch (toolName) {
      case 'createMarkdown':
        return fileCreatorAgent.createMarkdown(args.filename, args.contents);
      default:
        throw new Error(`Unknown FileCreator tool: ${toolName}`);
    }
  }

  getAllAvailableTools(): string[] {
    return [
      ...githubAgent.getAvailableTools(),
      ...gmailAgent.getAvailableTools(),
      ...fileCreatorAgent.getAvailableTools(),
    ];
  }
}

export const planRunner = new PlanRunner();

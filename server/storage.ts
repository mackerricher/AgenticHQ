import { 
  users, secrets, chatMessages, plans, planExecutions,
  type User, type InsertUser,
  type Secret, type InsertSecret,
  type ChatMessage, type InsertChatMessage,
  type Plan, type InsertPlan,
  type PlanExecution, type InsertPlanExecution
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Secrets
  getSecret(provider: string): Promise<Secret | undefined>;
  createSecret(secret: InsertSecret): Promise<Secret>;
  updateSecret(provider: string, encryptedKey: string, keyPreview: string): Promise<Secret | undefined>;
  deleteSecret(provider: string): Promise<boolean>;

  // Chat Messages
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(): Promise<void>;

  // Plans
  getPlan(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, updates: Partial<Plan>): Promise<Plan | undefined>;

  // Plan Executions
  getPlanExecutions(planId: number): Promise<PlanExecution[]>;
  createPlanExecution(execution: InsertPlanExecution): Promise<PlanExecution>;
  updatePlanExecution(id: number, updates: Partial<PlanExecution>): Promise<PlanExecution | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getSecret(provider: string): Promise<Secret | undefined> {
    const [secret] = await db.select().from(secrets).where(eq(secrets.provider, provider));
    return secret || undefined;
  }

  async createSecret(insertSecret: InsertSecret): Promise<Secret> {
    const [secret] = await db
      .insert(secrets)
      .values(insertSecret)
      .returning();
    return secret;
  }

  async updateSecret(provider: string, encryptedKey: string, keyPreview: string): Promise<Secret | undefined> {
    const [secret] = await db
      .update(secrets)
      .set({ encryptedKey, keyPreview, updatedAt: new Date() })
      .where(eq(secrets.provider, provider))
      .returning();
    return secret || undefined;
  }

  async deleteSecret(provider: string): Promise<boolean> {
    const result = await db.delete(secrets).where(eq(secrets.provider, provider));
    return Boolean(result.rowCount);
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).orderBy(chatMessages.createdAt);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async clearChatMessages(): Promise<void> {
    await db.delete(chatMessages);
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan || undefined;
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const [plan] = await db
      .insert(plans)
      .values({
        ...insertPlan,
        status: insertPlan.status || "pending",
        currentStep: insertPlan.currentStep || 0
      })
      .returning();
    return plan;
  }

  async updatePlan(id: number, updates: Partial<Plan>): Promise<Plan | undefined> {
    const [plan] = await db
      .update(plans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();
    return plan || undefined;
  }

  async getPlanExecutions(planId: number): Promise<PlanExecution[]> {
    return await db
      .select()
      .from(planExecutions)
      .where(eq(planExecutions.planId, planId))
      .orderBy(planExecutions.stepIndex);
  }

  async createPlanExecution(insertExecution: InsertPlanExecution): Promise<PlanExecution> {
    const [execution] = await db
      .insert(planExecutions)
      .values({
        ...insertExecution,
        result: insertExecution.result || null,
        error: insertExecution.error || null
      })
      .returning();
    return execution;
  }

  async updatePlanExecution(id: number, updates: Partial<PlanExecution>): Promise<PlanExecution | undefined> {
    const [execution] = await db
      .update(planExecutions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(planExecutions.id, id))
      .returning();
    return execution || undefined;
  }
}

export const storage = new DatabaseStorage();

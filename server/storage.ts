import { 
  users, secrets, chatMessages, plans, planExecutions, clients, agents, subAgents,
  type User, type InsertUser,
  type Secret, type InsertSecret,
  type ChatMessage, type InsertChatMessage,
  type Plan, type InsertPlan,
  type PlanExecution, type InsertPlanExecution,
  type Client, type InsertClient,
  type Agent, type InsertAgent,
  type SubAgent, type InsertSubAgent
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

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;

  // SubAgents
  getSubAgents(): Promise<SubAgent[]>;
  getSubAgent(id: number): Promise<SubAgent | undefined>;
  createSubAgent(subAgent: InsertSubAgent): Promise<SubAgent>;
  updateSubAgent(id: number, updates: Partial<SubAgent>): Promise<SubAgent | undefined>;
  deleteSubAgent(id: number): Promise<boolean>;
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

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(clients.createdAt);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return Boolean(result.rowCount);
  }

  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents).orderBy(agents.createdAt);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db
      .insert(agents)
      .values(insertAgent)
      .returning();
    return agent;
  }

  async updateAgent(id: number, updates: Partial<Agent>): Promise<Agent | undefined> {
    const [agent] = await db
      .update(agents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return agent || undefined;
  }

  async deleteAgent(id: number): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return Boolean(result.rowCount);
  }
}

export const storage = new DatabaseStorage();

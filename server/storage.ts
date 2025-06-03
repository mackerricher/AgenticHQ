import { 
  users, secrets, chatMessages, plans, planExecutions,
  type User, type InsertUser,
  type Secret, type InsertSecret,
  type ChatMessage, type InsertChatMessage,
  type Plan, type InsertPlan,
  type PlanExecution, type InsertPlanExecution
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Secrets
  getSecret(provider: string): Promise<Secret | undefined>;
  createSecret(secret: InsertSecret): Promise<Secret>;
  updateSecret(provider: string, encryptedKey: string): Promise<Secret | undefined>;
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private secrets: Map<string, Secret>;
  private chatMessages: Map<number, ChatMessage>;
  private plans: Map<number, Plan>;
  private planExecutions: Map<number, PlanExecution>;
  private currentUserId: number;
  private currentSecretId: number;
  private currentChatMessageId: number;
  private currentPlanId: number;
  private currentPlanExecutionId: number;

  constructor() {
    this.users = new Map();
    this.secrets = new Map();
    this.chatMessages = new Map();
    this.plans = new Map();
    this.planExecutions = new Map();
    this.currentUserId = 1;
    this.currentSecretId = 1;
    this.currentChatMessageId = 1;
    this.currentPlanId = 1;
    this.currentPlanExecutionId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Secrets
  async getSecret(provider: string): Promise<Secret | undefined> {
    return this.secrets.get(provider);
  }

  async createSecret(insertSecret: InsertSecret): Promise<Secret> {
    const id = this.currentSecretId++;
    const now = new Date();
    const secret: Secret = {
      ...insertSecret,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.secrets.set(insertSecret.provider, secret);
    return secret;
  }

  async updateSecret(provider: string, encryptedKey: string): Promise<Secret | undefined> {
    const existing = this.secrets.get(provider);
    if (!existing) return undefined;

    const updated: Secret = {
      ...existing,
      encryptedKey,
      updatedAt: new Date(),
    };
    this.secrets.set(provider, updated);
    return updated;
  }

  async deleteSecret(provider: string): Promise<boolean> {
    return this.secrets.delete(provider);
  }

  // Chat Messages
  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearChatMessages(): Promise<void> {
    this.chatMessages.clear();
  }

  // Plans
  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const id = this.currentPlanId++;
    const now = new Date();
    const plan: Plan = {
      ...insertPlan,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.plans.set(id, plan);
    return plan;
  }

  async updatePlan(id: number, updates: Partial<Plan>): Promise<Plan | undefined> {
    const existing = this.plans.get(id);
    if (!existing) return undefined;

    const updated: Plan = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.plans.set(id, updated);
    return updated;
  }

  // Plan Executions
  async getPlanExecutions(planId: number): Promise<PlanExecution[]> {
    return Array.from(this.planExecutions.values())
      .filter(execution => execution.planId === planId)
      .sort((a, b) => a.stepIndex - b.stepIndex);
  }

  async createPlanExecution(insertExecution: InsertPlanExecution): Promise<PlanExecution> {
    const id = this.currentPlanExecutionId++;
    const now = new Date();
    const execution: PlanExecution = {
      ...insertExecution,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.planExecutions.set(id, execution);
    return execution;
  }

  async updatePlanExecution(id: number, updates: Partial<PlanExecution>): Promise<PlanExecution | undefined> {
    const existing = this.planExecutions.get(id);
    if (!existing) return undefined;

    const updated: PlanExecution = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.planExecutions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();

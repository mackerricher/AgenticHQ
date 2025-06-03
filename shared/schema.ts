import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const secrets = pgTable("secrets", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull().unique(), // "openai", "deepseek", "github", "gmail"
  encryptedKey: text("encrypted_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  steps: jsonb("steps").notNull(), // Array of plan steps
  status: text("status").notNull().default("pending"), // "pending" | "running" | "completed" | "failed"
  currentStep: integer("current_step").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const planExecutions = pgTable("plan_executions", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull(),
  stepIndex: integer("step_index").notNull(),
  status: text("status").notNull(), // "pending" | "running" | "completed" | "failed"
  result: text("result"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSecretSchema = createInsertSchema(secrets).pick({
  provider: true,
  encryptedKey: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  role: true,
  content: true,
});

export const insertPlanSchema = createInsertSchema(plans).pick({
  steps: true,
  status: true,
  currentStep: true,
});

export const insertPlanExecutionSchema = createInsertSchema(planExecutions).pick({
  planId: true,
  stepIndex: true,
  status: true,
  result: true,
  error: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Secret = typeof secrets.$inferSelect;
export type InsertSecret = z.infer<typeof insertSecretSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type PlanExecution = typeof planExecutions.$inferSelect;
export type InsertPlanExecution = z.infer<typeof insertPlanExecutionSchema>;

// Plan step types
export interface PlanStep {
  tool: string;
  args: Record<string, any>;
}

export interface PlanStepExecution {
  stepIndex: number;
  status: "pending" | "running" | "completed" | "failed";
  result?: any;
  error?: string;
}

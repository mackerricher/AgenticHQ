// server/db.ts
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a regular pg Pool (talks TCP on 5432)
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Use the node-postgres adapter instead of the neon-serverless one
export const db = drizzle(pool, { schema });

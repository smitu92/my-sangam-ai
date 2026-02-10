import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from "dotenv";

import * as usersSchema from './schemas/user';
import * as schemesSchema from './schemas/scheme';

dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { 
  schema: { ...usersSchema, ...schemesSchema } 
});

export * from './schemas/user';
export * from './schemas/scheme';

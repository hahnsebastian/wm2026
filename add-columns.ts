import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function main() {
  const connectionString = process.env.DATABASE_URL || "";
  const pool = new Pool({ connectionString });
  
  await pool.query('ALTER TABLE "Fixture" ADD COLUMN IF NOT EXISTS "advancingTeam" TEXT;');
  await pool.query('ALTER TABLE "Prediction" ADD COLUMN IF NOT EXISTS "advancingTeam" TEXT;');
  
  console.log("Added advancingTeam columns successfully via raw SQL over WebSockets!");
  await pool.end();
}

main().catch(console.error);

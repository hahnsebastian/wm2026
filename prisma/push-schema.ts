import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

neonConfig.webSocketConstructor = ws;

const sql = `
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Fixture" (
    "id" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "kickoffTime" TIMESTAMP(3) NOT NULL,
    "stage" TEXT NOT NULL,
    "homeGoals" INTEGER,
    "awayGoals" INTEGER,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Fixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Prediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "homeBet" INTEGER NOT NULL,
    "awayBet" INTEGER NOT NULL,
    "pointsEarned" INTEGER,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HistoricPointsLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "cumulativePointsAtThisTime" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricPointsLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Prediction_userId_fixtureId_key" ON "Prediction"("userId", "fixtureId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HistoricPointsLog_userId_idx" ON "HistoricPointsLog"("userId");

-- AddForeignKey
ALTER TABLE "Prediction" DROP CONSTRAINT IF EXISTS "Prediction_userId_fkey";
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" DROP CONSTRAINT IF EXISTS "Prediction_fixtureId_fkey";
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricPointsLog" DROP CONSTRAINT IF EXISTS "HistoricPointsLog_userId_fkey";
ALTER TABLE "HistoricPointsLog" ADD CONSTRAINT "HistoricPointsLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricPointsLog" DROP CONSTRAINT IF EXISTS "HistoricPointsLog_fixtureId_fkey";
ALTER TABLE "HistoricPointsLog" ADD CONSTRAINT "HistoricPointsLog_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL env var not found");
    process.exit(1);
  }
  
  console.log("Connecting to Neon over WebSocket...");
  const pool = new Pool({ connectionString });
  
  try {
    console.log("Applying SQL Schema...");
    await pool.query(sql);
    console.log("Database schema applied successfully!");
  } catch (err) {
    console.error("Error applying schema:", err);
  } finally {
    await pool.end();
  }
}

run();

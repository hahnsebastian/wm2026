import { PrismaClient } from "./src/generated/prisma/client";
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const finalMatches = [
  { homeTeam: "England", awayTeam: "Argentina", kickoffTime: new Date("2026-07-15T19:00:00Z"), stage: "Third Place" },
  { homeTeam: "France", awayTeam: "Spain", kickoffTime: new Date("2026-07-19T19:00:00Z"), stage: "Final" },
];

async function main() {
  console.log("Seeding Final matches...");
  for (const match of finalMatches) {
    const existing = await prisma.fixture.findFirst({
      where: { homeTeam: match.homeTeam, awayTeam: match.awayTeam, stage: match.stage }
    });
    if (!existing) {
      await prisma.fixture.create({ data: match });
      console.log(`Created: ${match.homeTeam} vs ${match.awayTeam} (${match.stage})`);
    } else {
      console.log(`Already exists: ${match.homeTeam} vs ${match.awayTeam}`);
    }
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

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

const sfMatches = [
  { homeTeam: "France", awayTeam: "Morocco", kickoffTime: new Date("2026-07-09T19:00:00Z"), stage: "Semifinals" },
  { homeTeam: "Spain", awayTeam: "Belgium", kickoffTime: new Date("2026-07-10T19:00:00Z"), stage: "Semifinals" },
  { homeTeam: "Norway", awayTeam: "England", kickoffTime: new Date("2026-07-11T19:00:00Z"), stage: "Semifinals" },
  { homeTeam: "Argentina", awayTeam: "Switzerland", kickoffTime: new Date("2026-07-12T19:00:00Z"), stage: "Semifinals" },
];

async function main() {
  console.log("Seeding Semifinals matches...");
  for (const match of sfMatches) {
    const existing = await prisma.fixture.findFirst({
      where: { homeTeam: match.homeTeam, awayTeam: match.awayTeam, stage: match.stage }
    });
    if (!existing) {
      await prisma.fixture.create({ data: match });
      console.log(`Created: ${match.homeTeam} vs ${match.awayTeam}`);
    } else {
      console.log(`Already exists: ${match.homeTeam} vs ${match.awayTeam}`);
    }
  }
  console.log("Done seeding Semifinals!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

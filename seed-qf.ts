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

const qfMatches = [
  { homeTeam: "Canada", awayTeam: "Morocco", kickoffTime: new Date("2026-07-05T16:00:00Z"), stage: "Quarterfinals" },
  { homeTeam: "Paraguay", awayTeam: "France", kickoffTime: new Date("2026-07-05T19:00:00Z"), stage: "Quarterfinals" },
  { homeTeam: "Brazil", awayTeam: "Norway", kickoffTime: new Date("2026-07-06T16:00:00Z"), stage: "Quarterfinals" },
  { homeTeam: "Mexico", awayTeam: "England", kickoffTime: new Date("2026-07-06T19:00:00Z"), stage: "Quarterfinals" },
  { homeTeam: "Portugal", awayTeam: "Spain", kickoffTime: new Date("2026-07-07T16:00:00Z"), stage: "Quarterfinals" },
  { homeTeam: "United States", awayTeam: "Belgium", kickoffTime: new Date("2026-07-07T19:00:00Z"), stage: "Quarterfinals" },
  { homeTeam: "Argentina", awayTeam: "Egypt", kickoffTime: new Date("2026-07-08T16:00:00Z"), stage: "Quarterfinals" },
  { homeTeam: "Switzerland", awayTeam: "Colombia", kickoffTime: new Date("2026-07-08T19:00:00Z"), stage: "Quarterfinals" },
];

async function main() {
  console.log("Seeding Quarterfinals matches...");
  for (const match of qfMatches) {
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
  console.log("Done seeding QF!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

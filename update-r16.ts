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

const r16Matches = [
  { homeTeam: "South Africa", awayTeam: "Canada", kickoffTime: new Date("2026-06-28T17:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Brazil", awayTeam: "Japan", kickoffTime: new Date("2026-06-28T21:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Germany", awayTeam: "Paraguay", kickoffTime: new Date("2026-06-29T17:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Netherlands", awayTeam: "Morocco", kickoffTime: new Date("2026-06-29T21:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Côte d'Ivoire", awayTeam: "Norway", kickoffTime: new Date("2026-06-30T17:00:00Z"), stage: "Round of 16" },
  { homeTeam: "France", awayTeam: "Sweden", kickoffTime: new Date("2026-06-30T21:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Mexico", awayTeam: "Ecuador", kickoffTime: new Date("2026-07-01T17:00:00Z"), stage: "Round of 16" },
  { homeTeam: "England", awayTeam: "DR Congo", kickoffTime: new Date("2026-07-01T21:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Belgium", awayTeam: "Senegal", kickoffTime: new Date("2026-07-02T17:00:00Z"), stage: "Round of 16" },
  { homeTeam: "United States", awayTeam: "Bosnia and Herzegovina", kickoffTime: new Date("2026-07-02T21:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Spain", awayTeam: "Austria", kickoffTime: new Date("2026-07-03T17:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Portugal", awayTeam: "Croatia", kickoffTime: new Date("2026-07-03T21:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Switzerland", awayTeam: "Algeria", kickoffTime: new Date("2026-07-04T17:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Australia", awayTeam: "Egypt", kickoffTime: new Date("2026-07-04T21:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Argentina", awayTeam: "Cape Verde", kickoffTime: new Date("2026-07-05T17:00:00Z"), stage: "Round of 16" },
  { homeTeam: "Colombia", awayTeam: "Ghana", kickoffTime: new Date("2026-07-05T21:00:00Z"), stage: "Round of 16" },
];

async function main() {
  console.log("Seeding Round of 16 matches...");
  
  for (const match of r16Matches) {
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
  
  console.log("Done seeding R16!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

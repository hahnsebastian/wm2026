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

async function main() {
  const matches = await prisma.fixture.findMany({
    where: { stage: "Group Stage (Group I)" }
  });
  
  // 1. France vs Norway -> France vs Iraq
  const m1 = matches.find(m => m.homeTeam === "France" && m.awayTeam === "Norway");
  if (m1) await prisma.fixture.update({ where: { id: m1.id }, data: { awayTeam: "Iraq" } });
  
  // 2. Senegal vs Iraq -> Norway vs Senegal
  const m2 = matches.find(m => m.homeTeam === "Senegal" && m.awayTeam === "Iraq");
  if (m2) await prisma.fixture.update({ where: { id: m2.id }, data: { homeTeam: "Norway", awayTeam: "Senegal" } });

  // 3. France vs Iraq -> France vs Norway
  const m3 = matches.find(m => m.homeTeam === "France" && m.awayTeam === "Iraq" && m.id !== m1?.id);
  if (m3) await prisma.fixture.update({ where: { id: m3.id }, data: { awayTeam: "Norway" } });

  // 4. Senegal vs Norway -> Senegal vs Iraq
  const m4 = matches.find(m => m.homeTeam === "Senegal" && m.awayTeam === "Norway");
  if (m4) await prisma.fixture.update({ where: { id: m4.id }, data: { awayTeam: "Iraq" } });

  console.log("Updated live DB schedule successfully for Group I!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

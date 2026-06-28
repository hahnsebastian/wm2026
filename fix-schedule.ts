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
    where: { stage: "Group Stage (Group H)" }
  });
  
  // 1. Spain vs Uruguay -> Spain vs Cape Verde
  const m1 = matches.find(m => m.homeTeam === "Spain" && m.awayTeam === "Uruguay");
  if (m1) await prisma.fixture.update({ where: { id: m1.id }, data: { awayTeam: "Cape Verde" } });
  
  // 2. Saudi Arabia vs Cape Verde -> Saudi Arabia vs Uruguay
  const m2 = matches.find(m => m.homeTeam === "Saudi Arabia" && m.awayTeam === "Cape Verde");
  if (m2) await prisma.fixture.update({ where: { id: m2.id }, data: { awayTeam: "Uruguay" } });

  // 3. Spain vs Cape Verde -> Spain vs Uruguay
  const m3 = matches.find(m => m.homeTeam === "Spain" && m.awayTeam === "Cape Verde" && m.id !== m1?.id);
  if (m3) await prisma.fixture.update({ where: { id: m3.id }, data: { awayTeam: "Uruguay" } });

  // 4. Uruguay vs Saudi Arabia -> Cape Verde vs Saudi Arabia
  const m4 = matches.find(m => m.homeTeam === "Uruguay" && m.awayTeam === "Saudi Arabia");
  if (m4) await prisma.fixture.update({ where: { id: m4.id }, data: { homeTeam: "Cape Verde" } });

  console.log("Updated live DB schedule successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

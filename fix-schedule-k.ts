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
    where: { stage: "Group Stage (Group K)" }
  });
  
  // 1. Portugal vs Colombia -> Portugal vs DR Congo
  const m1 = matches.find(m => m.homeTeam === "Portugal" && m.awayTeam === "Colombia");
  if (m1) await prisma.fixture.update({ where: { id: m1.id }, data: { awayTeam: "DR Congo" } });
  
  // 2. Uzbekistan vs DR Congo -> Uzbekistan vs Colombia
  const m2 = matches.find(m => m.homeTeam === "Uzbekistan" && m.awayTeam === "DR Congo");
  if (m2) await prisma.fixture.update({ where: { id: m2.id }, data: { awayTeam: "Colombia" } });

  // 3. Portugal vs DR Congo -> Portugal vs Colombia
  const m3 = matches.find(m => m.homeTeam === "Portugal" && m.awayTeam === "DR Congo" && m.id !== m1?.id);
  if (m3) await prisma.fixture.update({ where: { id: m3.id }, data: { awayTeam: "Colombia" } });

  // 4. Colombia vs Uzbekistan -> DR Congo vs Uzbekistan
  const m4 = matches.find(m => m.homeTeam === "Colombia" && m.awayTeam === "Uzbekistan");
  if (m4) await prisma.fixture.update({ where: { id: m4.id }, data: { homeTeam: "DR Congo" } });

  console.log("Updated live DB schedule successfully for Group K!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "./src/generated/prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const fixtures = await prisma.fixture.findMany();
  for (const f of fixtures) {
    const newTime = new Date(f.kickoffTime.getTime() + 6 * 60 * 60 * 1000); // add 6 hours
    await prisma.fixture.update({
      where: { id: f.id },
      data: { kickoffTime: newTime }
    });
  }
  console.log("Successfully pushed all kickoff times by 6 hours");
}

main().catch(console.error).finally(() => prisma.$disconnect());

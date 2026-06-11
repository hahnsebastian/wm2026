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
  const existing = await prisma.user.findUnique({ where: { name: "Mike" } });
  if (!existing) {
    await prisma.user.create({
      data: { name: "Mike", pin: "9876", isAdmin: false }
    });
    console.log("Successfully added Mike to the database.");
  } else {
    console.log("Mike already exists.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

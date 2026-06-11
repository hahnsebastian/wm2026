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

// CEST = UTC+2, so subtract 2 hours to get UTC
function cestToUtc(cestStr: string): Date {
  const [datePart, timePart] = cestStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  // Create in UTC by subtracting 2h from CEST
  return new Date(Date.UTC(year, month - 1, day, hours - 2, minutes, 0));
}

const matches: { home: string; away: string; kickoffCEST: string }[] = [
  { home: "Mexico", away: "South Korea", kickoffCEST: "2026-06-19 03:00" },
  { home: "South Africa", away: "Czechia", kickoffCEST: "2026-06-18 18:00" },
  { home: "Mexico", away: "South Africa", kickoffCEST: "2026-06-11 21:00" },
  { home: "South Korea", away: "Czechia", kickoffCEST: "2026-06-12 04:00" },
  { home: "Mexico", away: "Czechia", kickoffCEST: "2026-06-24 23:00" },
  { home: "South Korea", away: "South Africa", kickoffCEST: "2026-06-24 23:00" },
  { home: "Canada", away: "Bosnia and Herzegovina", kickoffCEST: "2026-06-12 21:00" },
  { home: "Qatar", away: "Switzerland", kickoffCEST: "2026-06-13 21:00" },
  { home: "Canada", away: "Qatar", kickoffCEST: "2026-06-19 00:00" },
  { home: "Bosnia and Herzegovina", away: "Switzerland", kickoffCEST: "2026-06-18 21:00" },
  { home: "Canada", away: "Switzerland", kickoffCEST: "2026-06-24 21:00" },
  { home: "Bosnia and Herzegovina", away: "Qatar", kickoffCEST: "2026-06-24 21:00" },
  { home: "Brazil", away: "Morocco", kickoffCEST: "2026-06-14 00:00" },
  { home: "Haiti", away: "Scotland", kickoffCEST: "2026-06-14 03:00" },
  { home: "Brazil", away: "Haiti", kickoffCEST: "2026-06-20 02:30" },
  { home: "Morocco", away: "Scotland", kickoffCEST: "2026-06-20 00:00" },
  { home: "Brazil", away: "Scotland", kickoffCEST: "2026-06-24 20:00" },
  { home: "Morocco", away: "Haiti", kickoffCEST: "2026-06-24 20:00" },
  { home: "United States", away: "Paraguay", kickoffCEST: "2026-06-13 03:00" },
  { home: "Australia", away: "Türkiye", kickoffCEST: "2026-06-14 06:00" },
  { home: "United States", away: "Australia", kickoffCEST: "2026-06-19 21:00" },
  { home: "Paraguay", away: "Türkiye", kickoffCEST: "2026-06-20 05:00" },
  { home: "United States", away: "Türkiye", kickoffCEST: "2026-06-26 00:00" },
  { home: "Paraguay", away: "Australia", kickoffCEST: "2026-06-26 00:00" },
  { home: "Germany", away: "Côte d'Ivoire", kickoffCEST: "2026-06-20 22:00" },
  { home: "Ecuador", away: "Curaçao", kickoffCEST: "2026-06-21 02:00" },
  { home: "Germany", away: "Ecuador", kickoffCEST: "2026-06-25 22:00" },
  { home: "Côte d'Ivoire", away: "Curaçao", kickoffCEST: "2026-06-25 22:00" },
  { home: "Germany", away: "Curaçao", kickoffCEST: "2026-06-14 19:00" },
  { home: "Côte d'Ivoire", away: "Ecuador", kickoffCEST: "2026-06-15 01:00" },
  { home: "Netherlands", away: "Japan", kickoffCEST: "2026-06-14 22:00" },
  { home: "Sweden", away: "Tunisia", kickoffCEST: "2026-06-15 04:00" },
  { home: "Netherlands", away: "Sweden", kickoffCEST: "2026-06-20 19:00" },
  { home: "Japan", away: "Tunisia", kickoffCEST: "2026-06-21 06:00" },
  { home: "Netherlands", away: "Tunisia", kickoffCEST: "2026-06-26 01:00" },
  { home: "Japan", away: "Sweden", kickoffCEST: "2026-06-26 01:00" },
  { home: "Belgium", away: "Egypt", kickoffCEST: "2026-06-15 21:00" },
  { home: "Iran", away: "New Zealand", kickoffCEST: "2026-06-16 03:00" },
  { home: "Belgium", away: "Iran", kickoffCEST: "2026-06-21 21:00" },
  { home: "Egypt", away: "New Zealand", kickoffCEST: "2026-06-22 03:00" },
  { home: "Belgium", away: "New Zealand", kickoffCEST: "2026-06-26 22:00" },
  { home: "Egypt", away: "Iran", kickoffCEST: "2026-06-26 22:00" },
  { home: "Spain", away: "Uruguay", kickoffCEST: "2026-06-15 18:00" },
  { home: "Saudi Arabia", away: "Cape Verde", kickoffCEST: "2026-06-16 00:00" },
  { home: "Spain", away: "Saudi Arabia", kickoffCEST: "2026-06-21 18:00" },
  { home: "Uruguay", away: "Cape Verde", kickoffCEST: "2026-06-22 00:00" },
  { home: "Spain", away: "Cape Verde", kickoffCEST: "2026-06-26 19:00" },
  { home: "Uruguay", away: "Saudi Arabia", kickoffCEST: "2026-06-26 19:00" },
  { home: "France", away: "Senegal", kickoffCEST: "2026-06-16 21:00" },
  { home: "Norway", away: "Iraq", kickoffCEST: "2026-06-17 00:00" },
  { home: "France", away: "Norway", kickoffCEST: "2026-06-22 19:00" },
  { home: "Senegal", away: "Iraq", kickoffCEST: "2026-06-22 22:00" },
  { home: "France", away: "Iraq", kickoffCEST: "2026-06-26 23:00" },
  { home: "Senegal", away: "Norway", kickoffCEST: "2026-06-26 23:00" },
  { home: "Argentina", away: "Algeria", kickoffCEST: "2026-06-17 03:00" },
  { home: "Austria", away: "Jordan", kickoffCEST: "2026-06-17 06:00" },
  { home: "Argentina", away: "Austria", kickoffCEST: "2026-06-22 15:00" },
  { home: "Algeria", away: "Jordan", kickoffCEST: "2026-06-23 01:00" },
  { home: "Argentina", away: "Jordan", kickoffCEST: "2026-06-27 18:00" },
  { home: "Algeria", away: "Austria", kickoffCEST: "2026-06-27 18:00" },
  { home: "Portugal", away: "Colombia", kickoffCEST: "2026-06-17 19:00" },
  { home: "Uzbekistan", away: "DR Congo", kickoffCEST: "2026-06-18 00:00" },
  { home: "Portugal", away: "Uzbekistan", kickoffCEST: "2026-06-23 15:00" },
  { home: "Colombia", away: "DR Congo", kickoffCEST: "2026-06-24 00:00" },
  { home: "Portugal", away: "DR Congo", kickoffCEST: "2026-06-27 21:30" },
  { home: "Colombia", away: "Uzbekistan", kickoffCEST: "2026-06-27 21:30" },
  { home: "England", away: "Croatia", kickoffCEST: "2026-06-17 22:00" },
  { home: "Ghana", away: "Panama", kickoffCEST: "2026-06-18 01:00" },
  { home: "England", away: "Ghana", kickoffCEST: "2026-06-23 18:00" },
  { home: "Croatia", away: "Panama", kickoffCEST: "2026-06-23 21:00" },
  { home: "England", away: "Panama", kickoffCEST: "2026-06-27 23:00" },
  { home: "Croatia", away: "Ghana", kickoffCEST: "2026-06-27 23:00" },
];

async function main() {
  const fixtures = await prisma.fixture.findMany();
  let updated = 0;
  let notFound = 0;

  for (const m of matches) {
    const fixture = fixtures.find(
      f => f.homeTeam === m.home && f.awayTeam === m.away
    );
    if (!fixture) {
      console.warn(`NOT FOUND: ${m.home} vs ${m.away}`);
      notFound++;
      continue;
    }
    const newTime = cestToUtc(m.kickoffCEST);
    await prisma.fixture.update({
      where: { id: fixture.id },
      data: { kickoffTime: newTime }
    });
    updated++;
  }

  console.log(`Updated: ${updated}, Not found: ${notFound}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

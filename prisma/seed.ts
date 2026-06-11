import { PrismaClient } from "../src/generated/prisma/client";
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
  console.log("Cleaning up database...");
  await prisma.historicPointsLog.deleteMany({});
  await prisma.prediction.deleteMany({});
  await prisma.fixture.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding users...");
  const usersData = [
    { name: "Admin", pin: "9999", isAdmin: true },
    { name: "Yuliya", pin: "1111", isAdmin: false },
    { name: "Jasmine", pin: "2222", isAdmin: false },
    { name: "Max", pin: "3333", isAdmin: false },
    { name: "Omar", pin: "4444", isAdmin: false },
    { name: "Simone", pin: "5555", isAdmin: false },
    { name: "Ursula", pin: "6666", isAdmin: false },
    { name: "Thomas", pin: "7777", isAdmin: false },
    { name: "Sebastian", pin: "8888", isAdmin: false },
    { name: "Zakee", pin: "1234", isAdmin: false },
    { name: "Laila", pin: "5678", isAdmin: false },
  ];

  const seededUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    seededUsers.push(user);
  }

      // Future World Cup 2026 fixtures
  const wcFixtures = [
    {
      homeTeam: "Mexico",
      awayTeam: "South Korea",
      kickoffTime: new Date("2026-06-11T18:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "South Africa",
      awayTeam: "Czechia",
      kickoffTime: new Date("2026-06-11T22:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "Mexico",
      awayTeam: "South Africa",
      kickoffTime: new Date("2026-06-11T02:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "South Korea",
      awayTeam: "Czechia",
      kickoffTime: new Date("2026-06-12T06:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "Mexico",
      awayTeam: "Czechia",
      kickoffTime: new Date("2026-06-12T10:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "South Korea",
      awayTeam: "South Africa",
      kickoffTime: new Date("2026-06-12T14:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "Canada",
      awayTeam: "Bosnia and Herzegovina",
      kickoffTime: new Date("2026-06-12T18:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Qatar",
      awayTeam: "Switzerland",
      kickoffTime: new Date("2026-06-12T22:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Canada",
      awayTeam: "Qatar",
      kickoffTime: new Date("2026-06-12T02:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Bosnia and Herzegovina",
      awayTeam: "Switzerland",
      kickoffTime: new Date("2026-06-13T06:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Canada",
      awayTeam: "Switzerland",
      kickoffTime: new Date("2026-06-13T10:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Bosnia and Herzegovina",
      awayTeam: "Qatar",
      kickoffTime: new Date("2026-06-13T14:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Brazil",
      awayTeam: "Morocco",
      kickoffTime: new Date("2026-06-13T18:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Haiti",
      awayTeam: "Scotland",
      kickoffTime: new Date("2026-06-13T22:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Brazil",
      awayTeam: "Haiti",
      kickoffTime: new Date("2026-06-13T02:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Morocco",
      awayTeam: "Scotland",
      kickoffTime: new Date("2026-06-14T06:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Brazil",
      awayTeam: "Scotland",
      kickoffTime: new Date("2026-06-14T10:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Morocco",
      awayTeam: "Haiti",
      kickoffTime: new Date("2026-06-14T14:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "United States",
      awayTeam: "Paraguay",
      kickoffTime: new Date("2026-06-14T18:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "Australia",
      awayTeam: "Türkiye",
      kickoffTime: new Date("2026-06-14T22:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "United States",
      awayTeam: "Australia",
      kickoffTime: new Date("2026-06-14T02:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "Paraguay",
      awayTeam: "Türkiye",
      kickoffTime: new Date("2026-06-15T06:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "United States",
      awayTeam: "Türkiye",
      kickoffTime: new Date("2026-06-15T10:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "Paraguay",
      awayTeam: "Australia",
      kickoffTime: new Date("2026-06-15T14:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "Germany",
      awayTeam: "Côte d'Ivoire",
      kickoffTime: new Date("2026-06-15T18:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Ecuador",
      awayTeam: "Curaçao",
      kickoffTime: new Date("2026-06-15T22:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Germany",
      awayTeam: "Ecuador",
      kickoffTime: new Date("2026-06-15T02:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Côte d'Ivoire",
      awayTeam: "Curaçao",
      kickoffTime: new Date("2026-06-16T06:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Germany",
      awayTeam: "Curaçao",
      kickoffTime: new Date("2026-06-16T10:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Côte d'Ivoire",
      awayTeam: "Ecuador",
      kickoffTime: new Date("2026-06-16T14:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Netherlands",
      awayTeam: "Japan",
      kickoffTime: new Date("2026-06-16T18:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Sweden",
      awayTeam: "Tunisia",
      kickoffTime: new Date("2026-06-16T22:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Netherlands",
      awayTeam: "Sweden",
      kickoffTime: new Date("2026-06-16T02:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Japan",
      awayTeam: "Tunisia",
      kickoffTime: new Date("2026-06-17T06:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Netherlands",
      awayTeam: "Tunisia",
      kickoffTime: new Date("2026-06-17T10:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Japan",
      awayTeam: "Sweden",
      kickoffTime: new Date("2026-06-17T14:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Belgium",
      awayTeam: "Egypt",
      kickoffTime: new Date("2026-06-17T18:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Iran",
      awayTeam: "New Zealand",
      kickoffTime: new Date("2026-06-17T22:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Belgium",
      awayTeam: "Iran",
      kickoffTime: new Date("2026-06-17T02:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Egypt",
      awayTeam: "New Zealand",
      kickoffTime: new Date("2026-06-18T06:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Belgium",
      awayTeam: "New Zealand",
      kickoffTime: new Date("2026-06-18T10:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Egypt",
      awayTeam: "Iran",
      kickoffTime: new Date("2026-06-18T14:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Spain",
      awayTeam: "Uruguay",
      kickoffTime: new Date("2026-06-18T18:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Saudi Arabia",
      awayTeam: "Cape Verde",
      kickoffTime: new Date("2026-06-18T22:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Spain",
      awayTeam: "Saudi Arabia",
      kickoffTime: new Date("2026-06-18T02:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Uruguay",
      awayTeam: "Cape Verde",
      kickoffTime: new Date("2026-06-19T06:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Spain",
      awayTeam: "Cape Verde",
      kickoffTime: new Date("2026-06-19T10:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Uruguay",
      awayTeam: "Saudi Arabia",
      kickoffTime: new Date("2026-06-19T14:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "France",
      awayTeam: "Senegal",
      kickoffTime: new Date("2026-06-19T18:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Norway",
      awayTeam: "Iraq",
      kickoffTime: new Date("2026-06-19T22:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "France",
      awayTeam: "Norway",
      kickoffTime: new Date("2026-06-19T02:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Senegal",
      awayTeam: "Iraq",
      kickoffTime: new Date("2026-06-20T06:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "France",
      awayTeam: "Iraq",
      kickoffTime: new Date("2026-06-20T10:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Senegal",
      awayTeam: "Norway",
      kickoffTime: new Date("2026-06-20T14:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Algeria",
      kickoffTime: new Date("2026-06-20T18:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Austria",
      awayTeam: "Jordan",
      kickoffTime: new Date("2026-06-20T22:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Austria",
      kickoffTime: new Date("2026-06-20T02:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Algeria",
      awayTeam: "Jordan",
      kickoffTime: new Date("2026-06-21T06:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Jordan",
      kickoffTime: new Date("2026-06-21T10:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Algeria",
      awayTeam: "Austria",
      kickoffTime: new Date("2026-06-21T14:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Portugal",
      awayTeam: "Colombia",
      kickoffTime: new Date("2026-06-21T18:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Uzbekistan",
      awayTeam: "DR Congo",
      kickoffTime: new Date("2026-06-21T22:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Portugal",
      awayTeam: "Uzbekistan",
      kickoffTime: new Date("2026-06-21T02:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Colombia",
      awayTeam: "DR Congo",
      kickoffTime: new Date("2026-06-22T06:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Portugal",
      awayTeam: "DR Congo",
      kickoffTime: new Date("2026-06-22T10:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Colombia",
      awayTeam: "Uzbekistan",
      kickoffTime: new Date("2026-06-22T14:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "England",
      awayTeam: "Croatia",
      kickoffTime: new Date("2026-06-22T18:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "Ghana",
      awayTeam: "Panama",
      kickoffTime: new Date("2026-06-22T22:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "England",
      awayTeam: "Ghana",
      kickoffTime: new Date("2026-06-22T02:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "Croatia",
      awayTeam: "Panama",
      kickoffTime: new Date("2026-06-23T06:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "England",
      awayTeam: "Panama",
      kickoffTime: new Date("2026-06-23T10:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "Croatia",
      awayTeam: "Ghana",
      kickoffTime: new Date("2026-06-23T14:00:00.000Z"),
      stage: "Group Stage (Group L)",
    }
  ];

  const seededWcFixtures = [];
  for (const f of wcFixtures) {
    const fixture = await prisma.fixture.create({ data: f });
    seededWcFixtures.push(fixture);
  }

  console.log("Seeding predictions...");
  
  // A helper function to generate random bets
  const getRandomScore = () => Math.floor(Math.random() * 4); // 0, 1, 2, or 3

  for (const user of seededUsers) {
    if (user.isAdmin) continue; // Admin doesn't play
    

    // Seed one future prediction for Yuliya & Sebastian to showcase lock icons
    if (user.name === "Yuliya") {
      await prisma.prediction.create({
        data: {
          userId: user.id,
          fixtureId: seededWcFixtures[2].id, // USA vs Ecuador
          homeBet: 2,
          awayBet: 1,
        },
      });
    } else if (user.name === "Sebastian") {
      await prisma.prediction.create({
        data: {
          userId: user.id,
          fixtureId: seededWcFixtures[2].id, // USA vs Ecuador
          homeBet: 3,
          awayBet: 0,
        },
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

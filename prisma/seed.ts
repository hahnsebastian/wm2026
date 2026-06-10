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
    { name: "Leila", pin: "5678", isAdmin: false },
  ];

  const seededUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    seededUsers.push(user);
  }

  console.log("Seeding fixtures...");
  // Past friendly fixtures for instant testing
  const friendly1 = await prisma.fixture.create({
    data: {
      homeTeam: "Italy",
      awayTeam: "Switzerland",
      kickoffTime: new Date("2026-05-20T18:00:00Z"),
      stage: "Warmup Friendly",
    },
  });

  const friendly2 = await prisma.fixture.create({
    data: {
      homeTeam: "Netherlands",
      awayTeam: "Portugal",
      kickoffTime: new Date("2026-05-22T20:00:00Z"),
      stage: "Warmup Friendly",
    },
  });

  const friendly3 = await prisma.fixture.create({
    data: {
      homeTeam: "Belgium",
      awayTeam: "Denmark",
      kickoffTime: new Date("2026-05-24T16:00:00Z"),
      stage: "Warmup Friendly",
    },
  });

    // Future World Cup 2026 fixtures
  const wcFixtures = [
    {
      homeTeam: "Mexico",
      awayTeam: "South Korea",
      kickoffTime: new Date("2026-06-11T12:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "South Africa",
      awayTeam: "Czechia",
      kickoffTime: new Date("2026-06-11T16:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "Mexico",
      awayTeam: "South Africa",
      kickoffTime: new Date("2026-06-11T20:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "South Korea",
      awayTeam: "Czechia",
      kickoffTime: new Date("2026-06-12T00:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "Mexico",
      awayTeam: "Czechia",
      kickoffTime: new Date("2026-06-12T04:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "South Korea",
      awayTeam: "South Africa",
      kickoffTime: new Date("2026-06-12T08:00:00.000Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "Canada",
      awayTeam: "Bosnia and Herzegovina",
      kickoffTime: new Date("2026-06-12T12:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Qatar",
      awayTeam: "Switzerland",
      kickoffTime: new Date("2026-06-12T16:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Canada",
      awayTeam: "Qatar",
      kickoffTime: new Date("2026-06-12T20:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Bosnia and Herzegovina",
      awayTeam: "Switzerland",
      kickoffTime: new Date("2026-06-13T00:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Canada",
      awayTeam: "Switzerland",
      kickoffTime: new Date("2026-06-13T04:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Bosnia and Herzegovina",
      awayTeam: "Qatar",
      kickoffTime: new Date("2026-06-13T08:00:00.000Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "Brazil",
      awayTeam: "Morocco",
      kickoffTime: new Date("2026-06-13T12:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Haiti",
      awayTeam: "Scotland",
      kickoffTime: new Date("2026-06-13T16:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Brazil",
      awayTeam: "Haiti",
      kickoffTime: new Date("2026-06-13T20:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Morocco",
      awayTeam: "Scotland",
      kickoffTime: new Date("2026-06-14T00:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Brazil",
      awayTeam: "Scotland",
      kickoffTime: new Date("2026-06-14T04:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Morocco",
      awayTeam: "Haiti",
      kickoffTime: new Date("2026-06-14T08:00:00.000Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "United States",
      awayTeam: "Paraguay",
      kickoffTime: new Date("2026-06-14T12:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "Australia",
      awayTeam: "Türkiye",
      kickoffTime: new Date("2026-06-14T16:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "United States",
      awayTeam: "Australia",
      kickoffTime: new Date("2026-06-14T20:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "Paraguay",
      awayTeam: "Türkiye",
      kickoffTime: new Date("2026-06-15T00:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "United States",
      awayTeam: "Türkiye",
      kickoffTime: new Date("2026-06-15T04:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "Paraguay",
      awayTeam: "Australia",
      kickoffTime: new Date("2026-06-15T08:00:00.000Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "Germany",
      awayTeam: "Côte d'Ivoire",
      kickoffTime: new Date("2026-06-15T12:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Ecuador",
      awayTeam: "Curaçao",
      kickoffTime: new Date("2026-06-15T16:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Germany",
      awayTeam: "Ecuador",
      kickoffTime: new Date("2026-06-15T20:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Côte d'Ivoire",
      awayTeam: "Curaçao",
      kickoffTime: new Date("2026-06-16T00:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Germany",
      awayTeam: "Curaçao",
      kickoffTime: new Date("2026-06-16T04:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Côte d'Ivoire",
      awayTeam: "Ecuador",
      kickoffTime: new Date("2026-06-16T08:00:00.000Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Spain",
      kickoffTime: new Date("2026-06-16T12:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Ukraine",
      awayTeam: "Zambia",
      kickoffTime: new Date("2026-06-16T16:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Ukraine",
      kickoffTime: new Date("2026-06-16T20:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Spain",
      awayTeam: "Zambia",
      kickoffTime: new Date("2026-06-17T00:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Zambia",
      kickoffTime: new Date("2026-06-17T04:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "Spain",
      awayTeam: "Ukraine",
      kickoffTime: new Date("2026-06-17T08:00:00.000Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "France",
      awayTeam: "Tunisia",
      kickoffTime: new Date("2026-06-17T12:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Honduras",
      awayTeam: "Denmark",
      kickoffTime: new Date("2026-06-17T16:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "France",
      awayTeam: "Honduras",
      kickoffTime: new Date("2026-06-17T20:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Tunisia",
      awayTeam: "Denmark",
      kickoffTime: new Date("2026-06-18T00:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "France",
      awayTeam: "Denmark",
      kickoffTime: new Date("2026-06-18T04:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Tunisia",
      awayTeam: "Honduras",
      kickoffTime: new Date("2026-06-18T08:00:00.000Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Belgium",
      awayTeam: "Algeria",
      kickoffTime: new Date("2026-06-18T12:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Panama",
      awayTeam: "Wales",
      kickoffTime: new Date("2026-06-18T16:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Belgium",
      awayTeam: "Panama",
      kickoffTime: new Date("2026-06-18T20:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Algeria",
      awayTeam: "Wales",
      kickoffTime: new Date("2026-06-19T00:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Belgium",
      awayTeam: "Wales",
      kickoffTime: new Date("2026-06-19T04:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Algeria",
      awayTeam: "Panama",
      kickoffTime: new Date("2026-06-19T08:00:00.000Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "Netherlands",
      awayTeam: "Senegal",
      kickoffTime: new Date("2026-06-19T12:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Costa Rica",
      awayTeam: "Serbia",
      kickoffTime: new Date("2026-06-19T16:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Netherlands",
      awayTeam: "Costa Rica",
      kickoffTime: new Date("2026-06-19T20:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Senegal",
      awayTeam: "Serbia",
      kickoffTime: new Date("2026-06-20T00:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Netherlands",
      awayTeam: "Serbia",
      kickoffTime: new Date("2026-06-20T04:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Senegal",
      awayTeam: "Costa Rica",
      kickoffTime: new Date("2026-06-20T08:00:00.000Z"),
      stage: "Group Stage (Group I)",
    },
    {
      homeTeam: "Portugal",
      awayTeam: "Mali",
      kickoffTime: new Date("2026-06-20T12:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Jamaica",
      awayTeam: "Romania",
      kickoffTime: new Date("2026-06-20T16:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Portugal",
      awayTeam: "Jamaica",
      kickoffTime: new Date("2026-06-20T20:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Mali",
      awayTeam: "Romania",
      kickoffTime: new Date("2026-06-21T00:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Portugal",
      awayTeam: "Romania",
      kickoffTime: new Date("2026-06-21T04:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Mali",
      awayTeam: "Jamaica",
      kickoffTime: new Date("2026-06-21T08:00:00.000Z"),
      stage: "Group Stage (Group J)",
    },
    {
      homeTeam: "Italy",
      awayTeam: "Nigeria",
      kickoffTime: new Date("2026-06-21T12:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "New Zealand",
      awayTeam: "Poland",
      kickoffTime: new Date("2026-06-21T16:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Italy",
      awayTeam: "New Zealand",
      kickoffTime: new Date("2026-06-21T20:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Nigeria",
      awayTeam: "Poland",
      kickoffTime: new Date("2026-06-22T00:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Italy",
      awayTeam: "Poland",
      kickoffTime: new Date("2026-06-22T04:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Nigeria",
      awayTeam: "New Zealand",
      kickoffTime: new Date("2026-06-22T08:00:00.000Z"),
      stage: "Group Stage (Group K)",
    },
    {
      homeTeam: "Colombia",
      awayTeam: "Egypt",
      kickoffTime: new Date("2026-06-22T12:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "El Salvador",
      awayTeam: "Japan",
      kickoffTime: new Date("2026-06-22T16:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "Colombia",
      awayTeam: "El Salvador",
      kickoffTime: new Date("2026-06-22T20:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "Egypt",
      awayTeam: "Japan",
      kickoffTime: new Date("2026-06-23T00:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "Colombia",
      awayTeam: "Japan",
      kickoffTime: new Date("2026-06-23T04:00:00.000Z"),
      stage: "Group Stage (Group L)",
    },
    {
      homeTeam: "Egypt",
      awayTeam: "El Salvador",
      kickoffTime: new Date("2026-06-23T08:00:00.000Z"),
      stage: "Group Stage (Group L)",
    }
  ];

  const seededWcFixtures = [];
  for (const f of wcFixtures) {
    const fixture = await prisma.fixture.create({ data: f });
    seededWcFixtures.push(fixture);
  }

  console.log("Seeding predictions...");
  // Create randomized predictions for all players for the warmup matches so they have something to resolve
  const pastFixtures = [friendly1, friendly2, friendly3];
  
  // A helper function to generate random bets
  const getRandomScore = () => Math.floor(Math.random() * 4); // 0, 1, 2, or 3

  for (const user of seededUsers) {
    if (user.isAdmin) continue; // Admin doesn't play
    
    // Seed predictions for past friendly fixtures
    for (const fixture of pastFixtures) {
      await prisma.prediction.create({
        data: {
          userId: user.id,
          fixtureId: fixture.id,
          homeBet: getRandomScore(),
          awayBet: getRandomScore(),
        },
      });
    }

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

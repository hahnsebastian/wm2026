import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
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
      awayTeam: "Sweden",
      kickoffTime: new Date("2026-06-11T18:00:00Z"),
      stage: "Group Stage (Group A)",
    },
    {
      homeTeam: "Canada",
      awayTeam: "Cameroon",
      kickoffTime: new Date("2026-06-12T16:00:00Z"),
      stage: "Group Stage (Group B)",
    },
    {
      homeTeam: "USA",
      awayTeam: "Ecuador",
      kickoffTime: new Date("2026-06-12T20:00:00Z"),
      stage: "Group Stage (Group D)",
    },
    {
      homeTeam: "Spain",
      awayTeam: "South Korea",
      kickoffTime: new Date("2026-06-13T15:00:00Z"),
      stage: "Group Stage (Group C)",
    },
    {
      homeTeam: "Germany",
      awayTeam: "Morocco",
      kickoffTime: new Date("2026-06-13T18:00:00Z"),
      stage: "Group Stage (Group E)",
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Australia",
      kickoffTime: new Date("2026-06-14T21:00:00Z"),
      stage: "Group Stage (Group F)",
    },
    {
      homeTeam: "France",
      awayTeam: "Japan",
      kickoffTime: new Date("2026-06-15T18:00:00Z"),
      stage: "Group Stage (Group G)",
    },
    {
      homeTeam: "Brazil",
      awayTeam: "Croatia",
      kickoffTime: new Date("2026-06-15T21:00:00Z"),
      stage: "Group Stage (Group H)",
    },
    {
      homeTeam: "England",
      awayTeam: "Colombia",
      kickoffTime: new Date("2026-06-16T18:00:00Z"),
      stage: "Group Stage (Group I)",
    },
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

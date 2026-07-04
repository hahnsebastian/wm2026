import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      orderBy: { name: "asc" },
    });

    const finishedFixtures = await prisma.fixture.findMany({
      where: { isFinished: true },
      orderBy: { kickoffTime: "asc" },
    });

    // 1. Gather all predictions for finished fixtures
    const allPredictions = await prisma.prediction.findMany({
      where: {
        fixture: { isFinished: true },
      },
    });

    // Compute stats for each user
    const userStats = users.map((user) => {
      const userPreds = allPredictions.filter((p) => p.userId === user.id);
      const totalPoints = userPreds.reduce((sum, p) => sum + (p.pointsEarned ?? 0), 0);
      const exactCount = userPreds.filter((p) => p.pointsEarned === 4 || p.pointsEarned === 6 || p.pointsEarned === 8).length;
      const diffCount = userPreds.filter((p) => p.pointsEarned === 2 || p.pointsEarned === 4).length - userPreds.filter((p) => p.pointsEarned === 4 || p.pointsEarned === 6 || p.pointsEarned === 8).length;

      // For more accurate breakdown, classify by checking against fixture results
      let exactMatches = 0;
      let diffMatches = 0;
      let outcomeMatches = 0;
      let wrongMatches = 0;

      for (const pred of userPreds) {
        const fix = finishedFixtures.find(f => f.id === pred.fixtureId);
        if (!fix || fix.homeGoals === null || fix.awayGoals === null) continue;

        const homeBet = pred.homeBet;
        const awayBet = pred.awayBet;
        const homeGoals = fix.homeGoals;
        const awayGoals = fix.awayGoals;

        if (homeBet === homeGoals && awayBet === awayGoals) {
          exactMatches++;
        } else {
          const betDiff = homeBet - awayBet;
          const actualDiff = homeGoals - awayGoals;
          const sameOutcome =
            (homeBet > awayBet && homeGoals > awayGoals) ||
            (awayBet > homeBet && awayGoals > homeGoals) ||
            (homeBet === awayBet && homeGoals === awayGoals);

          if (sameOutcome) {
            if (betDiff === actualDiff) {
              diffMatches++;
            } else {
              outcomeMatches++;
            }
          } else {
            wrongMatches++;
          }
        }
      }

      return {
        id: user.id,
        name: user.name,
        totalPoints,
        exactMatchesCount: exactMatches,
        diffMatchesCount: diffMatches,
        outcomeMatchesCount: outcomeMatches,
        wrongMatchesCount: wrongMatches,
        predictions: userPreds,
      };
    });

    // Sort to determine current ranks
    // Tiebreaker cascade: totalPoints DESC -> exactMatchesCount DESC -> name ASC
    const sortedCurrent = [...userStats].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.exactMatchesCount !== a.exactMatchesCount) {
        return b.exactMatchesCount - a.exactMatchesCount;
      }
      return a.name.localeCompare(b.name);
    });

    // Assign current ranks
    const currentRanks = new Map<string, number>();
    sortedCurrent.forEach((u, idx) => {
      currentRanks.set(u.id, idx + 1);
    });

    // 2. Determine previous ranks (excluding the most recent finished fixture)
    const prevRanks = new Map<string, number>();
    if (finishedFixtures.length > 0) {
      const lastFixture = finishedFixtures[finishedFixtures.length - 1];

      const prevUserStats = userStats.map((user) => {
        const prevPreds = user.predictions.filter((p) => p.fixtureId !== lastFixture.id);
        const prevPoints = prevPreds.reduce((sum, p) => sum + (p.pointsEarned ?? 0), 0);
        const prevExact = prevPreds.filter((p) => p.pointsEarned === 4).length;

        return {
          id: user.id,
          name: user.name,
          totalPoints: prevPoints,
          exactMatchesCount: prevExact,
        };
      });

      const sortedPrev = prevUserStats.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        if (b.exactMatchesCount !== a.exactMatchesCount) {
          return b.exactMatchesCount - a.exactMatchesCount;
        }
        return a.name.localeCompare(b.name);
      });

      sortedPrev.forEach((u, idx) => {
        prevRanks.set(u.id, idx + 1);
      });
    }

    // 3. Construct standings with trend indicator
    const standings = sortedCurrent.map((u) => {
      const currentRank = currentRanks.get(u.id) || 1;
      let trend = "stable"; // "up" | "down" | "stable"

      if (finishedFixtures.length > 0 && prevRanks.has(u.id)) {
        const prevRank = prevRanks.get(u.id) || 1;
        if (currentRank < prevRank) {
          trend = "up"; // Rank number went down (e.g. 5 -> 3), so rank improved
        } else if (currentRank > prevRank) {
          trend = "down"; // Rank number went up (e.g. 3 -> 5), so rank dropped
        }
      }

      return {
        userId: u.id,
        name: u.name,
        totalPoints: u.totalPoints,
        exactMatchesCount: u.exactMatchesCount,
        diffMatchesCount: u.diffMatchesCount,
        outcomeMatchesCount: u.outcomeMatchesCount,
        wrongMatchesCount: u.wrongMatchesCount,
        rank: currentRank,
        trend,
      };
    });

    // 4. Compile Standings Evolution Chart Data
    const chartData = [];

    // Starting baseline point (kickoff state: everyone at 0 points)
    const startPoint: any = { name: "Start" };
    users.forEach((user) => {
      startPoint[user.name] = 0;
    });
    chartData.push(startPoint);

    // Track running cumulative totals for each user
    const runningCumulative: Record<string, number> = {};
    users.forEach((user) => {
      runningCumulative[user.id] = 0;
    });

    for (let i = 0; i < finishedFixtures.length; i++) {
      const fix = finishedFixtures[i];
      const matchLabel = `M${i + 1}`;
      const dataPoint: any = { name: matchLabel };

      for (const user of users) {
        const pred = allPredictions.find(
          (p) => p.userId === user.id && p.fixtureId === fix.id
        );
        const pts = pred ? (pred.pointsEarned ?? 0) : 0;
        runningCumulative[user.id] += pts;
        dataPoint[user.name] = runningCumulative[user.id];
      }

      chartData.push(dataPoint);
    }

    return NextResponse.json({
      standings,
      chartData,
      totalMatchesPlayed: finishedFixtures.length,
      usersList: users.map((u) => u.name),
    });
  } catch (error) {
    console.error("Leaderboard route error:", error);
    return NextResponse.json({ error: "Failed to generate leaderboard" }, { status: 500 });
  }
}

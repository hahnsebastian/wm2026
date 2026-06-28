import { prisma } from "./db";

/**
 * Calculates the points earned for a prediction against the actual result.
 * 
 * Cascade Logic:
 * 1. Exact Match (Bet 2-1, Result 2-1) = 4 Points
 * 2. Correct Goal Difference or Draw Margin (Bet 3-1, Result 2-0; or Bet 1-1, Result 2-2) = 2 Points
 * 3. Correct Outcome Tendency (Winner/Draw matched, but score/difference wrong) = 1 Point
 * 4. Wrong Outcome = 0 Points
 */
export function calculatePoints(
  homeBet: number,
  awayBet: number,
  homeGoals: number,
  awayGoals: number,
  betAdvancingTeam?: string | null,
  actualAdvancingTeam?: string | null,
  stage?: string | null
): number {
  let basePoints = 0;

  if (homeBet === homeGoals && awayBet === awayGoals) {
    basePoints = 4; // Exact Score Match
  } else {
    const betDiff = homeBet - awayBet;
    const actualDiff = homeGoals - awayGoals;

    // Verify if same outcome (Home Win, Away Win, or Draw)
    const sameOutcome =
      (homeBet > awayBet && homeGoals > awayGoals) || // Home win
      (awayBet > homeBet && awayGoals > homeGoals) || // Away win
      (homeBet === awayBet && homeGoals === awayGoals); // Draw

    if (sameOutcome) {
      if (betDiff === actualDiff) {
        basePoints = 2; // Correct Goal Difference or Draw Margin
      } else {
        basePoints = 1; // Correct Outcome Tendency
      }
    }
  }

  // Multiplier logic
  let multiplier = 1;
  if (stage && stage.includes("Round of 16")) {
    multiplier = 2;
  }

  let totalPoints = basePoints * multiplier;

  // Advancing Team Bonus (also multiplied)
  if (betAdvancingTeam && actualAdvancingTeam && betAdvancingTeam === actualAdvancingTeam) {
    // Base 2 points for guessing who advances correctly, multiplied
    totalPoints += (2 * multiplier); 
  }

  return totalPoints;
}

/**
 * Re-computes all prediction points, user total points, and regenerates
 * the HistoricPointsLog chronologically. This ensures that any edit or out-of-order
 * resolution by the Admin keeps database tables perfectly synchronized.
 */
export async function recalculateAllUserPoints() {
  const users = await prisma.user.findMany();
  const fixtures = await prisma.fixture.findMany({
    orderBy: { kickoffTime: "asc" }
  });

  const finishedFixtures = fixtures.filter(f => f.isFinished);

  // 1. Recalculate points for all predictions of finished fixtures in the DB
  for (const fixture of finishedFixtures) {
    if (fixture.homeGoals === null || fixture.awayGoals === null) continue;

    const predictions = await prisma.prediction.findMany({
      where: { fixtureId: fixture.id }
    });

    for (const pred of predictions) {
      const pts = calculatePoints(
        pred.homeBet,
        pred.awayBet,
        fixture.homeGoals,
        fixture.awayGoals,
        pred.advancingTeam,
        fixture.advancingTeam,
        fixture.stage
      );

      if (pred.pointsEarned !== pts) {
        await prisma.prediction.update({
          where: { id: pred.id },
          data: { pointsEarned: pts }
        });
      }
    }
  }

  // 2. Recalculate each user's totalPoints
  for (const user of users) {
    // Predictions for finished fixtures
    const finishedPredictions = await prisma.prediction.findMany({
      where: {
        userId: user.id,
        fixture: { isFinished: true }
      }
    });

    let totalPoints = 0;
    for (const pred of finishedPredictions) {
      if (pred.pointsEarned !== null) {
        totalPoints += pred.pointsEarned;
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { totalPoints }
    });
  }

  // 3. Clear and rebuild the HistoricPointsLog chronologically
  await prisma.historicPointsLog.deleteMany({});

  // Track running totals for each user
  const runningPoints: Record<string, number> = {};
  for (const user of users) {
    runningPoints[user.id] = 0;
  }

  for (const fixture of finishedFixtures) {
    if (fixture.homeGoals === null || fixture.awayGoals === null) continue;

    const predictions = await prisma.prediction.findMany({
      where: { fixtureId: fixture.id }
    });

    for (const user of users) {
      const pred = predictions.find(p => p.userId === user.id);
      const pts = pred ? (pred.pointsEarned ?? 0) : 0;
      runningPoints[user.id] += pts;

      await prisma.historicPointsLog.create({
        data: {
          userId: user.id,
          fixtureId: fixture.id,
          cumulativePointsAtThisTime: runningPoints[user.id],
          timestamp: fixture.kickoffTime // Snapshot at the time of match kickoff
        }
      });
    }
  }
}

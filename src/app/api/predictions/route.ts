import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewerName = searchParams.get("viewer") || "";

    const predictions = await prisma.prediction.findMany({
      include: {
        fixture: {
          select: {
            kickoffTime: true,
            isFinished: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const now = new Date();

    const sanitizedPredictions = predictions.map((pred) => {
      const isOwnPrediction = pred.user.name.toLowerCase() === viewerName.toLowerCase();
      const isFinished = pred.fixture.isFinished;

      if (isOwnPrediction || isFinished) {
        return {
          id: pred.id,
          userId: pred.userId,
          userName: pred.user.name,
          fixtureId: pred.fixtureId,
          homeBet: pred.homeBet,
          awayBet: pred.awayBet,
          advancingTeam: pred.advancingTeam,
          pointsEarned: pred.pointsEarned,
          isMasked: false,
        };
      } else {
        return {
          id: pred.id,
          userId: pred.userId,
          userName: pred.user.name,
          fixtureId: pred.fixtureId,
          homeBet: null,
          awayBet: null,
          advancingTeam: null,
          pointsEarned: null,
          isMasked: true,
        };
      }
    });

    return NextResponse.json(sanitizedPredictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userName, fixtureId, homeBet, awayBet, advancingTeam } = await request.json();

    if (!userName || !fixtureId || homeBet === undefined || awayBet === undefined) {
      return NextResponse.json({ error: "Missing required prediction fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { name: userName },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
    });

    if (!fixture) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
    }

    // Verify if match is finished
    if (fixture.isFinished) {
      return NextResponse.json({ error: "Predictions are locked. This match has already finished!" }, { status: 400 });
    }

    // Upsert the prediction
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_fixtureId: {
          userId: user.id,
          fixtureId,
        },
      },
      update: {
        homeBet: Number(homeBet),
        awayBet: Number(awayBet),
        advancingTeam: advancingTeam || null,
      },
      create: {
        userId: user.id,
        fixtureId,
        homeBet: Number(homeBet),
        awayBet: Number(awayBet),
        advancingTeam: advancingTeam || null,
      },
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error submitting prediction:", error);
    return NextResponse.json({ error: "Failed to submit prediction" }, { status: 500 });
  }
}

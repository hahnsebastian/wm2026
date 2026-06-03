import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recalculateAllUserPoints } from "@/lib/points";

export async function GET() {
  try {
    const fixtures = await prisma.fixture.findMany({
      orderBy: { kickoffTime: "asc" },
    });
    return NextResponse.json(fixtures);
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return NextResponse.json({ error: "Failed to fetch fixtures" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminPin = request.headers.get("x-admin-pin");

    if (adminPin !== "9999") {
      return NextResponse.json({ error: "Unauthorized. Invalid Admin PIN." }, { status: 403 });
    }

    const { fixtureId, homeGoals, awayGoals, isFinished } = await request.json();

    if (!fixtureId) {
      return NextResponse.json({ error: "Missing fixture ID" }, { status: 400 });
    }

    const hasScore = homeGoals !== null && homeGoals !== undefined && awayGoals !== null && awayGoals !== undefined;

    // Update the fixture
    await prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        homeGoals: hasScore ? Number(homeGoals) : null,
        awayGoals: hasScore ? Number(awayGoals) : null,
        isFinished: !!isFinished,
      },
    });

    // Run the self-healing points and history progression engine!
    await recalculateAllUserPoints();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resolving fixture:", error);
    return NextResponse.json({ error: "Failed to resolve fixture" }, { status: 500 });
  }
}

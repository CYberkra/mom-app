import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Check database connection
    const userCount = await prisma.user.count();
    const hymnCount = await prisma.hymn.count();
    const devotionCount = await prisma.dailyDevotion.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      counts: {
        users: userCount,
        hymns: hymnCount,
        devotions: devotionCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database check failed:", error);
    
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
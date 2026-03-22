import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Search query is required",
        timestamp: new Date().toISOString(),
      });
    }

    // Search hymns by title, number, firstLine, tags, or lyrics
    const hymns = await prisma.hymn.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { number: { contains: query } },
          { firstLine: { contains: query } },
          { tags: { contains: query } },
          { lyrics: { contains: query } },
        ],
      },
      orderBy: [
        { number: "asc" },
        { title: "asc" },
      ],
      take: limit,
      include: {
        favorites: true,
      },
    });

    // Transform to include favorite status
    const searchResults = hymns.map(hymn => ({
      id: hymn.id,
      title: hymn.title,
      number: hymn.number,
      firstLine: hymn.firstLine,
      preview: hymn.lyrics.substring(0, 100) + (hymn.lyrics.length > 100 ? "..." : ""),
      tags: hymn.tags,
      isFavorited: hymn.favorites.length > 0,
    }));

    return NextResponse.json({
      success: true,
      data: searchResults,
      query,
      count: searchResults.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error searching hymns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search hymns" },
      { status: 500 }
    );
  }
}
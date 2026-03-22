import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const favorites = searchParams.get("favorites") === "true";

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { number: { contains: search } },
        { firstLine: { contains: search } },
        { tags: { contains: search } },
        { lyrics: { contains: search } },
      ];
    }

    // Get hymns with pagination
    const hymns = await prisma.hymn.findMany({
      where,
      orderBy: [
        { number: "asc" },
        { title: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        favorites: true,
      },
    });

    // Get total count
    const total = await prisma.hymn.count({ where });

    // Transform to include favorite status
    const transformedHymns = hymns.map(hymn => ({
      id: hymn.id,
      title: hymn.title,
      number: hymn.number,
      firstLine: hymn.firstLine,
      lyrics: hymn.lyrics,
      tags: hymn.tags,
      source: hymn.source,
      isFavorited: hymn.favorites.length > 0,
      createdAt: hymn.createdAt.toISOString(),
      updatedAt: hymn.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: transformedHymns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching hymns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hymns" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { title, number, firstLine, lyrics, tags, source } = body;

    // Validate required fields
    if (!title || !lyrics) {
      return NextResponse.json(
        { success: false, error: "Title and lyrics are required" },
        { status: 400 }
      );
    }

    // Create new hymn
    const hymn = await prisma.hymn.create({
      data: {
        title,
        number: number || null,
        firstLine: firstLine || null,
        lyrics,
        tags: tags || null,
        source: source || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: hymn.id,
        title: hymn.title,
        number: hymn.number,
        firstLine: hymn.firstLine,
        lyrics: hymn.lyrics,
        tags: hymn.tags,
        source: hymn.source,
        isFavorited: false,
        createdAt: hymn.createdAt.toISOString(),
        updatedAt: hymn.updatedAt.toISOString(),
      },
      message: "Hymn created successfully",
    });
  } catch (error) {
    console.error("Error creating hymn:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create hymn" },
      { status: 500 }
    );
  }
}
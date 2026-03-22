import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid hymn ID" },
        { status: 400 }
      );
    }

    // Get hymn with favorites
    const hymn = await prisma.hymn.findUnique({
      where: { id },
      include: {
        favorites: true,
      },
    });

    if (!hymn) {
      return NextResponse.json(
        { success: false, error: "Hymn not found" },
        { status: 404 }
      );
    }

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
        isFavorited: hymn.favorites.length > 0,
        createdAt: hymn.createdAt.toISOString(),
        updatedAt: hymn.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching hymn:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hymn" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid hymn ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, number, firstLine, lyrics, tags, source } = body;

    // Check if hymn exists
    const existingHymn = await prisma.hymn.findUnique({
      where: { id },
    });

    if (!existingHymn) {
      return NextResponse.json(
        { success: false, error: "Hymn not found" },
        { status: 404 }
      );
    }

    // Update hymn
    const updatedHymn = await prisma.hymn.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingHymn.title,
        number: number !== undefined ? number : existingHymn.number,
        firstLine: firstLine !== undefined ? firstLine : existingHymn.firstLine,
        lyrics: lyrics !== undefined ? lyrics : existingHymn.lyrics,
        tags: tags !== undefined ? tags : existingHymn.tags,
        source: source !== undefined ? source : existingHymn.source,
        updatedAt: new Date(),
      },
      include: {
        favorites: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedHymn.id,
        title: updatedHymn.title,
        number: updatedHymn.number,
        firstLine: updatedHymn.firstLine,
        lyrics: updatedHymn.lyrics,
        tags: updatedHymn.tags,
        source: updatedHymn.source,
        isFavorited: updatedHymn.favorites.length > 0,
        createdAt: updatedHymn.createdAt.toISOString(),
        updatedAt: updatedHymn.updatedAt.toISOString(),
      },
      message: "Hymn updated successfully",
    });
  } catch (error) {
    console.error("Error updating hymn:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hymn" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid hymn ID" },
        { status: 400 }
      );
    }

    // Check if hymn exists
    const existingHymn = await prisma.hymn.findUnique({
      where: { id },
    });

    if (!existingHymn) {
      return NextResponse.json(
        { success: false, error: "Hymn not found" },
        { status: 404 }
      );
    }

    // Delete related favorites first
    await prisma.favorite.deleteMany({
      where: { hymnId: id },
    });

    // Delete hymn
    await prisma.hymn.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Hymn deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hymn:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete hymn" },
      { status: 500 }
    );
  }
}
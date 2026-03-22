import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    
    // Build where clause
    const where: any = {};
    if (type) {
      where.type = type;
    }
    
    // Get favorites with related data
    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        devotion: true,
        verse: true,
        explanation: true,
        journal: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Transform to response format
    const transformedFavorites = favorites.map(favorite => {
      let title = "";
      let reference = "";
      let preview = "";
      
      if (favorite.type === "devotion" && favorite.devotion) {
        title = favorite.devotion.title;
        reference = favorite.devotion.scriptureRef;
        preview = favorite.devotion.scriptureText.substring(0, 50) + "...";
      } else if (favorite.type === "verse" && favorite.verse) {
        title = favorite.verse.scriptureRef;
        reference = favorite.verse.scriptureRef;
        preview = favorite.verse.scriptureText.substring(0, 50) + "...";
      } else if (favorite.type === "explanation" && favorite.explanation) {
        title = `关于 ${favorite.explanation.query} 的解释`;
        reference = favorite.explanation.query;
        preview = favorite.explanation.explanation.substring(0, 50) + "...";
      } else if (favorite.type === "journal" && favorite.journal) {
        title = favorite.journal.aiSummary || "今天的记录";
        reference = favorite.journal.entryDate.toISOString().split('T')[0];
        preview = favorite.journal.content.substring(0, 50) + "...";
      }
      
      return {
        id: favorite.id,
        type: favorite.type,
        referenceId: favorite.devotionId || favorite.verseId || favorite.explanationId || favorite.journalId,
        title,
        reference,
        preview,
        createdAt: favorite.createdAt.toISOString(),
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedFavorites,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, referenceId, title, reference, preview } = body;
    
    if (!type || !referenceId) {
      return NextResponse.json(
        { success: false, error: "Type and referenceId are required" },
        { status: 400 }
      );
    }
    
    // Check if already favorited
    const existing = await prisma.favorite.findFirst({
      where: {
        type,
        [`${type}Id`]: referenceId,
      },
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already in favorites" },
        { status: 400 }
      );
    }
    
    // Create favorite with appropriate relation
    const createData: any = { type };
    if (type === "devotion") {
      createData.devotionId = referenceId;
    } else if (type === "verse") {
      createData.verseId = referenceId;
    } else if (type === "explanation") {
      createData.explanationId = referenceId;
    } else if (type === "journal") {
      createData.journalId = referenceId;
    }
    
    const favorite = await prisma.favorite.create({
      data: createData,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: favorite.id,
        type: favorite.type,
        referenceId,
        title: title || "",
        reference: reference || "",
        preview: preview || "",
        createdAt: favorite.createdAt.toISOString(),
      },
      message: "Added to favorites successfully",
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");
    const type = searchParams.get("type");
    const referenceId = parseInt(searchParams.get("referenceId") || "0");
    
    if (id) {
      // Delete by ID
      await prisma.favorite.delete({
        where: { id },
      });
    } else if (type && referenceId) {
      // Delete by type and referenceId
      const where: any = { type };
      where[`${type}Id`] = referenceId;
      
      await prisma.favorite.deleteMany({
        where,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "ID or type+referenceId required" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Removed from favorites successfully",
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
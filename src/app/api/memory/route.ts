import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get all memory verses with their practice logs
    const verses = await prisma.memoryVerse.findMany({
      include: {
        practiceLogs: {
          orderBy: {
            practiceDate: 'desc',
          },
        },
        favorites: true,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });
    
    // Transform to response format
    const transformedVerses = verses.map(verse => {
      // Calculate practice stats
      const practiceCount = verse.practiceLogs.length;
      const lastPracticed = verse.practiceLogs[0]?.practiceDate || null;
      
      // Calculate streak (simplified)
      let streak = 0;
      if (verse.practiceLogs.length > 0) {
        // For simplicity, use the streak from the most recent practice log
        streak = verse.practiceLogs[0]?.streak || 0;
      }
      
      // Check if favorited
      const isFavorite = verse.favorites.length > 0;
      
      return {
        id: verse.id,
        reference: verse.scriptureRef,
        text: verse.scriptureText,
        isFavorite,
        practiceCount,
        streak,
        lastPracticed: lastPracticed ? lastPracticed.toISOString().split('T')[0] : null,
        createdAt: verse.addedAt.toISOString().split('T')[0],
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedVerses,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching memory verses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch memory verses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, text } = body;
    
    if (!reference || !text) {
      return NextResponse.json(
        { success: false, error: "Reference and text are required" },
        { status: 400 }
      );
    }
    
    // Create new memory verse
    const verse = await prisma.memoryVerse.create({
      data: {
        scriptureRef: reference,
        scriptureText: text,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: verse.id,
        reference: verse.scriptureRef,
        text: verse.scriptureText,
        isFavorite: false,
        practiceCount: 0,
        streak: 0,
        lastPracticed: null,
        createdAt: verse.addedAt.toISOString().split('T')[0],
      },
      message: "Verse added successfully",
    });
  } catch (error) {
    console.error("Error adding memory verse:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add memory verse" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }
    
    switch (action) {
      case "practice":
        // Create practice log
        const practiceLog = await prisma.memoryPracticeLog.create({
          data: {
            memoryVerseId: id,
            practiceDate: new Date(),
            score: updateData.score || 80,
            completed: true,
            streak: updateData.streak || 1,
          },
        });
        
        return NextResponse.json({
          success: true,
          data: {
            practiceLogId: practiceLog.id,
            message: "Practice recorded",
          },
        });
        
      case "toggleFavorite":
        // Check if already favorited
        const existingFavorite = await prisma.favorite.findFirst({
          where: {
            type: "verse",
            verseId: id,
          },
        });
        
        if (existingFavorite) {
          // Remove from favorites
          await prisma.favorite.delete({
            where: { id: existingFavorite.id },
          });
        } else {
          // Add to favorites
          await prisma.favorite.create({
            data: {
              type: "verse",
              verseId: id,
            },
          });
        }
        
        return NextResponse.json({
          success: true,
          message: existingFavorite ? "Removed from favorites" : "Added to favorites",
        });
        
      default:
        // Update verse content
        const updatedVerse = await prisma.memoryVerse.update({
          where: { id },
          data: updateData,
        });
        
        return NextResponse.json({
          success: true,
          data: {
            id: updatedVerse.id,
            reference: updatedVerse.scriptureRef,
            text: updatedVerse.scriptureText,
            createdAt: updatedVerse.addedAt.toISOString().split('T')[0],
          },
          message: "Verse updated successfully",
        });
    }
  } catch (error) {
    console.error("Error updating memory verse:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update memory verse" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }
    
    // Delete related practice logs first
    await prisma.memoryPracticeLog.deleteMany({
      where: { memoryVerseId: id },
    });
    
    // Delete related favorites
    await prisma.favorite.deleteMany({
      where: { verseId: id },
    });
    
    // Delete the verse
    await prisma.memoryVerse.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Verse deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting memory verse:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete memory verse" },
      { status: 500 }
    );
  }
}
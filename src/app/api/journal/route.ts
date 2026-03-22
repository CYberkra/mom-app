import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAIClient } from "@/lib/ai/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Build where clause
    const where: any = {};
    
    // For now, we don't have category field in JournalEntry model
    // We'll filter by content containing category or search term
    
    // Get journal entries
    let entries = await prisma.journalEntry.findMany({
      orderBy: {
        entryDate: 'desc',
      },
      take: limit,
    });
    
    // Apply filters
    if (category) {
      entries = entries.filter(entry => 
        entry.content.includes(category) || 
        (entry.aiSummary && entry.aiSummary.includes(category))
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      entries = entries.filter(entry => 
        entry.content.toLowerCase().includes(searchLower) ||
        (entry.aiSummary && entry.aiSummary.toLowerCase().includes(searchLower))
      );
    }
    
    // Transform to response format
    const transformedEntries = entries.map(entry => {
      // Extract category from content (simple heuristic)
      let category = "感动";
      if (entry.content.includes("祷告") || entry.content.includes("代祷")) {
        category = "代祷";
      } else if (entry.content.includes("感恩") || entry.content.includes("感谢")) {
        category = "感恩";
      } else if (entry.content.includes("学习") || entry.content.includes("收获")) {
        category = "收获";
      }
      
      // Generate tags from content
      const tags = [];
      if (entry.content.includes("祷告")) tags.push("祷告");
      if (entry.content.includes("读经")) tags.push("读经");
      if (entry.content.includes("神")) tags.push("神");
      if (entry.content.includes("爱")) tags.push("爱");
      
      return {
        id: entry.id,
        date: entry.entryDate.toISOString().split('T')[0],
        content: entry.content,
        aiSummary: entry.aiSummary || "",
        category,
        tags: tags.slice(0, 3),
        createdAt: entry.createdAt.toISOString(),
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedEntries,
      total: entries.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;
    
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }
    
    // Get the first user
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Process with AI client
    const aiClient = getAIClient();
    const aiResponse = await aiClient.processJournalEntry(content);
    
    let aiSummary = content.length > 50 ? content.substring(0, 50) + "..." : content;
    let category = "感动";
    let tags: string[] = [];
    
    if (aiResponse.success && aiResponse.data) {
      aiSummary = aiResponse.data.summary;
      category = aiResponse.data.category;
      tags = aiResponse.data.tags;
    } else {
      // Fallback to simple processing
      if (content.includes("祷告") || content.includes("代祷")) {
        category = "代祷";
      } else if (content.includes("感恩") || content.includes("感谢")) {
        category = "感恩";
      } else if (content.includes("学习") || content.includes("收获")) {
        category = "收获";
      }
      
      // Generate tags
      if (content.includes("祷告")) tags.push("祷告");
      if (content.includes("读经")) tags.push("读经");
      if (content.includes("神")) tags.push("神");
      if (content.includes("爱")) tags.push("爱");
    }
    
    // Create journal entry
    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        entryDate: new Date(),
        content: content.trim(),
        aiSummary,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: entry.id,
        date: entry.entryDate.toISOString().split('T')[0],
        content: entry.content,
        aiSummary: entry.aiSummary,
        category,
        tags: tags.slice(0, 3),
        createdAt: entry.createdAt.toISOString(),
      },
      message: "Journal entry saved successfully",
    });
  } catch (error) {
    console.error("Error saving journal entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save journal entry" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }
    
    // For simplicity, we'll just update the content and regenerate AI summary
    if (updateData.content) {
      updateData.aiSummary = updateData.content.length > 50 
        ? updateData.content.substring(0, 50) + "..."
        : updateData.content;
    }
    
    const updatedEntry = await prisma.journalEntry.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: updatedEntry.id,
        date: updatedEntry.entryDate.toISOString().split('T')[0],
        content: updatedEntry.content,
        aiSummary: updatedEntry.aiSummary,
        createdAt: updatedEntry.createdAt.toISOString(),
      },
      message: "Journal entry updated successfully",
    });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update journal entry" },
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
    
    await prisma.journalEntry.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}
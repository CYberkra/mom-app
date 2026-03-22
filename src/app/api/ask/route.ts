import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAIClient } from "@/lib/ai/client";

export async function POST(request: Request) {
  try {
    const { query, type = "explanation" } = await request.json();
    
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }
    
    // Check if we already have an explanation for this query
    const existingExplanation = await prisma.scriptureExplanation.findFirst({
      where: {
        query: query,
      },
    });
    
    // Get AI client
    const aiClient = getAIClient();
    
    let resultData: any;
    
    if (existingExplanation) {
      // Use existing explanation from database
      resultData = {
        query: existingExplanation.query,
        explanation: existingExplanation.explanation,
        simpleExplanation: existingExplanation.simpleExplanation,
        lifeExample: existingExplanation.lifeExample,
      };
      
      // If requesting simple or example and we don't have it, generate it
      if (type === "simple" && !existingExplanation.simpleExplanation) {
        const aiResponse = await aiClient.simplifyExplanation(query, existingExplanation.explanation);
        if (aiResponse.success && aiResponse.data) {
          resultData.simpleExplanation = aiResponse.data.simpleExplanation;
          
          // Update database with new simpleExplanation
          await prisma.scriptureExplanation.update({
            where: { id: existingExplanation.id },
            data: { simpleExplanation: aiResponse.data.simpleExplanation },
          });
        }
      } else if (type === "example" && !existingExplanation.lifeExample) {
        const aiResponse = await aiClient.generateLifeExample(query, existingExplanation.explanation);
        if (aiResponse.success && aiResponse.data) {
          resultData.lifeExample = aiResponse.data.lifeExample;
          
          // Update database with new lifeExample
          await prisma.scriptureExplanation.update({
            where: { id: existingExplanation.id },
            data: { lifeExample: aiResponse.data.lifeExample },
          });
        }
      }
    } else {
      // Generate new explanation using AI
      const aiResponse = await aiClient.explainScripture(query);
      
      if (!aiResponse.success || !aiResponse.data) {
        return NextResponse.json(
          { success: false, error: "Failed to generate explanation" },
          { status: 500 }
        );
      }
      
      resultData = aiResponse.data;
      
      // Save to database
      await prisma.scriptureExplanation.create({
        data: {
          query: query,
          explanation: aiResponse.data.explanation,
          simpleExplanation: aiResponse.data.simpleExplanation || null,
          lifeExample: aiResponse.data.lifeExample || null,
        },
      });
    }
    
    // Return based on type
    let result;
    switch (type) {
      case "simple":
        result = resultData.simpleExplanation || "简化解释暂不可用";
        break;
      case "example":
        result = resultData.lifeExample || "生活例子暂不可用";
        break;
      default:
        result = resultData.explanation;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        query,
        type,
        result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing ask request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query parameter is required" },
        { status: 400 }
      );
    }
    
    // Find explanation for the query
    const explanation = await prisma.scriptureExplanation.findFirst({
      where: {
        query: query,
      },
    });
    
    if (!explanation) {
      return NextResponse.json({
        success: true,
        data: {
          query,
          explanation: null,
          simpleExplanation: null,
          lifeExample: null,
          exists: false,
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        query: explanation.query,
        explanation: explanation.explanation,
        simpleExplanation: explanation.simpleExplanation,
        lifeExample: explanation.lifeExample,
        exists: true,
        createdAt: explanation.createdAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching explanation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch explanation" },
      { status: 500 }
    );
  }
}
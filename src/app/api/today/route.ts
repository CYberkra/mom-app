import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAIClient } from "@/lib/ai/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
    } else {
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }
    
    // Find devotion for the target date
    const devotion = await prisma.dailyDevotion.findFirst({
      where: {
        date: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });
    
    if (devotion) {
      return NextResponse.json({
        success: true,
        data: {
          id: devotion.id,
          date: devotion.date.toISOString().split('T')[0],
          title: devotion.title,
          scriptureRef: devotion.scriptureRef,
          scriptureText: devotion.scriptureText,
          explanation: devotion.explanation,
          keywords: devotion.keywords,
          reflectionQuestions: devotion.reflectionQuestions,
          prayer: devotion.prayer,
          reminder: "", // Not in schema, can be derived
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    // If no devotion in database, generate with AI
    const aiClient = getAIClient();
    const aiResponse = await aiClient.generateDevotion(targetDate);
    
    if (aiResponse.success && aiResponse.data) {
      // Save to database for future use
      const newDevotion = await prisma.dailyDevotion.create({
        data: {
          date: targetDate,
          title: aiResponse.data.title,
          scriptureRef: aiResponse.data.scriptureRef,
          scriptureText: aiResponse.data.scriptureText,
          explanation: aiResponse.data.explanation,
          keywords: aiResponse.data.keywords,
          reflectionQuestions: aiResponse.data.reflectionQuestions,
          prayer: aiResponse.data.prayer,
        },
      });
      
      return NextResponse.json({
        success: true,
        data: {
          id: newDevotion.id,
          date: newDevotion.date.toISOString().split('T')[0],
          title: newDevotion.title,
          scriptureRef: newDevotion.scriptureRef,
          scriptureText: newDevotion.scriptureText,
          explanation: newDevotion.explanation,
          keywords: newDevotion.keywords,
          reflectionQuestions: newDevotion.reflectionQuestions,
          prayer: newDevotion.prayer,
          reminder: aiResponse.data.reminder,
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    // Final fallback to hardcoded data
    const dateString = targetDate.toISOString().split('T')[0];
    
    return NextResponse.json({
      success: true,
      data: {
        id: 0,
        date: dateString,
        title: "神的爱永不改变",
        scriptureRef: "约翰福音 3:16",
        scriptureText: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。",
        explanation: "这节经文告诉我们，神对人的爱是如此深厚，以至于祂愿意把自己的独生子耶稣赐给我们。这种爱不是因为我们有多好，而是因为神本身就是爱。祂希望我们相信耶稣，这样我们就不会永远灭亡，而是能得到永远的生命。",
        keywords: "独生子：指耶稣基督。赐给：无偿地给予。信他：相信并接受耶稣。灭亡：永远的死亡和分离。永生：永远的生命，与神同在。",
        reflectionQuestions: "1. 神为什么愿意把祂的独生子给我们？\n2. 我今天如何回应神的这份爱？\n3. 我怎样向身边的人分享这份爱？",
        prayer: "亲爱的天父，感谢你爱我，甚至将你的独生子赐给我。帮助我今天能感受到你的爱，并将这份爱分享给我遇到的每一个人。奉耶稣的名祷告，阿们。",
        reminder: "今天试着对三个人说一句鼓励的话，让他们感受到神的爱。",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching devotion:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch devotion data" },
      { status: 500 }
    );
  }
}
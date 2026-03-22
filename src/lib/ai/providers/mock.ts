import { AIProvider, AIResponse, ScriptureExplanationResponse, DevotionGenerationResponse, JournalSummaryResponse, FALLBACK_CONTENT } from '../types';

export class MockProvider implements AIProvider {
  name = 'mock' as const;

  async explainScripture(query: string): Promise<AIResponse<ScriptureExplanationResponse>> {
    // Simulate AI delay
    await this.delay(500);
    
    // Mock explanations for common scripture references
    const mockExplanations: Record<string, ScriptureExplanationResponse> = {
      "约翰福音 3:16": {
        query: "约翰福音 3:16",
        explanation: "这节经文告诉我们，神对人的爱是如此深厚，以至于祂愿意把自己的独生子耶稣赐给我们。这种爱不是因为我们有多好，而是因为神本身就是爱。祂希望我们相信耶稣，这样我们就不会永远灭亡，而是能得到永远的生命。",
        simpleExplanation: "就像父母爱孩子，愿意把最好的给孩子一样，神爱我们，甚至把祂的儿子耶稣赐给我们。只要我们相信耶稣，就能得到永远的生命。",
        lifeExample: "就像爷爷奶奶总是把最好的留给你，自己舍不得吃用。神也是这样，祂太爱我们了，甚至把最宝贵的耶稣赐给我们。",
        timestamp: new Date().toISOString(),
      },
      "希伯来书 11:1": {
        query: "希伯来书 11:1",
        explanation: "信心就像一张看不见的契约，让我们对将来要发生的事有把握。就像我们相信太阳明天会升起一样，虽然还没看见，但我们心里有把握。对神的信心也是如此，虽然看不见神，但我们心里知道祂是真实的，祂的应许一定会实现。",
        simpleExplanation: "信心就是相信神，就像孩子相信父母一样。",
        lifeExample: "就像你相信爸爸妈妈会照顾你，不用担心明天吃什么穿什么。信心就是相信神会照顾我们的一切需要。",
        timestamp: new Date().toISOString(),
      },
      "诗篇 23:1": {
        query: "诗篇 23:1",
        explanation: "大卫将神比作牧人，我们就像羊群。牧人照顾羊群的一切需要：食物、水、安全、引导。同样，神也照顾我们的一切需要，使我们不至缺乏任何真正重要的东西。",
        simpleExplanation: "神就像一位好牧人，照顾我们所有的需要，使我们什么都不缺。",
        lifeExample: "就像爸爸妈妈照顾你的吃穿住行，神也这样细心照顾我们，不会让我们缺少真正需要的东西。",
        timestamp: new Date().toISOString(),
      },
    };
    
    // Check for exact match
    if (mockExplanations[query]) {
      return {
        success: true,
        data: mockExplanations[query],
        provider: 'mock',
        timestamp: new Date().toISOString(),
      };
    }
    
    // Check for partial match
    for (const [key, value] of Object.entries(mockExplanations)) {
      if (query.includes(key) || key.includes(query)) {
        return {
          success: true,
          data: { ...value, query },
          provider: 'mock',
          timestamp: new Date().toISOString(),
        };
      }
    }
    
    // Return fallback
    return {
      success: true,
      data: {
        query,
        explanation: FALLBACK_CONTENT.scriptureExplanation.explanation,
        simpleExplanation: FALLBACK_CONTENT.scriptureExplanation.simpleExplanation,
        lifeExample: FALLBACK_CONTENT.scriptureExplanation.lifeExample,
        timestamp: new Date().toISOString(),
      },
      provider: 'mock',
      timestamp: new Date().toISOString(),
    };
  }

  async simplifyExplanation(query: string, originalExplanation: string): Promise<AIResponse<ScriptureExplanationResponse>> {
    await this.delay(300);
    
    return {
      success: true,
      data: {
        query,
        explanation: originalExplanation,
        simpleExplanation: `再讲简单一点：\n\n${FALLBACK_CONTENT.scriptureExplanation.simpleExplanation}`,
        timestamp: new Date().toISOString(),
      },
      provider: 'mock',
      timestamp: new Date().toISOString(),
    };
  }

  async generateLifeExample(query: string, originalExplanation: string): Promise<AIResponse<ScriptureExplanationResponse>> {
    await this.delay(300);
    
    return {
      success: true,
      data: {
        query,
        explanation: originalExplanation,
        lifeExample: `生活例子：\n\n${FALLBACK_CONTENT.scriptureExplanation.lifeExample}`,
        timestamp: new Date().toISOString(),
      },
      provider: 'mock',
      timestamp: new Date().toISOString(),
    };
  }

  async generateDevotion(date: Date): Promise<AIResponse<DevotionGenerationResponse>> {
    await this.delay(800);
    
    const dateString = date.toISOString().split('T')[0];
    
    // Mock devotions for different dates
    const devotions: Record<string, DevotionGenerationResponse> = {
      [dateString]: {
        title: FALLBACK_CONTENT.devotion.title,
        scriptureRef: FALLBACK_CONTENT.devotion.scriptureRef,
        scriptureText: FALLBACK_CONTENT.devotion.scriptureText,
        explanation: FALLBACK_CONTENT.devotion.explanation,
        keywords: FALLBACK_CONTENT.devotion.keywords,
        reflectionQuestions: FALLBACK_CONTENT.devotion.reflectionQuestions,
        prayer: FALLBACK_CONTENT.devotion.prayer,
        reminder: FALLBACK_CONTENT.devotion.reminder,
      },
    };
    
    return {
      success: true,
      data: devotions[dateString] || devotions[dateString],
      provider: 'mock',
      timestamp: new Date().toISOString(),
    };
  }

  async processJournalEntry(content: string): Promise<AIResponse<JournalSummaryResponse>> {
    await this.delay(400);
    
    // Simple categorization based on keywords
    let category = '感动';
    if (content.includes('祷告') || content.includes('代祷')) {
      category = '代祷';
    } else if (content.includes('感恩') || content.includes('感谢')) {
      category = '感恩';
    } else if (content.includes('学习') || content.includes('收获')) {
      category = '收获';
    } else if (content.includes('反思') || content.includes('省察')) {
      category = '反思';
    }
    
    // Extract tags
    const tags = [];
    if (content.includes('祷告')) tags.push('祷告');
    if (content.includes('读经')) tags.push('读经');
    if (content.includes('神')) tags.push('神');
    if (content.includes('爱')) tags.push('爱');
    if (content.includes('家人')) tags.push('家人');
    
    // Generate summary
    const summary = content.length > 50 
      ? content.substring(0, 50) + '...'
      : content;
    
    return {
      success: true,
      data: {
        originalContent: content,
        summary: `${FALLBACK_CONTENT.journal.summary}: ${summary}`,
        category,
        tags: tags.slice(0, 3),
      },
      provider: 'mock',
      timestamp: new Date().toISOString(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
// AI response types for structured outputs

// Scripture explanation response
export interface ScriptureExplanationResponse {
  query: string;
  explanation: string;
  simpleExplanation?: string;
  lifeExample?: string;
  timestamp: string;
}

// Devotion generation response
export interface DevotionGenerationResponse {
  title: string;
  scriptureRef: string;
  scriptureText: string;
  explanation: string;
  keywords: string;
  reflectionQuestions: string;
  prayer: string;
  reminder: string;
}

// Journal summary response
export interface JournalSummaryResponse {
  originalContent: string;
  summary: string;
  category: string;
  tags: string[];
}

// Generic AI response wrapper
export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider: 'mock' | 'kimi';
  timestamp: string;
}

// Provider interface
export interface AIProvider {
  name: 'mock' | 'kimi';
  
  // Scripture explanation
  explainScripture(query: string): Promise<AIResponse<ScriptureExplanationResponse>>;
  simplifyExplanation(query: string, originalExplanation: string): Promise<AIResponse<ScriptureExplanationResponse>>;
  generateLifeExample(query: string, originalExplanation: string): Promise<AIResponse<ScriptureExplanationResponse>>;
  
  // Devotion generation
  generateDevotion(date: Date): Promise<AIResponse<DevotionGenerationResponse>>;
  
  // Journal processing
  processJournalEntry(content: string): Promise<AIResponse<JournalSummaryResponse>>;
}

// Fallback content for when AI fails
export const FALLBACK_CONTENT = {
  scriptureExplanation: {
    explanation: '这是一个很好的问题。虽然我现在没有这个具体问题的详细解释，但圣经告诉我们，神的话语是生命的粮食。建议你读读圣经，或者向教会的长辈请教。神愿意向每一个真心寻求祂的人显明真理。',
    simpleExplanation: '这个问题很好。可以多读圣经，或者问问教会的长辈，他们会很乐意帮助你。',
    lifeExample: '就像遇到不认识的字可以问老师一样，遇到不明白的经文可以问教会的长辈。',
  },
  devotion: {
    title: '神的爱永不改变',
    scriptureRef: '约翰福音 3:16',
    scriptureText: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。',
    explanation: '这节经文告诉我们，神对人的爱是如此深厚，以至于祂愿意把自己的独生子耶稣赐给我们。这种爱不是因为我们有多好，而是因为神本身就是爱。',
    keywords: '独生子：指耶稣基督。赐给：无偿地给予。信他：相信并接受耶稣。灭亡：永远的死亡和分离。永生：永远的生命，与神同在。',
    reflectionQuestions: '1. 神为什么愿意把祂的独生子给我们？\n2. 我今天如何回应神的这份爱？\n3. 我怎样向身边的人分享这份爱？',
    prayer: '亲爱的天父，感谢你爱我，甚至将你的独生子赐给我。帮助我今天能感受到你的爱，并将这份爱分享给我遇到的每一个人。奉耶稣的名祷告，阿们。',
    reminder: '今天试着对三个人说一句鼓励的话，让他们感受到神的爱。',
  },
  journal: {
    summary: '记录今天的灵修感动',
    category: '感动',
    tags: ['灵修', '感动'],
  },
};
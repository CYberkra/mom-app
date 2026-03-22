export interface ExplanationResult {
  explanation: string;
  simpleExplanation?: string;
  lifeExample?: string;
}

// Mock explanations for common scripture references and questions
const mockExplanations: Record<string, ExplanationResult> = {
  "约翰福音 3:16": {
    explanation: "这节经文告诉我们，神对人的爱是如此深厚，以至于祂愿意把自己的独生子耶稣赐给我们。这种爱不是因为我们有多好，而是因为神本身就是爱。祂希望我们相信耶稣，这样我们就不会永远灭亡，而是能得到永远的生命。",
    simpleExplanation: "就像父母爱孩子，愿意把最好的给孩子一样，神爱我们，甚至把祂的儿子耶稣赐给我们。只要我们相信耶稣，就能得到永远的生命。",
    lifeExample: "就像爷爷奶奶总是把最好的留给你，自己舍不得吃用。神也是这样，祂太爱我们了，甚至把最宝贵的耶稣赐给我们。"
  },
  "希伯来书 11:1": {
    explanation: "信心就像一张看不见的契约，让我们对将来要发生的事有把握。就像我们相信太阳明天会升起一样，虽然还没看见，但我们心里有把握。对神的信心也是如此，虽然看不见神，但我们心里知道祂是真实的，祂的应许一定会实现。",
    simpleExplanation: "信心就像相信明天太阳会升起一样。虽然现在看不见，但我们心里知道一定会发生。",
    lifeExample: "就像你相信妈妈说的话一样，虽然还没看见，但你知道妈妈不会骗你。对神的信心也是这样。"
  },
  "诗篇 23:1": {
    explanation: "大卫将神比作牧人，我们就像羊群。牧人照顾羊群的一切需要：食物、水、安全、引导。同样，神也照顾我们的一切需要，使我们不至缺乏任何真正重要的东西。",
    simpleExplanation: "神就像一位好牧人，照顾我们所有的需要，使我们什么都不缺。",
    lifeExample: "就像爸爸妈妈照顾你的吃穿住行，神也这样细心照顾我们，不会让我们缺少真正需要的东西。"
  },
  "罗马书 8:28": {
    explanation: "这节经文告诉我们，即使遇到困难的事情，神也能让它变成对我们有益的事。这不是说所有事情都是好的，而是说神能在所有事情中工作，为爱祂的人带来好的结果。",
    simpleExplanation: "即使遇到不好的事情，神也能让它变成对我们有益的事。",
    lifeExample: "就像你摔了一跤，虽然疼，但学会了要小心。神也能让困难变成让我们成长的功课。"
  },
  "什么是信心？": {
    explanation: "信心是对神和祂的应许的完全信任和依靠。信心不是凭感觉，而是基于神话语的应许。信心会带来行动，因为真正的信心会改变我们的行为和生活。",
    simpleExplanation: "信心就是完全相信神，就像孩子相信父母一样。",
    lifeExample: "就像你相信爸爸妈妈会照顾你，不用担心明天吃什么穿什么。信心就是相信神会照顾我们的一切需要。"
  },
  "如何祷告？": {
    explanation: "祷告就是与神说话。可以像跟朋友聊天一样跟神说话，告诉祂你的需要、感谢、赞美和请求。祷告不需要特别的格式或话语，真诚的心最重要。",
    simpleExplanation: "祷告就是跟神说话，就像跟好朋友聊天一样。",
    lifeExample: "就像你跟爷爷奶奶说话，告诉他们你今天开心的事和不开心的事。祷告也是这样跟神说话。"
  }
};

// Default explanation for unknown queries
const defaultExplanation: ExplanationResult = {
  explanation: "这是一个很好的问题。虽然我现在没有这个具体问题的详细解释，但圣经告诉我们，神的话语是生命的粮食。建议你读读圣经，或者向教会的长辈请教。神愿意向每一个真心寻求祂的人显明真理。",
  simpleExplanation: "这个问题很好。可以多读圣经，或者问问教会的长辈，他们会很乐意帮助你。",
  lifeExample: "就像遇到不认识的字可以问老师一样，遇到不明白的经文可以问教会的长辈。"
};

export function generateExplanation(query: string): string {
  // Check for exact matches first
  if (mockExplanations[query]) {
    return mockExplanations[query].explanation;
  }
  
  // Check for partial matches
  for (const key of Object.keys(mockExplanations)) {
    if (query.includes(key) || key.includes(query)) {
      return mockExplanations[key].explanation;
    }
  }
  
  // Return default explanation
  return `关于"${query}"的解释：\n\n${defaultExplanation.explanation}`;
}

export function generateSimpleExplanation(query: string): string {
  // Find the matching explanation
  let result = defaultExplanation.simpleExplanation || "再讲简单一点：就像跟邻居聊天一样简单，不需要复杂的神学词汇。";
  
  for (const key of Object.keys(mockExplanations)) {
    if (query.includes(key) || key.includes(query)) {
      result = mockExplanations[key].simpleExplanation || result;
      break;
    }
  }
  
  return `再讲简单一点：\n\n${result}`;
}

export function generateLifeExample(query: string): string {
  // Find the matching explanation
  let result = defaultExplanation.lifeExample || "生活例子：就像你每天照顾家人一样，神也这样细心照顾我们。";
  
  for (const key of Object.keys(mockExplanations)) {
    if (query.includes(key) || key.includes(query)) {
      result = mockExplanations[key].lifeExample || result;
      break;
    }
  }
  
  return `生活例子：\n\n${result}`;
}

// Helper function to get recent searches from localStorage (client-side)
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  
  try {
    const searches = localStorage.getItem("recent_ask_searches");
    return searches ? JSON.parse(searches) : [];
  } catch {
    return [];
  }
}

// Helper function to save recent searches (client-side)
export function saveRecentSearch(query: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const searches = getRecentSearches();
    const newSearches = [query, ...searches.filter(s => s !== query)].slice(0, 10);
    localStorage.setItem("recent_ask_searches", JSON.stringify(newSearches));
  } catch {
    // Ignore errors
  }
}
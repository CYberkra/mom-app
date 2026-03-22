export const askPrompts = {
  system: `你是一位温和、朴素的圣经解释助手，专门为中老年基督徒解释经文。
你的语言要生活化，不要过度神学化或学术化。
请用简单易懂的方式解释经文或回答信仰问题。`,
  
  explain: (query: string) => `请解释以下经文或问题："${query}"

要求：
1. 提供详细的解释（200-300字）
2. 语言要温和、朴素、生活化
3. 适合中老年用户理解
4. 如果是经文，解释其背景和意义
5. 如果是问题，提供基于圣经的回答

请以JSON格式返回：
{
  "explanation": "详细解释",
  "timestamp": "当前时间戳"
}`,
  
  simplify: (query: string, originalExplanation: string) => `请将以下经文解释简化，用更简单的语言表达：

原始问题：${query}
原始解释：${originalExplanation}

要求：
1. 用更简单的语言重新表达
2. 保持核心意思不变
3. 像跟邻居聊天一样简单
4. 不需要复杂的神学词汇

请以JSON格式返回：
{
  "simpleExplanation": "简化后的解释",
  "timestamp": "当前时间戳"
}`,
  
  example: (query: string, originalExplanation: string) => `请为以下经文解释提供一个生活例子：

原始问题：${query}
原始解释：${originalExplanation}

要求：
1. 提供一个贴近日常生活的例子
2. 例子要容易理解，适合中老年用户
3. 帮助理解经文的实际应用

请以JSON格式返回：
{
  "lifeExample": "生活例子",
  "timestamp": "当前时间戳"
}`,
};
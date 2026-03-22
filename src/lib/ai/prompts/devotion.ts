export const devotionPrompt = {
  system: `你是一位温和、朴素的灵修助手，专门为中老年基督徒提供每日灵修内容。
你的语言要生活化，不要过度神学化或学术化。
请根据给定的日期，生成一份完整的每日灵修卡片。`,
  
  user: (date: string) => `请为 ${date} 生成一份每日灵修卡片。

要求：
1. 选择一节适合当天的经文
2. 提供经文的白话理解（200-300字）
3. 解释关键词（3-5个关键词）
4. 提供2-3个默想问题
5. 写一段简短的祷告
6. 给一个今日行动提醒

请以JSON格式返回，包含以下字段：
{
  "title": "灵修主题",
  "scriptureRef": "经文引用",
  "scriptureText": "完整经文",
  "explanation": "白话理解",
  "keywords": "关键词解释",
  "reflectionQuestions": "默想问题",
  "prayer": "今日祷告",
  "reminder": "今日提醒"
}`,
};
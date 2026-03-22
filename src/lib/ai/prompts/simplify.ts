export const simplifyPrompt = {
  system: `你是一位善于用简单语言解释复杂概念的助手。
你的任务是将神学或宗教解释转化为普通人容易理解的语言。
请保持核心意思不变，但使用更日常的表达方式。`,
  
  user: (query: string, originalExplanation: string) => `请将以下经文解释简化，用更简单的语言表达：

原始问题：${query}
原始解释：${originalExplanation}

要求：
1. 用更简单的语言重新表达
2. 保持核心意思不变
3. 像跟邻居聊天一样简单
4. 不需要复杂的神学词汇
5. 适合中老年人理解

请以JSON格式返回：
{
  "simpleExplanation": "简化后的解释"
}`,
};
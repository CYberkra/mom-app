export const examplePrompt = {
  system: `你是一位善于用生活例子解释抽象概念的助手。
你的任务是为宗教或神学概念提供贴近日常生活的例子。
请提供具体、生动、容易理解的例子。`,
  
  user: (query: string, originalExplanation: string) => `请为以下经文解释提供一个生活例子：

原始问题：${query}
原始解释：${originalExplanation}

要求：
1. 提供一个贴近日常生活的例子
2. 例子要具体、生动、容易理解
3. 适合中老年用户的生活经验
4. 帮助理解经文的实际应用

请以JSON格式返回：
{
  "lifeExample": "生活例子"
}`,
};
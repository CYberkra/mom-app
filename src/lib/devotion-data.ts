export interface DevotionData {
  id: number;
  date: string;
  title: string;
  scriptureRef: string;
  scriptureText: string;
  explanation: string;
  keywords: string;
  reflectionQuestions: string;
  prayer: string;
  reminder: string;
}

export const getTodayDevotion = (): DevotionData => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  
  // Mock data - in a real app, this would come from the database
  return {
    id: 1,
    date: dateString,
    title: "神的爱永不改变",
    scriptureRef: "约翰福音 3:16",
    scriptureText: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。",
    explanation: "这节经文告诉我们，神对人的爱是如此深厚，以至于祂愿意把自己的独生子耶稣赐给我们。这种爱不是因为我们有多好，而是因为神本身就是爱。祂希望我们相信耶稣，这样我们就不会永远灭亡，而是能得到永远的生命。",
    keywords: "独生子：指耶稣基督。赐给：无偿地给予。信他：相信并接受耶稣。灭亡：永远的死亡和分离。永生：永远的生命，与神同在。",
    reflectionQuestions: "1. 神为什么愿意把祂的独生子给我们？\n2. 我今天如何回应神的这份爱？\n3. 我怎样向身边的人分享这份爱？",
    prayer: "亲爱的天父，感谢你爱我，甚至将你的独生子赐给我。帮助我今天能感受到你的爱，并将这份爱分享给我遇到的每一个人。奉耶稣的名祷告，阿们。",
    reminder: "今天试着对三个人说一句鼓励的话，让他们感受到神的爱。",
  };
};

export const getDevotionByDate = (date: string): DevotionData => {
  // Mock data for different dates
  const devotions: Record<string, DevotionData> = {
    "2026-03-21": {
      id: 1,
      date: "2026-03-21",
      title: "神的爱永不改变",
      scriptureRef: "约翰福音 3:16",
      scriptureText: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。",
      explanation: "这节经文告诉我们，神对人的爱是如此深厚，以至于祂愿意把自己的独生子耶稣赐给我们。这种爱不是因为我们有多好，而是因为神本身就是爱。祂希望我们相信耶稣，这样我们就不会永远灭亡，而是能得到永远的生命。",
      keywords: "独生子：指耶稣基督。赐给：无偿地给予。信他：相信并接受耶稣。灭亡：永远的死亡和分离。永生：永远的生命，与神同在。",
      reflectionQuestions: "1. 神为什么愿意把祂的独生子给我们？\n2. 我今天如何回应神的这份爱？\n3. 我怎样向身边的人分享这份爱？",
      prayer: "亲爱的天父，感谢你爱我，甚至将你的独生子赐给我。帮助我今天能感受到你的爱，并将这份爱分享给我遇到的每一个人。奉耶稣的名祷告，阿们。",
      reminder: "今天试着对三个人说一句鼓励的话，让他们感受到神的爱。",
    },
    "2026-03-20": {
      id: 2,
      date: "2026-03-20",
      title: "信心的根基",
      scriptureRef: "希伯来书 11:1",
      scriptureText: "信就是所望之事的实底，是未见之事的确据。",
      explanation: "信心就像一张看不见的契约，让我们对将来要发生的事有把握。就像我们相信太阳明天会升起一样，虽然还没看见，但我们心里有把握。对神的信心也是如此，虽然看不见神，但我们心里知道祂是真实的，祂的应许一定会实现。",
      keywords: "实底：原文是'根基'或'保证'。确据：确信、把握。未见之事：还没有看见的事情。",
      reflectionQuestions: "1. 我生活中有哪些事需要凭信心去面对？\n2. 过去神怎样帮助我度过难关？\n3. 我如何帮助别人建立信心？",
      prayer: "主啊，求你加添我的信心。当我面对未知的事情时，帮助我记得你是信实的。奉耶稣的名祷告，阿们。",
      reminder: "今天为一件你担心的事祷告，相信神已经掌权。",
    },
    "2026-03-19": {
      id: 3,
      date: "2026-03-19",
      title: "喜乐的力量",
      scriptureRef: "尼希米记 8:10",
      scriptureText: "靠耶和华而得的喜乐是你们的力量。",
      explanation: "真正的喜乐不是来自外在的环境，而是来自与神的关系。当我们依靠神，心里就会有喜乐，这喜乐能给我们力量去面对生活中的困难。就像手机需要充电一样，我们的灵命也需要从神那里得力量。",
      keywords: "靠：依靠、倚靠。喜乐：深层的、持久的快乐。力量：能力、动力。",
      reflectionQuestions: "1. 我今天有什么值得感恩的事？\n2. 我如何让神的喜乐充满我的心？\n3. 我能用喜乐的心帮助谁？",
      prayer: "天父，谢谢你赐我喜乐。当我遇到困难时，帮助我记得靠你而得的喜乐是我的力量。奉耶稣的名祷告，阿们。",
      reminder: "今天找三件值得感恩的事，写下来说给神听。",
    },
  };
  
  return devotions[date] || getTodayDevotion();
};
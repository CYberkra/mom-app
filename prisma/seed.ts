import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// 从环境变量读取数据库 URL，Railway 部署时使用 file:/app/data/dev.db
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

// Create adapter with URL from environment variable
const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});

// Create PrismaClient with adapter
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});

async function main() {
  console.log('Start seeding ...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.hymn.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.memoryPracticeLog.deleteMany();
  await prisma.memoryVerse.deleteMany();
  await prisma.scriptureExplanation.deleteMany();
  await prisma.dailyDevotion.deleteMany();
  await prisma.user.deleteMany();

  // Create default user
  const user = await prisma.user.create({
    data: {
      name: '妈妈',
      settings: JSON.stringify({
        largeFontMode: false,
        autoRead: false,
        reminderTime: '08:00',
        darkMode: false,
        notificationsEnabled: true,
      }),
    },
  });

  console.log('Created user:', user.name);

  // Create daily devotions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const devotions = await Promise.all([
    prisma.dailyDevotion.create({
      data: {
        date: today,
        title: '神的爱永不改变',
        scriptureRef: '约翰福音 3:16',
        scriptureText: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。',
        explanation: '这节经文告诉我们，神对人的爱是如此深厚，以至于祂愿意把自己的独生子耶稣赐给我们。这种爱不是因为我们有多好，而是因为神本身就是爱。祂希望我们相信耶稣，这样我们就不会永远灭亡，而是能得到永远的生命。',
        keywords: '独生子：指耶稣基督。赐给：无偿地给予。信他：相信并接受耶稣。灭亡：永远的死亡和分离。永生：永远的生命，与神同在。',
        reflectionQuestions: '1. 神为什么愿意把祂的独生子给我们？\n2. 我今天如何回应神的这份爱？\n3. 我怎样向身边的人分享这份爱？',
        prayer: '亲爱的天父，感谢你爱我，甚至将你的独生子赐给我。帮助我今天能感受到你的爱，并将这份爱分享给我遇到的每一个人。奉耶稣的名祷告，阿们。',
      },
    }),
    prisma.dailyDevotion.create({
      data: {
        date: new Date(today.getTime() - 24 * 60 * 60 * 1000), // yesterday
        title: '信心的根基',
        scriptureRef: '希伯来书 11:1',
        scriptureText: '信就是所望之事的实底，是未见之事的确据。',
        explanation: '信心就像一张看不见的契约，让我们对将来要发生的事有把握。就像我们相信太阳明天会升起一样，虽然还没看见，但我们心里有把握。对神的信心也是如此，虽然看不见神，但我们心里知道祂是真实的，祂的应许一定会实现。',
        keywords: "实底：原文是'根基'或'保证'。确据：确信、把握。未见之事：还没有看见的事情。",
        reflectionQuestions: '1. 我生活中有哪些事需要凭信心去面对？\n2. 过去神怎样帮助我度过难关？\n3. 我如何帮助别人建立信心？',
        prayer: '主啊，求你加添我的信心。当我面对未知的事情时，帮助我记得你是信实的。奉耶稣的名祷告，阿们。',
      },
    }),
  ]);

  console.log('Created devotions:', devotions.length);

  // Create scripture explanations
  const explanations = await Promise.all([
    prisma.scriptureExplanation.create({
      data: {
        query: '约翰福音 3:16',
        explanation: '这节经文告诉我们，神对人的爱是如此深厚，以至于祂愿意把自己的独生子耶稣赐给我们。这种爱不是因为我们有多好，而是因为神本身就是爱。祂希望我们相信耶稣，这样我们就不会永远灭亡，而是能得到永远的生命。',
        simpleExplanation: '就像父母爱孩子，愿意把最好的给孩子一样，神爱我们，甚至把祂的儿子耶稣赐给我们。只要我们相信耶稣，就能得到永远的生命。',
        lifeExample: '就像爷爷奶奶总是把最好的留给你，自己舍不得吃用。神也是这样，祂太爱我们了，甚至把最宝贵的耶稣赐给我们。',
      },
    }),
    prisma.scriptureExplanation.create({
      data: {
        query: '什么是信心？',
        explanation: '信心是对神和祂的应许的完全信任和依靠。信心不是凭感觉，而是基于神话语的应许。信心会带来行动，因为真正的信心会改变我们的行为和生活。',
        simpleExplanation: '信心就是完全相信神，就像孩子相信父母一样。',
        lifeExample: '就像你相信爸爸妈妈会照顾你，不用担心明天吃什么穿什么。信心就是相信神会照顾我们的一切需要。',
      },
    }),
  ]);

  console.log('Created explanations:', explanations.length);

  // Create memory verses
  const verses = await Promise.all([
    prisma.memoryVerse.create({
      data: {
        scriptureRef: '约翰福音 3:16',
        scriptureText: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。',
      },
    }),
    prisma.memoryVerse.create({
      data: {
        scriptureRef: '诗篇 23:1',
        scriptureText: '耶和华是我的牧者，我必不至缺乏。',
      },
    }),
    prisma.memoryVerse.create({
      data: {
        scriptureRef: '罗马书 8:28',
        scriptureText: '我们晓得万事都互相效力，叫爱神的人得益处，就是按他旨意被召的人。',
      },
    }),
  ]);

  console.log('Created memory verses:', verses.length);

  // Create practice logs for verses
  const practiceLogs = await Promise.all([
    prisma.memoryPracticeLog.create({
      data: {
        memoryVerseId: verses[0].id,
        practiceDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        score: 85,
        completed: true,
        streak: 3,
      },
    }),
    prisma.memoryPracticeLog.create({
      data: {
        memoryVerseId: verses[0].id,
        practiceDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        score: 90,
        completed: true,
        streak: 2,
      },
    }),
    prisma.memoryPracticeLog.create({
      data: {
        memoryVerseId: verses[1].id,
        practiceDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        score: 75,
        completed: true,
        streak: 1,
      },
    }),
  ]);

  console.log('Created practice logs:', practiceLogs.length);

  // Create journal entries
  const journalEntries = await Promise.all([
    prisma.journalEntry.create({
      data: {
        userId: user.id,
        entryDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        content: '今天读到约翰福音3:16，感受到神的爱是如此深厚。我为家人祷告，求神保守他们平安。',
        aiSummary: '今天默想神的爱，为家人祷告求平安。',
      },
    }),
    prisma.journalEntry.create({
      data: {
        userId: user.id,
        entryDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        content: '在小组查经时，大家分享彼此的需要，让我感受到肢体相顾的美好。学习彼此相爱的功课。',
        aiSummary: '小组查经中经历肢体相顾，学习彼此相爱。',
      },
    }),
  ]);

  console.log('Created journal entries:', journalEntries.length);

  // Create hymns
  const hymns = await Promise.all([
    prisma.hymn.create({
      data: {
        title: '奇异恩典',
        number: '001',
        firstLine: '奇异恩典，何等甘甜',
        lyrics: `奇异恩典，何等甘甜，
我罪已得赦免；
前我失丧，今被寻回，
瞎眼今得看见。

如此恩典，使我敬畏，
使我心得安慰；
初信之时，即蒙恩惠，
真是何等宝贵。

许多危险，试炼网罗，
我已安然经过；
靠主恩典，护佑我度，
更还要领我归家。

将来禧年，圣徒欢聚，
恩光爱谊千年；
喜乐颂赞，在父座前，
深望那日快现。`,
        tags: '恩典,赞美,经典',
        source: '赞美诗',
      },
    }),
    prisma.hymn.create({
      data: {
        title: '爱的真谛',
        number: '002',
        firstLine: '爱是恒久忍耐',
        lyrics: `爱是恒久忍耐，又有恩慈；
爱是不嫉妒，爱是不自夸，
不张狂，不作害羞的事，
不求自己的益处，
不轻易发怒，不计算人的恶，
不喜欢不义，只喜欢真理；
凡事包容，凡事相信，
凡事盼望，凡事忍耐。
爱是永不止息。`,
        tags: '爱,圣经,哥林多前书',
        source: '赞美诗',
      },
    }),
    prisma.hymn.create({
      data: {
        title: '耶稣爱我',
        number: '003',
        firstLine: '耶稣爱我我知道',
        lyrics: `耶稣爱我我知道，
因有圣经告诉我；
幼小孩童主牧养，
主必扶持永不忘。

耶稣爱我舍生命，
将我罪恶都洗净；
耶稣爱我永不移，
我虽软弱主扶持。

副歌：
是的，耶稣爱我！
是的，耶稣爱我！
是的，耶稣爱我！
因有圣经告诉我。`,
        tags: '爱,耶稣,儿童',
        source: '赞美诗',
      },
    }),
    prisma.hymn.create({
      data: {
        title: '我心灵得安宁',
        number: '004',
        firstLine: '有时享平安',
        lyrics: `有时享平安，
如浮云变幻，
我救主永在身边；
只要信靠主，
紧握主恩手，
我心灵得安宁。

我心灵得安宁，
我心灵得安宁，
我心灵得安宁，
因主已应许。

主曾对我说，
我的恩够用，
必赐力量将我扶；
主膀臂托我，
安慰永不息，
我心灵得安宁。`,
        tags: '平安,安慰,信靠',
        source: '赞美诗',
      },
    }),
    prisma.hymn.create({
      data: {
        title: '赐我圣经',
        number: '005',
        firstLine: '赐我圣经，宝贵圣经',
        lyrics: `赐我圣经，宝贵圣经，
是我路上亮光；
赐我圣经，宝贵圣经，
使我生命得喂养。

每日读经，每日思想，
主话甘甜又芬芳；
每日读经，每日思想，
使我灵性得刚强。

圣经教训，真实可靠，
引导我走永生路；
圣经应许，永不落空，
是我随时的帮助。`,
        tags: '圣经,读经,亮光',
        source: '赞美诗',
      },
    }),
    prisma.hymn.create({
      data: {
        title: '主祷文',
        number: '006',
        firstLine: '我们在天上的父',
        lyrics: `我们在天上的父，
愿人都尊你的名为圣。
愿你的国降临，
愿你的旨意行在地上，
如同行在天上。

我们日用的饮食，
今日赐给我们。
免我们的债，
如同我们免了人的债。
不叫我们遇见试探，
救我们脱离凶恶。

因为国度、权柄、荣耀，
全是你的，直到永远。
阿们！`,
        tags: '祷告,主祷文,教导',
        source: '赞美诗',
      },
    }),
    prisma.hymn.create({
      data: {
        title: '与主同行',
        number: '007',
        firstLine: '与主同行路',
        lyrics: `与主同行路，
何等美好；
与主同行路，
何等奇妙。

主手牵引我，
步步不离；
主爱围绕我，
时时同在。

与主同行路，
平安喜乐；
与主同行路，
直到天家。`,
        tags: '同行,陪伴,喜乐',
        source: '赞美诗',
      },
    }),
  ]);

  console.log('Created hymns:', hymns.length);

  // Create favorites
  const favorites = await Promise.all([
    prisma.favorite.create({
      data: {
        type: 'devotion',
        devotionId: devotions[0].id,
      },
    }),
    prisma.favorite.create({
      data: {
        type: 'verse',
        verseId: verses[0].id,
      },
    }),
    prisma.favorite.create({
      data: {
        type: 'explanation',
        explanationId: explanations[0].id,
      },
    }),
    prisma.favorite.create({
      data: {
        type: 'journal',
        journalId: journalEntries[0].id,
      },
    }),
    prisma.favorite.create({
      data: {
        type: 'hymn',
        hymnId: hymns[0].id, // 奇异恩典
      },
    }),
    prisma.favorite.create({
      data: {
        type: 'hymn',
        hymnId: hymns[2].id, // 耶稣爱我
      },
    }),
  ]);

  console.log('Created favorites:', favorites.length);

  // Create notification settings
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        time: '08:00',
        enabled: true,
      },
    }),
  ]);

  console.log('Created notifications:', notifications.length);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
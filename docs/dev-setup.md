# 妈妈灵修助手 - 开发环境设置指南

## 项目概述
这是一个为长辈设计的PWA灵修助手应用，支持每日灵修、经文解释、背经练习、今日记录等功能。

## 技术栈
- **前端**: Next.js 16 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Prisma + SQLite
- **AI**: 抽象层支持Mock和Kimi两种provider
- **PWA**: 支持离线使用和添加到手机桌面

## 环境要求
- Node.js >= 20.0.0
- npm 或 yarn

## 本地启动步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 环境变量配置
复制 `.env.example` 为 `.env`：
```bash
cp .env.example .env
```

默认配置使用Mock AI provider，无需API密钥。

### 3. 初始化数据库
```bash
# 生成Prisma Client
npx prisma generate

# 创建数据库并应用schema
npx prisma db push

# 插入测试数据
npx prisma db seed
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## AI Provider 配置

### Mock模式（默认）
- 设置 `AI_PROVIDER=mock`
- 使用本地模拟数据，无需外部API
- 适合开发和测试

### Kimi模式
1. 获取Kimi API密钥
2. 修改 `.env` 文件：
   ```env
   AI_PROVIDER=kimi
   KIMI_API_KEY=your_api_key_here
   KIMI_BASE_URL=https://api.moonshot.ai/v1
   KIMI_MODEL=moonshot-v1-8k
   ```
3. 重启开发服务器

**注意**: 如果Kimi API不可用或密钥无效，系统会自动回退到Mock模式。

## 数据库管理

### 查看数据库
```bash
npx prisma studio
```

### 重置数据库
```bash
npx prisma migrate reset --force
npx prisma db seed
```

### 修改数据库schema
1. 修改 `prisma/schema.prisma`
2. 运行 `npx prisma db push`

## 开发模式说明

### 当前状态
- **AI Provider**: 默认使用Mock，所有AI功能使用本地模拟数据
- **数据库**: SQLite本地文件，数据持久化
- **PWA**: 开发模式下PWA功能禁用，生产构建后启用

### Mock模式下的AI功能
1. **经文解释**: 返回预设的解释内容
2. **简化解释**: 返回简单的版本
3. **生活例子**: 返回生活化的例子
4. **每日灵修**: 返回固定的灵修内容
5. **日记整理**: 简单的关键词分类和总结

### 切换到Kimi模式
确保：
1. 有有效的Kimi API密钥
2. 账户有足够余额
3. 网络可以访问Kimi API

如果Kimi API调用失败，系统会自动回退到Mock模式，不会影响应用运行。

## 常见问题

### Q: 如何保持Mock模式开发？
A: 确保 `.env` 文件中 `AI_PROVIDER=mock`，这是默认设置。

### Q: 数据库文件在哪里？
A: 在 `prisma/dev.db`，这是一个SQLite文件。

### Q: 如何添加新的AI功能？
A: 
1. 在 `src/lib/ai/types.ts` 中添加响应类型
2. 在 `src/lib/ai/prompts/` 中添加prompt模板
3. 在 `src/lib/ai/providers/mock.ts` 中实现Mock逻辑
4. 在 `src/lib/ai/providers/kimi.ts` 中实现Kimi逻辑
5. 在 `src/lib/ai/client.ts` 中添加方法

### Q: 如何测试PWA功能？
A: 运行 `npm run build` 然后 `npm start`，在生产模式下测试。

## 项目结构
```
mom-app/
├── prisma/                 # 数据库相关
│   ├── schema.prisma      # 数据库模型
│   ├── seed.ts            # 种子数据
│   └── dev.db             # SQLite数据库文件
├── src/
│   ├── app/               # Next.js页面和API
│   │   ├── api/           # API路由
│   │   └── ...            # 页面组件
│   ├── lib/               # 工具库
│   │   ├── ai/            # AI provider抽象层
│   │   │   ├── client.ts  # AI客户端
│   │   │   ├── types.ts   # 类型定义
│   │   │   ├── providers/ # provider实现
│   │   │   └── prompts/   # prompt模板
│   │   └── prisma.ts      # Prisma客户端
│   └── components/        # React组件
├── docs/                  # 文档
└── public/                # 静态资源
```

## 部署说明
1. 设置生产环境变量
2. 运行 `npm run build`
3. 启动生产服务器 `npm start`
4. 配置反向代理和HTTPS

## 支持与反馈
如有问题，请检查：
1. Node.js版本是否符合要求
2. 依赖是否正确安装
3. 环境变量是否正确配置
4. 数据库是否正确初始化
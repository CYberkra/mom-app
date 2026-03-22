# Railway 部署清单

## 部署前准备

### 1. 检查项目配置
- [ ] `package.json` 包含 `postinstall` 脚本
- [ ] `railway.json` 配置文件存在
- [ ] `prisma/schema.prisma` 数据库模型正确
- [ ] 项目可以在本地构建成功：`npm run build`

### 2. 注册 Railway 账号
- [ ] 访问 https://railway.app
- [ ] 使用 GitHub 账号登录
- [ ] 验证邮箱（如果需要）

## 重要注意事项

### 数据库读写时机
本项目已确保 SQLite 数据库读写**不会在构建阶段执行**：

| 阶段 | 数据库操作 | 说明 |
|------|-----------|------|
| `npm install` | ❌ 无 | 只安装依赖，生成 Prisma Client |
| `npm run build` | ❌ 无 | 只构建静态文件，不读写数据库 |
| `npm start` | ✅ 运行时 | 应用启动后才连接数据库 |
| `railway run db:push` | ✅ 手动 | 需要手动执行初始化 |
| `railway run db:seed` | ✅ 手动 | 需要手动执行插入数据 |

**为什么这样设计**：
1. 构建阶段持久卷可能还未挂载
2. 避免构建失败
3. 数据库初始化应该是显式操作

### 持久卷挂载顺序
1. Railway 先执行构建（`npm run build`）
2. 构建完成后，持久卷才挂载到 `/app/data`
3. 应用启动时（`npm start`）才能访问数据库
4. 因此数据库初始化必须在应用启动后手动执行

## 部署步骤

### 第 1 步：创建项目
1. 登录 Railway Dashboard
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 授权 Railway 访问 GitHub
5. 选择 `mom-app` 仓库
6. 点击 "Deploy Now"

### 第 2 步：配置持久卷
1. 在项目页面，点击 "New" 按钮
2. 选择 "Volume"
3. 挂载路径：`/app/data`
4. 大小：1 GB（足够试用）
5. 点击 "Add"

### 第 3 步：配置环境变量
在项目设置中，添加以下环境变量：

```
DATABASE_URL=file:/app/data/dev.db
AI_PROVIDER=mock
NODE_ENV=production
```

### 第 4 步：等待部署完成
1. Railway 自动检测 Next.js 项目
2. 自动运行 `npm install`（包含 `postinstall` 脚本）
3. 自动运行 `npm run build`
4. 自动运行 `npm start`

### 第 5 步：生成访问域名（必须手动操作）
**重要**：Railway 不会自动分配域名，必须手动生成！

1. 在项目页面，点击 "Settings" 标签
2. 滚动到 "Networking" 部分
3. 找到 "Public Networking" 区域
4. 点击 "Generate Domain" 按钮
5. Railway 会生成一个类似 `https://mom-app-production-xxxx.up.railway.app` 的地址
6. 复制此地址用于访问

**注意**：如果不执行此步骤，将无法通过网址访问应用！

## 首次数据库初始化（必须手动执行）

**重要**：数据库不会自动初始化，必须在部署后手动执行！

### 方法 1：通过 Railway CLI（推荐）

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 连接到项目
railway link

# 4. 初始化数据库结构
railway run npm run db:push

# 5. 插入测试数据（仅首次）
railway run npm run db:seed
```

### 方法 2：通过临时 API（备选）

如果 Railway CLI 不可用，可以临时启用初始化 API：

1. 创建 `src/app/api/init-db/route.ts`：
```typescript
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  // 简单的安全检查
  if (secret !== process.env.INIT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    await execAsync("npx prisma db push");
    await execAsync("npx prisma db seed");
    
    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
```

2. 在 Railway 环境变量中添加：
```
INIT_SECRET=your-random-secret-here
```

3. 访问初始化 URL：
```
https://your-app.railway.app/api/init-db?secret=your-random-secret-here
```

4. **重要**：初始化完成后，删除此 API 和环境变量

## 部署后验证

### 1. 健康检查
访问：`https://your-app.railway.app/api/health`

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2026-03-22T...",
  "service": "妈妈灵修助手",
  "version": "1.0.0"
}
```

### 2. 数据库状态检查
访问：`https://your-app.railway.app/api/db-status`

预期响应：
```json
{
  "status": "ok",
  "database": "connected",
  "counts": {
    "users": 1,
    "hymns": 7,
    "devotions": 2
  },
  "timestamp": "2026-03-22T..."
}
```

### 3. 功能验证清单
- [ ] 首页正常显示
- [ ] 诗歌本可以浏览
- [ ] 诗歌详情可以查看
- [ ] 聚会模式可以使用
- [ ] 收藏功能正常
- [ ] 数据刷新后收藏仍在

## 数据持久化验证

### 验证步骤
1. 在网站上收藏一首诗歌
2. 记录收藏的诗歌名称
3. 在 Railway Dashboard 中重新部署项目
4. 等待部署完成
5. 重新访问网站
6. 检查收藏是否还在

### 如果数据丢失
1. 检查持久卷是否正确挂载（路径 `/app/data`）
2. 检查环境变量 `DATABASE_URL` 是否正确
3. 查看 Railway 日志，检查数据库连接错误

## 备份步骤

### 方法 1：通过 Railway CLI
```bash
# 下载数据库文件
railway run cat /app/data/dev.db > backup_$(date +%Y%m%d).db
```

### 方法 2：通过 API（需要添加备份端点）
访问：`https://your-app.railway.app/api/backup`

### 方法 3：通过 Railway Dashboard
1. 进入项目
2. 点击 "Volume"
3. 找到 `dev.db` 文件
4. 下载文件

## 常见问题

### Q: 部署失败怎么办？
1. 检查 Railway 构建日志
2. 确保 `package.json` 包含 `postinstall` 脚本
3. 确保项目可以在本地构建成功

### Q: 数据库连接失败？
1. 检查 `DATABASE_URL` 环境变量
2. 确保持久卷已正确挂载
3. 运行 `railway run npm run db:push` 初始化数据库

### Q: 如何更新应用？
1. 推送代码到 GitHub
2. Railway 自动检测并重新部署
3. 数据会保留在持久卷中

### Q: 如何查看日志？
1. 在 Railway Dashboard 中进入项目
2. 点击 "Deployments"
3. 选择最新的部署
4. 查看 "Build Logs" 或 "Deploy Logs"

## 环境变量清单

| 变量名 | 值 | 说明 |
|--------|-----|------|
| DATABASE_URL | file:/app/data/dev.db | SQLite 数据库路径 |
| AI_PROVIDER | mock | AI 功能使用 mock 模式 |
| NODE_ENV | production | 生产环境 |
| PORT | 3000 | 端口（Railway 自动设置） |

## 下线/删除

如果需要删除项目：
1. 在 Railway Dashboard 中进入项目
2. 点击 "Settings"
3. 滚动到底部，点击 "Delete Project"
4. 确认删除

**注意**：删除项目会同时删除持久卷中的数据，请先备份！
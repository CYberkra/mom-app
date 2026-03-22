import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    // 简单的认证检查
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    // 如果设置了 BACKUP_SECRET 环境变量，则需要验证
    if (process.env.BACKUP_SECRET && secret !== process.env.BACKUP_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // 获取数据库路径
    const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const dbPath = dbUrl.replace("file:", "");
    const absolutePath = path.resolve(process.cwd(), dbPath);
    
    // 检查文件是否存在
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json(
        { error: "Database file not found", path: absolutePath },
        { status: 404 }
      );
    }
    
    // 读取文件
    const fileBuffer = fs.readFileSync(absolutePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    
    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="mom-app-backup-${timestamp}.db"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Backup failed:", error);
    return NextResponse.json(
      { error: "Backup failed", message: String(error) },
      { status: 500 }
    );
  }
}
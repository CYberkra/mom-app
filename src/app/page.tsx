"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";

interface Devotion {
  id: number;
  date: string;
  title: string;
  scriptureRef: string;
}

export default function HomePage() {
  const [today, setToday] = useState("");
  const [recentDevotions, setRecentDevotions] = useState<Devotion[]>([]);

  useEffect(() => {
    // Format today's date
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    setToday(now.toLocaleDateString("zh-CN", options));

    // Mock recent devotions
    setRecentDevotions([
      { id: 1, date: "2026-03-21", title: "神的爱", scriptureRef: "约翰福音 3:16" },
      { id: 2, date: "2026-03-20", title: "信心", scriptureRef: "希伯来书 11:1" },
      { id: 3, date: "2026-03-19", title: "盼望", scriptureRef: "罗马书 15:13" },
    ]);
  }, []);

  const features = [
    { icon: "📖", title: "今日灵修", href: "/devotion", description: "每日经文与默想" },
    { icon: "🎵", title: "诗歌本", href: "/hymns", description: "赞美诗歌" },
    { icon: "📝", title: "背经练习", href: "/memory", description: "记忆神的话语" },
    { icon: "📓", title: "今日记录", href: "/journal", description: "记录灵修感动" },
  ];

  return (
    <Layout>
      <div className="container py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">
            妈妈灵修助手
          </h1>
          <p className="text-gray-600">
            每天与神亲近，生命得更新
          </p>
        </div>

        {/* Today's date */}
        <div className="date-display mb-6">
          📅 {today}
        </div>

        {/* Daily quote */}
        <div className="daily-quote mb-8">
          <p className="text-lg italic">
            "你们要尝尝主恩的滋味，便知道他是美善的。"
          </p>
          <p className="text-sm text-gray-500 mt-2">
            — 诗篇 34:8
          </p>
        </div>

        {/* Feature grid */}
        <div className="feature-grid mb-8">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <Card
                clickable
                hoverable
                className="feature-card h-full"
              >
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-title font-medium">{feature.title}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {feature.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent status */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🕒 最近灵修
          </h2>
          <div className="space-y-3">
            {recentDevotions.map((devotion) => (
              <Card key={devotion.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{devotion.title}</p>
                    <p className="text-sm text-gray-500">{devotion.scriptureRef}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(devotion.date).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/favorites">
            <Button variant="secondary" fullWidth>
              ❤️ 我的收藏
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="secondary" fullWidth>
              ⚙️ 设置
            </Button>
          </Link>
        </div>

        {/* Today's reminder */}
        <Card className="bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-blue-800">今日提醒</p>
              <p className="text-sm text-blue-600">
                记得花10分钟与神独处，聆听祂的声音。
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
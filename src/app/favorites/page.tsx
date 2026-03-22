"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";

type FavoriteType = "devotion" | "verse" | "explanation" | "journal";

interface FavoriteItem {
  id: number;
  type: FavoriteType;
  title: string;
  reference: string;
  preview: string;
  date: string;
}

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<FavoriteType>("devotion");
  
  // Mock data
  const favorites: Record<FavoriteType, FavoriteItem[]> = {
    devotion: [
      {
        id: 1,
        type: "devotion",
        title: "神的爱永不改变",
        reference: "约翰福音 3:16",
        preview: "神爱世人，甚至将他的独生子赐给他们...",
        date: "2026-03-21",
      },
    ],
    verse: [
      {
        id: 1,
        type: "verse",
        title: "信心的根基",
        reference: "希伯来书 11:1",
        preview: "信就是所望之事的实底...",
        date: "2026-03-20",
      },
    ],
    explanation: [
      {
        id: 1,
        type: "explanation",
        title: "关于信心的解释",
        reference: "希伯来书 11:1",
        preview: "信心就像一张看不见的契约...",
        date: "2026-03-19",
      },
    ],
    journal: [
      {
        id: 1,
        type: "journal",
        title: "今天的感动",
        reference: "2026-03-21",
        preview: "今天读到约翰福音3:16，感受到神的爱...",
        date: "2026-03-21",
      },
    ],
  };

  const tabs = [
    { id: "devotion" as FavoriteType, label: "灵修", icon: "📖" },
    { id: "verse" as FavoriteType, label: "经文", icon: "📝" },
    { id: "explanation" as FavoriteType, label: "解释", icon: "💬" },
    { id: "journal" as FavoriteType, label: "记录", icon: "📓" },
  ];

  return (
    <Layout>
      <div className="container py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">
            ❤️ 我的收藏
          </h1>
          <p className="text-gray-600 mt-1">
            收藏的内容都在这里
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto mb-6 -mx-4 px-4">
          <div className="flex space-x-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Favorites list */}
        <div className="space-y-3">
          {favorites[activeTab].map(item => (
            <Card key={item.id} clickable hoverable className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{item.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <p className="text-sm text-primary mb-1">{item.reference}</p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.preview}
              </p>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {favorites[activeTab].length === 0 && (
          <Card className="text-center py-8">
            <p className="text-gray-500 mb-4">还没有收藏的{tabs.find(t => t.id === activeTab)?.label}</p>
            <Button variant="secondary">
              去看看今日灵修
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
}
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";

interface Hymn {
  id: number;
  title: string;
  number: string | null;
  firstLine: string | null;
  isFavorited: boolean;
}

export default function HymnsPage() {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [recentViewed, setRecentViewed] = useState<number[]>([]);

  // Load recent viewed hymns from localStorage
  useEffect(() => {
    const recent = localStorage.getItem("recent_viewed_hymns");
    if (recent) {
      setRecentViewed(JSON.parse(recent));
    }
  }, []);

  // Fetch hymns
  useEffect(() => {
    fetchHymns();
  }, [searchQuery, showFavoritesOnly]);

  const fetchHymns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (showFavoritesOnly) params.append("favorites", "true");

      const response = await fetch(`/api/hymns?${params}`);
      const data = await response.json();

      if (data.success) {
        setHymns(data.data);
      } else {
        // Fallback to mock data
        setHymns([
          { id: 1, title: "奇异恩典", number: "001", firstLine: "奇异恩典，何等甘甜", isFavorited: true },
          { id: 2, title: "爱的真谛", number: "002", firstLine: "爱是恒久忍耐", isFavorited: false },
          { id: 3, title: "耶稣爱我", number: "003", firstLine: "耶稣爱我我知道", isFavorited: true },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch hymns:", error);
      // Fallback to mock data
      setHymns([
        { id: 1, title: "奇异恩典", number: "001", firstLine: "奇异恩典，何等甘甜", isFavorited: true },
        { id: 2, title: "爱的真谛", number: "002", firstLine: "爱是恒久忍耐", isFavorited: false },
        { id: 3, title: "耶稣爱我", number: "003", firstLine: "耶稣爱我我知道", isFavorited: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (hymnId: number) => {
    try {
      // Find the hymn
      const hymn = hymns.find(h => h.id === hymnId);
      if (!hymn) return;

      // Update local state first
      setHymns(prev => prev.map(h => 
        h.id === hymnId ? { ...h, isFavorited: !h.isFavorited } : h
      ));

      // Call API to toggle favorite
      const response = await fetch("/api/favorites", {
        method: hymn.isFavorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hymn",
          referenceId: hymnId,
          title: hymn.title,
          reference: hymn.number ? `#${hymn.number}` : hymn.title,
          preview: hymn.firstLine || "",
        }),
      });

      if (!response.ok) {
        // Revert on error
        setHymns(prev => prev.map(h => 
          h.id === hymnId ? { ...h, isFavorited: !h.isFavorited } : h
        ));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const addToRecentViewed = (hymnId: number) => {
    const newRecent = [hymnId, ...recentViewed.filter(id => id !== hymnId)].slice(0, 10);
    setRecentViewed(newRecent);
    localStorage.setItem("recent_viewed_hymns", JSON.stringify(newRecent));
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-6 text-center">
          <p>加载中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">
            🎵 诗歌本
          </h1>
          <p className="text-gray-600 mt-1">
            赞美诗歌，灵修敬拜
          </p>
        </div>

        {/* Search and filter */}
        <Card className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索诗歌：歌名、编号、首句..."
                className="flex-1 p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Button onClick={() => setSearchQuery("")} variant="secondary" size="large">
                清除
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant={showFavoritesOnly ? "primary" : "secondary"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex-1"
                size="large"
              >
                {showFavoritesOnly ? "❤️ 只看收藏" : "🤍 全部诗歌"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent viewed */}
        {recentViewed.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">最近浏览</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentViewed.map(id => {
                const hymn = hymns.find(h => h.id === id);
                if (!hymn) return null;
                return (
                  <Link key={id} href={`/hymns/${id}`}>
                    <div className="flex-shrink-0 px-3 py-2 bg-gray-100 rounded-lg">
                      <span className="text-sm font-medium">{hymn.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Hymns list */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {showFavoritesOnly ? "我的收藏" : "所有诗歌"} ({hymns.length})
          </h2>
          
          {hymns.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {showFavoritesOnly ? "还没有收藏的诗歌" : "没有找到诗歌"}
              </p>
              {showFavoritesOnly && (
                <Button onClick={() => setShowFavoritesOnly(false)}>
                  查看所有诗歌
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {hymns.map(hymn => (
                <Link key={hymn.id} href={`/hymns/${hymn.id}`} onClick={() => addToRecentViewed(hymn.id)}>
                  <Card clickable hoverable className="p-5">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {hymn.number && (
                            <span className="text-lg text-gray-500 font-mono">
                              #{hymn.number}
                            </span>
                          )}
                          <h3 className="text-xl font-medium">{hymn.title}</h3>
                        </div>
                        {hymn.firstLine && (
                          <p className="text-gray-600 text-lg">
                            {hymn.firstLine}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(hymn.id);
                        }}
                        className="text-3xl ml-4"
                      >
                        {hymn.isFavorited ? "❤️" : "🤍"}
                      </button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Help section */}
        <Card title="使用帮助" icon="💡" className="mb-8">
          <div className="space-y-4 text-lg">
            <div>
              <p className="font-medium">搜索诗歌</p>
              <p className="text-gray-600">输入歌名、编号或首句进行搜索</p>
            </div>
            <div>
              <p className="font-medium">收藏诗歌</p>
              <p className="text-gray-600">点击爱心图标收藏诗歌</p>
            </div>
            <div>
              <p className="font-medium">查看诗歌</p>
              <p className="text-gray-600">点击诗歌卡片进入详情页</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
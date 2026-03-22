"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";

interface Hymn {
  id: number;
  title: string;
  number: string | null;
  firstLine: string | null;
  lyrics: string;
  tags: string | null;
  source: string | null;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HymnDetailPage() {
  const params = useParams();
  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [largeFontMode, setLargeFontMode] = useState(false);
  const [worshipMode, setWorshipMode] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const settings = localStorage.getItem("app_settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      setLargeFontMode(parsed.largeFontMode || false);
    }
  }, []);

  // Fetch hymn data
  useEffect(() => {
    const fetchHymn = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/hymns/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setHymn(data.data);
          setIsFavorited(data.data.isFavorited);
        } else {
          // Fallback to mock data
          setHymn({
            id: parseInt(params.id as string),
            title: "奇异恩典",
            number: "001",
            firstLine: "奇异恩典，何等甘甜",
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
            tags: "恩典,赞美,经典",
            source: "赞美诗",
            isFavorited: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setIsFavorited(true);
        }
      } catch (error) {
        console.error("Failed to fetch hymn:", error);
        // Fallback to mock data
        setHymn({
          id: parseInt(params.id as string),
          title: "奇异恩典",
          number: "001",
          firstLine: "奇异恩典，何等甘甜",
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
          tags: "恩典,赞美,经典",
          source: "赞美诗",
          isFavorited: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setIsFavorited(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHymn();
  }, [params.id]);

  const toggleFavorite = async () => {
    if (!hymn) return;

    try {
      const response = await fetch("/api/favorites", {
        method: isFavorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hymn",
          referenceId: hymn.id,
          title: hymn.title,
          reference: hymn.number ? `#${hymn.number}` : hymn.title,
          preview: hymn.firstLine || "",
        }),
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const toggleLargeFont = () => {
    const newMode = !largeFontMode;
    setLargeFontMode(newMode);
    
    // Update localStorage
    const settings = localStorage.getItem("app_settings");
    const parsed = settings ? JSON.parse(settings) : {};
    parsed.largeFontMode = newMode;
    localStorage.setItem("app_settings", JSON.stringify(parsed));
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

  if (!hymn) {
    return (
      <Layout>
        <div className="container py-6 text-center">
          <p>诗歌未找到</p>
          <Link href="/hymns">
            <Button className="mt-4">返回诗歌本</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Worship mode - simplified view for gatherings
  if (worshipMode) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-3xl mx-auto">
          {/* Minimal header - only show title if not in large font mode */}
          {!largeFontMode && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-primary">
                {hymn.title}
              </h1>
              {hymn.number && (
                <p className="text-gray-500 mt-1">#{hymn.number}</p>
              )}
            </div>
          )}

          {/* Lyrics - extra large for gatherings */}
          <div className={`whitespace-pre-line ${largeFontMode ? "text-4xl" : "text-3xl"} leading-relaxed font-medium`}>
            {hymn.lyrics}
          </div>

          {/* Minimal controls - fixed at bottom */}
          <div className="fixed bottom-6 left-6 right-6 flex justify-center gap-4">
            <button
              onClick={toggleLargeFont}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full text-lg font-medium"
            >
              {largeFontMode ? "小字" : "大字"}
            </button>
            <button
              onClick={() => setWorshipMode(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full text-lg font-medium"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal detail view
  return (
    <Layout>
      <div className="container py-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Link href="/hymns">
              <Button variant="ghost" size="small" className="mb-2">
                ← 返回诗歌本
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-primary">
              {hymn.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {hymn.number && (
                <span className="text-sm text-gray-500 font-mono">
                  #{hymn.number}
                </span>
              )}
              {hymn.source && (
                <span className="text-sm text-gray-500">
                  来源：{hymn.source}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={toggleFavorite}
            className="text-3xl"
          >
            {isFavorited ? "❤️" : "🤍"}
          </button>
        </div>

        {/* First line */}
        {hymn.firstLine && (
          <Card className="mb-6">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                "{hymn.firstLine}"
              </p>
            </div>
          </Card>
        )}

        {/* Lyrics */}
        <Card className="mb-6">
          <div className={`whitespace-pre-line ${largeFontMode ? "text-xl" : "text-lg"} leading-relaxed`}>
            {hymn.lyrics}
          </div>
        </Card>

        {/* Tags */}
        {hymn.tags && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {hymn.tags.split(",").map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button
            variant={largeFontMode ? "primary" : "secondary"}
            onClick={toggleLargeFont}
          >
            {largeFontMode ? "🔤 大字模式" : "🔤 普通字"}
          </Button>
          <Button
            variant="primary"
            onClick={() => setWorshipMode(true)}
          >
            🎤 聚会模式
          </Button>
        </div>

        {/* Help section */}
        <Card title="使用帮助" icon="💡" className="mb-8">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">大字模式</p>
              <p className="text-gray-600">切换歌词字体大小，方便阅读</p>
            </div>
            <div>
              <p className="font-medium">聚会模式</p>
              <p className="text-gray-600">只显示歌词，适合聚会时使用</p>
            </div>
            <div>
              <p className="font-medium">收藏</p>
              <p className="text-gray-600">点击爱心图标收藏诗歌</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
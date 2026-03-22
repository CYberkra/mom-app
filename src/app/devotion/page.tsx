"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import ScriptureDisplay from "@/components/ScriptureDisplay";
import { getTodayDevotion, DevotionData } from "@/lib/devotion-data";
import Link from "next/link";

export default function DevotionPage() {
  const [devotion, setDevotion] = useState<DevotionData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const fetchDevotion = async () => {
      try {
        const response = await fetch("/api/today");
        const result = await response.json();
        
        if (result.success) {
          setDevotion(result.data);
          // Check if already favorited (mock)
          const favorites = JSON.parse(localStorage.getItem("devotion_favorites") || "[]");
          setIsFavorite(favorites.includes(result.data.id));
        } else {
          // Fallback to local data
          const todayDevotion = getTodayDevotion();
          setDevotion(todayDevotion);
          const favorites = JSON.parse(localStorage.getItem("devotion_favorites") || "[]");
          setIsFavorite(favorites.includes(todayDevotion.id));
        }
      } catch (error) {
        console.error("Failed to fetch devotion:", error);
        // Fallback to local data
        const todayDevotion = getTodayDevotion();
        setDevotion(todayDevotion);
        const favorites = JSON.parse(localStorage.getItem("devotion_favorites") || "[]");
        setIsFavorite(favorites.includes(todayDevotion.id));
      }
    };
    
    fetchDevotion();
  }, []);

  const toggleFavorite = () => {
    if (!devotion) return;
    
    const favorites = JSON.parse(localStorage.getItem("devotion_favorites") || "[]");
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: number) => id !== devotion.id);
    } else {
      newFavorites = [...favorites, devotion.id];
    }
    
    localStorage.setItem("devotion_favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("您的浏览器不支持语音朗读功能");
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!devotion) {
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
            📖 今日灵修
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>

        {/* Scripture */}
        <Card className="mb-6">
          <ScriptureDisplay
            reference={devotion.scriptureRef}
            text={devotion.scriptureText}
            showActions
            onFavorite={toggleFavorite}
            onRead={() => speakText(devotion.scriptureText)}
            isFavorite={isFavorite}
          />
        </Card>

        {/* Explanation */}
        <Card title="白话理解" icon="💬" className="mb-6">
          <p className="text-base leading-relaxed">
            {devotion.explanation}
          </p>
        </Card>

        {/* Keywords */}
        <Card title="关键词解释" icon="🔑" className="mb-6">
          <div className="space-y-3">
            {devotion.keywords.split("。").filter(Boolean).map((keyword, index) => {
              const [term, definition] = keyword.split("：");
              return (
                <div key={index} className="border-l-4 border-primary pl-3">
                  <p className="font-medium text-primary">{term}：</p>
                  <p className="text-gray-700">{definition}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Reflection Questions */}
        <Card title="默想问题" icon="🤔" className="mb-6">
          <div className="whitespace-pre-line text-base leading-relaxed">
            {devotion.reflectionQuestions}
          </div>
        </Card>

        {/* Prayer */}
        <Card title="今日祷告" icon="🙏" className="mb-6">
          <p className="text-base leading-relaxed italic">
            {devotion.prayer}
          </p>
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => speakText(devotion.prayer)}
              icon={isSpeaking ? "🔊" : "🔇"}
            >
              {isSpeaking ? "朗读中..." : "朗读祷告"}
            </Button>
          </div>
        </Card>

        {/* Reminder */}
        <Card className="bg-yellow-50 border border-yellow-200 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-yellow-800">今日提醒</p>
              <p className="text-sm text-yellow-700 mt-1">
                {devotion.reminder}
              </p>
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button
            variant="primary"
            fullWidth
            onClick={toggleFavorite}
          >
            {isFavorite ? "❤️ 已收藏" : "🤍 收藏今日灵修"}
          </Button>
          
          <Button
            variant="secondary"
            fullWidth
            onClick={isSpeaking ? stopSpeaking : () => speakText(devotion.scriptureText + "。" + devotion.explanation)}
          >
            {isSpeaking ? "⏹️ 停止朗读" : "🔊 朗读全文"}
          </Button>
        </div>

        {/* Related features */}
        <Card className="mt-6">
          <h3 className="font-semibold mb-3">相关功能</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/ask">
              <Button variant="secondary" fullWidth>
                ❓ 问经文
              </Button>
            </Link>
            <Link href="/memory">
              <Button variant="secondary" fullWidth>
                📝 背经练习
              </Button>
            </Link>
          </div>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button variant="ghost">
            ← 昨日灵修
          </Button>
          <Button variant="ghost">
            明日灵修 →
          </Button>
        </div>
      </div>
    </Layout>
  );
}
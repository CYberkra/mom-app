"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { 
  MemoryVerse, 
  splitIntoSentences, 
  createBlankedText,
  calculateScore,
  savePracticeSession,
  getPracticeStats
} from "@/lib/memory-data";

export default function MemoryPage() {
  const [verses, setVerses] = useState<MemoryVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<MemoryVerse | null>(null);
  const [practiceMode, setPracticeMode] = useState<"view" | "sentence" | "blank" | "test">("view");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [practiceStartTime, setPracticeStartTime] = useState<Date | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVerse, setNewVerse] = useState({ reference: "", text: "" });
  const [stats, setStats] = useState(getPracticeStats());

  // Fetch verses from API
  useEffect(() => {
    fetchVerses();
  }, []);

  const fetchVerses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/memory");
      const data = await response.json();
      
      if (data.success) {
        setVerses(data.data);
      } else {
        // Fallback to mock data
        setVerses([
          {
            id: 1,
            reference: "约翰福音 3:16",
            text: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。",
            isFavorite: true,
            practiceCount: 5,
            streak: 3,
            lastPracticed: "2026-03-21",
            createdAt: "2026-03-01",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch verses:", error);
      // Fallback to mock data
      setVerses([
        {
          id: 1,
          reference: "约翰福音 3:16",
          text: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。",
          isFavorite: true,
          practiceCount: 5,
          streak: 3,
          lastPracticed: "2026-03-21",
          createdAt: "2026-03-01",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: number) => {
    try {
      const response = await fetch("/api/memory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggleFavorite" }),
      });
      
      const data = await response.json();
      if (data.success) {
        setVerses(verses.map(v => v.id === id ? data.data : v));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      // Fallback to local update
      setVerses(verses.map(v => 
        v.id === id ? { ...v, isFavorite: !v.isFavorite } : v
      ));
    }
  };

  const startPractice = (verse: MemoryVerse, mode: "view" | "sentence" | "blank" | "test") => {
    setSelectedVerse(verse);
    setPracticeMode(mode);
    setCurrentSentenceIndex(0);
    setUserInput("");
    setPracticeStartTime(new Date());
  };

  const handlePracticeComplete = async (score?: number) => {
    if (!selectedVerse || !practiceStartTime) return;
    
    const endTime = new Date();
    const timeSpent = (endTime.getTime() - practiceStartTime.getTime()) / 1000;
    
    // Calculate score if in test mode
    const finalScore = practiceMode === "test" 
      ? calculateScore(selectedVerse.text, userInput, timeSpent)
      : score || 100;
    
    // Save practice session
    savePracticeSession({
      verseId: selectedVerse.id,
      startTime: practiceStartTime,
      endTime,
      score: finalScore,
      completed: true,
    });
    
    // Update verse stats via API
    try {
      const response = await fetch("/api/memory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedVerse.id, action: "practice" }),
      });
      
      const data = await response.json();
      if (data.success) {
        setVerses(verses.map(v => v.id === selectedVerse.id ? data.data : v));
      }
    } catch (error) {
      console.error("Failed to update practice stats:", error);
      // Fallback to local update
      setVerses(verses.map(v => 
        v.id === selectedVerse.id 
          ? { 
              ...v, 
              practiceCount: v.practiceCount + 1,
              streak: v.streak + 1,
              lastPracticed: new Date().toISOString().split('T')[0],
            }
          : v
      ));
    }
    
    // Update stats
    setStats(getPracticeStats());
    
    // Reset practice state
    setSelectedVerse(null);
    setPracticeMode("view");
    setPracticeStartTime(null);
  };

  const addNewVerse = async () => {
    if (!newVerse.reference.trim() || !newVerse.text.trim()) return;
    
    try {
      const response = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVerse),
      });
      
      const data = await response.json();
      if (data.success) {
        setVerses([...verses, data.data]);
        setNewVerse({ reference: "", text: "" });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Failed to add verse:", error);
      // Fallback to local add
      const newId = Math.max(...verses.map(v => v.id), 0) + 1;
      setVerses([...verses, {
        id: newId,
        ...newVerse,
        isFavorite: false,
        practiceCount: 0,
        streak: 0,
        lastPracticed: null,
        createdAt: new Date().toISOString().split('T')[0],
      }]);
      setNewVerse({ reference: "", text: "" });
      setShowAddForm(false);
    }
  };

  const deleteVerse = async (id: number) => {
    if (!confirm("确定要删除这节经文吗？")) return;
    
    try {
      const response = await fetch(`/api/memory?id=${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      if (data.success) {
        setVerses(verses.filter(v => v.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete verse:", error);
      // Fallback to local delete
      setVerses(verses.filter(v => v.id !== id));
    }
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
            📝 背经练习
          </h1>
          <p className="text-gray-600 mt-1">
            记忆神的话语，生命得建造
          </p>
        </div>

        {/* Stats overview */}
        <Card className="mb-6">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{verses.length}</p>
              <p className="text-xs text-gray-500">经文总数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.totalSessions}</p>
              <p className="text-xs text-gray-500">练习次数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.averageScore}</p>
              <p className="text-xs text-gray-500">平均分数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.longestStreak}</p>
              <p className="text-xs text-gray-500">最长连续</p>
            </div>
          </div>
        </Card>

        {/* Verse list */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">我的经文库</h2>
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => setShowAddForm(true)}
            >
              ➕ 添加经文
            </Button>
          </div>
          
          {verses.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-500 mb-4">还没有添加经文</p>
              <Button onClick={() => setShowAddForm(true)}>
                添加第一节经文
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {verses.map(verse => (
                <Card key={verse.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">{verse.reference}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        练习: {verse.practiceCount}次 | 
                        连续: {verse.streak}天 |
                        上次: {verse.lastPracticed || "未练习"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFavorite(verse.id)}
                        className="text-2xl"
                      >
                        {verse.isFavorite ? "❤️" : "🤍"}
                      </button>
                      <button
                        onClick={() => deleteVerse(verse.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {verse.text}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => startPractice(verse, "view")}
                    >
                      📖 查看
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => startPractice(verse, "sentence")}
                    >
                      📝 逐句
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => startPractice(verse, "blank")}
                    >
                      ✏️ 挖空
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => startPractice(verse, "test")}
                    >
                      🎯 测试
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add verse modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">添加新经文</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">经文引用</label>
                  <input
                    type="text"
                    value={newVerse.reference}
                    onChange={(e) => setNewVerse({...newVerse, reference: e.target.value})}
                    placeholder="例如：约翰福音 3:16"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">经文内容</label>
                  <textarea
                    value={newVerse.text}
                    onChange={(e) => setNewVerse({...newVerse, text: e.target.value})}
                    placeholder="输入完整的经文内容"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddForm(false)}
                    fullWidth
                  >
                    取消
                  </Button>
                  <Button
                    onClick={addNewVerse}
                    fullWidth
                  >
                    添加
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Practice modal */}
        {selectedVerse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-1">
                  {selectedVerse.reference}
                </h3>
                <p className="text-gray-600">
                  {practiceMode === "view" && "查看经文"}
                  {practiceMode === "sentence" && "逐句学习"}
                  {practiceMode === "blank" && "挖空练习"}
                  {practiceMode === "test" && "背诵测试"}
                </p>
              </div>
              
              {/* View mode */}
              {practiceMode === "view" && (
                <div className="mb-6">
                  <div className="scripture-text mb-4">
                    {selectedVerse.text}
                  </div>
                  <Button
                    onClick={() => handlePracticeComplete(100)}
                    fullWidth
                  >
                    完成查看
                  </Button>
                </div>
              )}
              
              {/* Sentence mode */}
              {practiceMode === "sentence" && (
                <div className="mb-6">
                  <div className="mb-4">
                    {splitIntoSentences(selectedVerse.text).map((sentence, index) => (
                      <div 
                        key={index}
                        className={`p-3 mb-2 rounded-lg ${
                          index === currentSentenceIndex 
                            ? "bg-blue-100 border-2 border-blue-500" 
                            : "bg-gray-50"
                        }`}
                      >
                        <p className="text-lg">{sentence}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentSentenceIndex(Math.max(0, currentSentenceIndex - 1))}
                      disabled={currentSentenceIndex === 0}
                    >
                      上一句
                    </Button>
                    <Button
                      onClick={() => {
                        if (currentSentenceIndex < splitIntoSentences(selectedVerse.text).length - 1) {
                          setCurrentSentenceIndex(currentSentenceIndex + 1);
                        } else {
                          handlePracticeComplete(100);
                        }
                      }}
                      fullWidth
                    >
                      {currentSentenceIndex < splitIntoSentences(selectedVerse.text).length - 1 
                        ? "下一句" 
                        : "完成学习"}
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Blank mode */}
              {practiceMode === "blank" && (
                <div className="mb-6">
                  <div className="scripture-text mb-4">
                    {createBlankedText(selectedVerse.text, 0.3)}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    尝试回忆被挖空的部分，然后点击查看原文核对
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        alert(selectedVerse.text);
                      }}
                      fullWidth
                    >
                      查看原文
                    </Button>
                    <Button
                      onClick={() => handlePracticeComplete(80)}
                      fullWidth
                    >
                      完成练习
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Test mode */}
              {practiceMode === "test" && (
                <div className="mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      请背诵输入这节经文：
                    </label>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="输入你记忆中的经文内容..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedVerse(null)}
                      fullWidth
                    >
                      取消
                    </Button>
                    <Button
                      onClick={() => handlePracticeComplete()}
                      fullWidth
                    >
                      提交测试
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Close button for non-test modes */}
              {practiceMode !== "test" && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedVerse(null)}
                  fullWidth
                >
                  关闭
                </Button>
              )}
            </Card>
          </div>
        )}

        {/* Help section */}
        <Card title="练习方法" icon="💡" className="mb-8">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">📖 查看模式</p>
              <p className="text-gray-600">完整阅读经文，熟悉内容</p>
            </div>
            <div>
              <p className="font-medium">📝 逐句模式</p>
              <p className="text-gray-600">一句一句学习，加深记忆</p>
            </div>
            <div>
              <p className="font-medium">✏️ 挖空模式</p>
              <p className="text-gray-600">部分文字被挖空，测试记忆</p>
            </div>
            <div>
              <p className="font-medium">🎯 测试模式</p>
              <p className="text-gray-600">完整背诵输入，系统评分</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
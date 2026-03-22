"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { 
  JournalEntry, 
  JournalCategory,
  formatDate,
  getRelativeTime,
  getCategoryColor,
  getCategoryIcon,
  exportToText,
  downloadTextFile,
  getJournalStats
} from "@/lib/journal-data";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<JournalCategory>("感动");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [stats, setStats] = useState(getJournalStats([]));

  const categories: JournalCategory[] = ["感动", "收获", "代祷", "感恩", "反思"];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`/api/journal?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.data);
        setStats(getJournalStats(data.data));
      } else {
        // Fallback to mock data
        const mockEntries = [
          {
            id: 1,
            date: "2026-03-21",
            content: "今天读到约翰福音3:16，感受到神的爱是如此深厚。我为家人祷告，求神保守他们平安。",
            aiSummary: "今天默想神的爱，为家人祷告求平安。",
            category: "感动",
            tags: ["神的爱", "祷告"],
            createdAt: "2026-03-21T10:30:00Z",
          },
        ];
        setEntries(mockEntries);
        setStats(getJournalStats(mockEntries));
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
      // Fallback to mock data
      const mockEntries = [
        {
          id: 1,
          date: "2026-03-21",
          content: "今天读到约翰福音3:16，感受到神的爱是如此深厚。我为家人祷告，求神保守他们平安。",
          aiSummary: "今天默想神的爱，为家人祷告求平安。",
          category: "感动",
          tags: ["神的爱", "祷告"],
          createdAt: "2026-03-21T10:30:00Z",
        },
      ];
      setEntries(mockEntries);
      setStats(getJournalStats(mockEntries));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSaving(true);
    
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), category }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEntries([data.data, ...entries]);
        setContent("");
        setStats(getJournalStats([data.data, ...entries]));
      } else {
        // Fallback to local save
        const newEntry: JournalEntry = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          content: content.trim(),
          aiSummary: content.length > 50 ? content.substring(0, 50) + "..." : content,
          category,
          tags: ["灵修"],
          createdAt: new Date().toISOString(),
        };
        setEntries([newEntry, ...entries]);
        setContent("");
        setStats(getJournalStats([newEntry, ...entries]));
      }
    } catch (error) {
      console.error("Failed to save entry:", error);
      // Fallback to local save
      const newEntry: JournalEntry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        content: content.trim(),
        aiSummary: content.length > 50 ? content.substring(0, 50) + "..." : content,
        category,
        tags: ["灵修"],
        createdAt: new Date().toISOString(),
      };
      setEntries([newEntry, ...entries]);
      setContent("");
      setStats(getJournalStats([newEntry, ...entries]));
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: number) => {
    if (!confirm("确定要删除这条记录吗？")) return;
    
    try {
      const response = await fetch(`/api/journal?id=${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      if (data.success) {
        const newEntries = entries.filter(e => e.id !== id);
        setEntries(newEntries);
        setStats(getJournalStats(newEntries));
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
      // Fallback to local delete
      const newEntries = entries.filter(e => e.id !== id);
      setEntries(newEntries);
      setStats(getJournalStats(newEntries));
    }
  };

  const handleExport = () => {
    const text = exportToText(entries);
    const filename = `灵修记录_${new Date().toISOString().split('T')[0]}.txt`;
    downloadTextFile(text, filename);
  };

  const handleSearch = () => {
    fetchEntries();
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
            📓 今日记录
          </h1>
          <p className="text-gray-600 mt-1">
            记录今天的感动和收获
          </p>
        </div>

        {/* Stats overview */}
        <Card className="mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{stats.totalEntries}</p>
              <p className="text-xs text-gray-500">总记录数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.recentStreak}</p>
              <p className="text-xs text-gray-500">连续天数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.averageLength}</p>
              <p className="text-xs text-gray-500">平均字数</p>
            </div>
          </div>
        </Card>

        {/* New entry form */}
        <Card className="mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                今天的感动、收获或代祷事项
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的感受、学到的东西，或者需要祷告的事情..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">分类</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      category === cat
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {getCategoryIcon(cat)} {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <Button type="submit" fullWidth loading={saving}>
              ✨ 保存并整理
            </Button>
          </form>
        </Card>

        {/* Search and filter */}
        <Card className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索记录内容..."
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
            <Button onClick={handleSearch} variant="secondary">
              🔍
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === "" ? "bg-primary text-white" : "bg-gray-100"
              }`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === cat
                    ? "bg-primary text-white"
                    : "bg-gray-100"
                }`}
              >
                {getCategoryIcon(cat)} {cat}
              </button>
            ))}
          </div>
        </Card>

        {/* Entries list */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">最近记录</h2>
            <Button variant="ghost" size="small" onClick={handleExport}>
              📤 导出
            </Button>
          </div>
          
          {entries.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-500 mb-4">还没有记录</p>
              <p className="text-sm text-gray-400">
                写下今天的感动、收获或代祷事项吧
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <Card key={entry.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(entry.category)}`}>
                        {getCategoryIcon(entry.category)} {entry.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getRelativeTime(entry.createdAt)}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-primary font-medium mb-1">
                      ✨ AI整理: {entry.aiSummary}
                    </p>
                  </div>
                  
                  <p className="text-gray-700 whitespace-pre-line mb-3">
                    {entry.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Prompts */}
        <Card title="记录提示" icon="💡" className="mb-8">
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">今天学到了什么？</p>
              <p className="text-sm text-gray-600">
                记录从经文或生活中学到的功课
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">有什么感动？</p>
              <p className="text-sm text-gray-600">
                圣灵给你的提醒或感动
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">需要为什么祷告？</p>
              <p className="text-sm text-gray-600">
                写下需要代祷的人或事情
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";

interface AskResult {
  query: string;
  type: string;
  result: string;
  timestamp: string;
}

export default function AskPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const searches = localStorage.getItem("recent_ask_searches");
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(newSearches);
    localStorage.setItem("recent_ask_searches", JSON.stringify(newSearches));
  };

  const handleSubmit = async (e: React.FormEvent, type: string = "explanation") => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim(), type }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        saveRecentSearch(query.trim());
      } else {
        // Fallback to mock response
        setResult({
          query: query.trim(),
          type,
          result: `关于"${query.trim()}"的解释：\n\n这是一段模拟的AI解释。在实际应用中，这里会调用AI服务返回对经文或问题的解释。\n\n解释会以温和、朴素、生活化的语言呈现，适合中老年用户理解。`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to fetch explanation:", error);
      // Fallback to mock response
      setResult({
        query: query.trim(),
        type,
        result: `关于"${query.trim()}"的解释：\n\n这是一段模拟的AI解释。在实际应用中，这里会调用AI服务返回对经文或问题的解释。\n\n解释会以温和、朴素、生活化的语言呈现，适合中老年用户理解。`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimpleExplanation = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim(), type: "simple" }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        // Fallback
        setResult(prev => prev ? {
          ...prev,
          type: "simple",
          result: prev.result + "\n\n---\n\n再讲简单一点：\n\n就像跟邻居聊天一样简单，不需要复杂的神学词汇。",
        } : null);
      }
    } catch (error) {
      console.error("Failed to fetch simple explanation:", error);
      // Fallback
      setResult(prev => prev ? {
        ...prev,
        type: "simple",
        result: prev.result + "\n\n---\n\n再讲简单一点：\n\n就像跟邻居聊天一样简单，不需要复杂的神学词汇。",
      } : null);
    } finally {
      setLoading(false);
    }
  };

  const handleLifeExample = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim(), type: "example" }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        // Fallback
        setResult(prev => prev ? {
          ...prev,
          type: "example",
          result: prev.result + "\n\n---\n\n生活例子：\n\n就像你每天照顾家人一样，神也这样细心照顾我们。",
        } : null);
      }
    } catch (error) {
      console.error("Failed to fetch life example:", error);
      // Fallback
      setResult(prev => prev ? {
        ...prev,
        type: "example",
        result: prev.result + "\n\n---\n\n生活例子：\n\n就像你每天照顾家人一样，神也这样细心照顾我们。",
      } : null);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    // Auto-submit with a slight delay to allow state update
    setTimeout(() => {
      const form = document.getElementById("ask-form") as HTMLFormElement;
      if (form) {
        form.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    }, 100);
  };

  return (
    <Layout>
      <div className="container py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">
            ❓ 问一句经文
          </h1>
          <p className="text-gray-600 mt-1">
            输入经文或问题，获取解释
          </p>
        </div>

        {/* Search form */}
        <Card className="mb-6">
          <form id="ask-form" onSubmit={(e) => handleSubmit(e)}>
            <div className="mb-4">
              <label htmlFor="query" className="block text-sm font-medium mb-2">
                输入经文或问题
              </label>
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例如：约翰福音 3:16 或 什么是信心？"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button type="submit" fullWidth loading={loading}>
              🔍 查询解释
            </Button>
          </form>
        </Card>

        {/* Result */}
        {result && (
          <Card title="解释结果" icon="📖" className="mb-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">查询：</span>
                <span className="font-medium">{result.query}</span>
              </div>
              <div className="whitespace-pre-line text-base leading-relaxed scripture-text">
                {result.result}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={handleSimpleExplanation}
                loading={loading}
              >
                🗣️ 再讲简单一点
              </Button>
              <Button
                variant="secondary"
                onClick={handleLifeExample}
                loading={loading}
              >
                🏠 举生活例子
              </Button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(result.result);
                  alert("已复制到剪贴板");
                }}
              >
                📋 复制解释
              </Button>
            </div>
          </Card>
        )}

        {/* Recent searches */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">最近查询</h2>
          {recentSearches.length > 0 ? (
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <Card 
                  key={index} 
                  clickable 
                  hoverable 
                  className="p-3"
                  onClick={() => handleRecentSearchClick(search)}
                >
                  <p className="text-gray-700">{search}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-4 text-center text-gray-500">
              <p>还没有查询记录</p>
              <p className="text-sm mt-1">试试输入一段经文或问题吧</p>
            </Card>
          )}
        </div>

        {/* Help section */}
        <Card title="使用帮助" icon="💡" className="mb-8">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium">查询经文解释</p>
              <p className="text-gray-600">输入经文引用，如"约翰福音 3:16"</p>
            </div>
            <div>
              <p className="font-medium">询问信仰问题</p>
              <p className="text-gray-600">输入问题，如"什么是信心？"或"如何祷告？"</p>
            </div>
            <div>
              <p className="font-medium">获取简单解释</p>
              <p className="text-gray-600">点击"再讲简单一点"按钮</p>
            </div>
            <div>
              <p className="font-medium">获取生活例子</p>
              <p className="text-gray-600">点击"举生活例子"按钮</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
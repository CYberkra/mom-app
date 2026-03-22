export interface JournalEntry {
  id: number;
  date: string;
  content: string;
  aiSummary: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export type JournalCategory = "感动" | "收获" | "代祷" | "感恩" | "反思";

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

// Helper function to format time
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper function to get relative time
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? "刚刚" : `${diffMinutes}分钟前`;
    }
    return diffHours <= 1 ? "1小时前" : `${diffHours}小时前`;
  } else if (diffDays === 1) {
    return "昨天";
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return formatDate(dateString);
  }
}

// Helper function to export entries to text
export function exportToText(entries: JournalEntry[]): string {
  let output = "妈妈灵修助手 - 灵修记录导出\n";
  output += "=".repeat(40) + "\n\n";
  
  entries.forEach(entry => {
    output += `日期: ${formatDate(entry.date)}\n`;
    output += `分类: ${entry.category}\n`;
    output += `标签: ${entry.tags.join(", ")}\n`;
    output += `内容:\n${entry.content}\n`;
    output += `AI整理: ${entry.aiSummary}\n`;
    output += "-".repeat(40) + "\n\n";
  });
  
  output += `导出时间: ${new Date().toLocaleString("zh-CN")}\n`;
  output += `共 ${entries.length} 条记录\n`;
  
  return output;
}

// Helper function to download text as file
export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper function to get category color
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "感动": "bg-pink-100 text-pink-800",
    "收获": "bg-blue-100 text-blue-800",
    "代祷": "bg-purple-100 text-purple-800",
    "感恩": "bg-yellow-100 text-yellow-800",
    "反思": "bg-gray-100 text-gray-800",
  };
  
  return colors[category] || "bg-gray-100 text-gray-800";
}

// Helper function to get category icon
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "感动": "💖",
    "收获": "📚",
    "代祷": "🙏",
    "感恩": "🙌",
    "反思": "🤔",
  };
  
  return icons[category] || "📝";
}

// Local storage helpers
export function saveJournalLocally(entry: JournalEntry): void {
  if (typeof window === "undefined") return;
  
  try {
    const entries = getLocalJournalEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.unshift(entry);
    }
    
    // Keep only last 100 entries
    const limitedEntries = entries.slice(0, 100);
    localStorage.setItem("journal_entries", JSON.stringify(limitedEntries));
  } catch (error) {
    console.error("Failed to save journal locally:", error);
  }
}

export function getLocalJournalEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  
  try {
    const entries = localStorage.getItem("journal_entries");
    return entries ? JSON.parse(entries) : [];
  } catch {
    return [];
  }
}

export function deleteLocalJournalEntry(id: number): void {
  if (typeof window === "undefined") return;
  
  try {
    const entries = getLocalJournalEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem("journal_entries", JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete journal entry locally:", error);
  }
}

// Statistics helpers
export function getJournalStats(entries: JournalEntry[]): {
  totalEntries: number;
  categoryCounts: Record<string, number>;
  recentStreak: number;
  averageLength: number;
} {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      categoryCounts: {},
      recentStreak: 0,
      averageLength: 0,
    };
  }
  
  const categoryCounts: Record<string, number> = {};
  let totalLength = 0;
  
  entries.forEach(entry => {
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
    totalLength += entry.content.length;
  });
  
  // Calculate recent streak
  const dates = new Set<string>();
  entries.forEach(entry => {
    const date = new Date(entry.date).toISOString().split('T')[0];
    dates.add(date);
  });
  
  const sortedDates = Array.from(dates).sort();
  let currentStreak = 1;
  let longestStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return {
    totalEntries: entries.length,
    categoryCounts,
    recentStreak: longestStreak,
    averageLength: Math.round(totalLength / entries.length),
  };
}
export interface MemoryVerse {
  id: number;
  reference: string;
  text: string;
  isFavorite: boolean;
  practiceCount: number;
  streak: number;
  lastPracticed: string | null;
  createdAt: string;
}

export interface PracticeSession {
  verseId: number;
  startTime: Date;
  endTime?: Date;
  score?: number;
  completed: boolean;
}

// Helper function to split text into sentences
export function splitIntoSentences(text: string): string[] {
  // Split by Chinese punctuation marks
  const sentences = text.split(/[。！？，；：、\n]/g).filter(s => s.trim());
  return sentences.map(s => s.trim());
}

// Helper function to create blanked text
export function createBlankedText(text: string, blankRatio: number = 0.3): string {
  const words = text.split('');
  const blankCount = Math.floor(words.length * blankRatio);
  
  // Randomly select positions to blank
  const positions = new Set<number>();
  while (positions.size < blankCount) {
    const pos = Math.floor(Math.random() * words.length);
    // Don't blank punctuation or spaces
    if (!/[\s。，！？；：、]/.test(words[pos])) {
      positions.add(pos);
    }
  }
  
  return words.map((char, index) => 
    positions.has(index) ? '_' : char
  ).join('');
}

// Helper function to create sentence-by-sentence display
export function createSentenceBySentence(text: string): string[] {
  // Split by sentence-ending punctuation
  const sentences = text.split(/([。！？])/g);
  const result: string[] = [];
  
  for (let i = 0; i < sentences.length; i += 2) {
    if (sentences[i]) {
      // Combine sentence with its punctuation
      const sentence = sentences[i] + (sentences[i + 1] || '');
      if (sentence.trim()) {
        result.push(sentence.trim());
      }
    }
  }
  
  return result;
}

// Helper function to calculate practice score
export function calculateScore(
  originalText: string, 
  userInput: string, 
  timeSpentSeconds: number
): number {
  // Simple scoring algorithm
  const originalChars = originalText.replace(/\s/g, '').length;
  const inputChars = userInput.replace(/\s/g, '').length;
  
  // Character match score (0-70 points)
  let matchScore = 0;
  const minLength = Math.min(originalChars, inputChars);
  
  for (let i = 0; i < minLength; i++) {
    if (originalText[i] === userInput[i]) {
      matchScore += 70 / originalChars;
    }
  }
  
  // Completeness score (0-20 points)
  const completenessScore = (inputChars / originalChars) * 20;
  
  // Speed score (0-10 points) - faster is better, but with diminishing returns
  const speedScore = Math.max(0, 10 - (timeSpentSeconds / 10));
  
  return Math.min(100, Math.round(matchScore + completenessScore + speedScore));
}

// Helper function to get streak status
export function getStreakStatus(lastPracticed: string | null): {
  continues: boolean;
  daysSince: number;
} {
  if (!lastPracticed) {
    return { continues: false, daysSince: Infinity };
  }
  
  const lastDate = new Date(lastPracticed);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    continues: diffDays <= 1, // Today or yesterday
    daysSince: diffDays,
  };
}

// Local storage helpers for practice history
export function savePracticeSession(session: PracticeSession): void {
  if (typeof window === "undefined") return;
  
  try {
    const history = getPracticeHistory();
    history.push(session);
    localStorage.setItem("memory_practice_history", JSON.stringify(history.slice(-100))); // Keep last 100 sessions
  } catch {
    // Ignore errors
  }
}

export function getPracticeHistory(): PracticeSession[] {
  if (typeof window === "undefined") return [];
  
  try {
    const history = localStorage.getItem("memory_practice_history");
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

export function getPracticeStats(): {
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
  longestStreak: number;
} {
  const history = getPracticeHistory();
  
  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      averageScore: 0,
      longestStreak: 0,
    };
  }
  
  const totalSessions = history.length;
  const totalMinutes = history.reduce((sum, session) => {
    if (session.endTime) {
      const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
      return sum + duration;
    }
    return sum;
  }, 0);
  
  const scores = history.filter(s => s.score !== undefined).map(s => s.score!);
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
    : 0;
  
  // Calculate longest streak from practice dates
  const practiceDates = new Set<string>();
  history.forEach(session => {
    const date = new Date(session.startTime).toISOString().split('T')[0];
    practiceDates.add(date);
  });
  
  const sortedDates = Array.from(practiceDates).sort();
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
    totalSessions,
    totalMinutes: Math.round(totalMinutes),
    averageScore: Math.round(averageScore),
    longestStreak,
  };
}
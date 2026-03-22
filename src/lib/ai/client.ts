import { AIProvider, AIResponse, ScriptureExplanationResponse, DevotionGenerationResponse, JournalSummaryResponse } from './types';
import { MockProvider } from './providers/mock';
import { KimiProvider } from './providers/kimi';

class AIClient {
  private provider: AIProvider;
  private fallbackProvider: MockProvider;

  constructor() {
    this.fallbackProvider = new MockProvider();
    this.provider = this.initializeProvider();
  }

  private initializeProvider(): AIProvider {
    const providerName = process.env.AI_PROVIDER || 'mock';
    
    if (providerName === 'kimi') {
      const apiKey = process.env.KIMI_API_KEY;
      const baseUrl = process.env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1';
      const model = process.env.KIMI_MODEL || 'moonshot-v1-8k';
      
      if (!apiKey) {
        console.warn('KIMI_API_KEY not configured, falling back to mock provider');
        return this.fallbackProvider;
      }
      
      return new KimiProvider({
        apiKey,
        baseUrl,
        model,
      });
    }
    
    // Default to mock provider
    return this.fallbackProvider;
  }

  async explainScripture(query: string): Promise<AIResponse<ScriptureExplanationResponse>> {
    try {
      const response = await this.provider.explainScripture(query);
      
      // If provider failed and it's not already mock, try fallback
      if (!response.success && this.provider.name !== 'mock') {
        console.warn(`${this.provider.name} provider failed, using mock fallback`);
        return await this.fallbackProvider.explainScripture(query);
      }
      
      return response;
    } catch (error) {
      console.error('AI client error:', error);
      
      // Always fallback to mock on any error
      if (this.provider.name !== 'mock') {
        console.warn('Unexpected error, using mock fallback');
        return await this.fallbackProvider.explainScripture(query);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'mock',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async simplifyExplanation(query: string, originalExplanation: string): Promise<AIResponse<ScriptureExplanationResponse>> {
    try {
      const response = await this.provider.simplifyExplanation(query, originalExplanation);
      
      if (!response.success && this.provider.name !== 'mock') {
        return await this.fallbackProvider.simplifyExplanation(query, originalExplanation);
      }
      
      return response;
    } catch (error) {
      if (this.provider.name !== 'mock') {
        return await this.fallbackProvider.simplifyExplanation(query, originalExplanation);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'mock',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async generateLifeExample(query: string, originalExplanation: string): Promise<AIResponse<ScriptureExplanationResponse>> {
    try {
      const response = await this.provider.generateLifeExample(query, originalExplanation);
      
      if (!response.success && this.provider.name !== 'mock') {
        return await this.fallbackProvider.generateLifeExample(query, originalExplanation);
      }
      
      return response;
    } catch (error) {
      if (this.provider.name !== 'mock') {
        return await this.fallbackProvider.generateLifeExample(query, originalExplanation);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'mock',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async generateDevotion(date: Date): Promise<AIResponse<DevotionGenerationResponse>> {
    try {
      const response = await this.provider.generateDevotion(date);
      
      if (!response.success && this.provider.name !== 'mock') {
        return await this.fallbackProvider.generateDevotion(date);
      }
      
      return response;
    } catch (error) {
      if (this.provider.name !== 'mock') {
        return await this.fallbackProvider.generateDevotion(date);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'mock',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async processJournalEntry(content: string): Promise<AIResponse<JournalSummaryResponse>> {
    try {
      const response = await this.provider.processJournalEntry(content);
      
      if (!response.success && this.provider.name !== 'mock') {
        return await this.fallbackProvider.processJournalEntry(content);
      }
      
      return response;
    } catch (error) {
      if (this.provider.name !== 'mock') {
        return await this.fallbackProvider.processJournalEntry(content);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'mock',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get current provider info
  getProviderInfo(): { name: string; isFallback: boolean } {
    return {
      name: this.provider.name,
      isFallback: this.provider.name !== this.fallbackProvider.name,
    };
  }
}

// Singleton instance
let aiClientInstance: AIClient | null = null;

export function getAIClient(): AIClient {
  if (!aiClientInstance) {
    aiClientInstance = new AIClient();
  }
  return aiClientInstance;
}

// Export types for convenience
export type { AIProvider, AIResponse, ScriptureExplanationResponse, DevotionGenerationResponse, JournalSummaryResponse } from './types';
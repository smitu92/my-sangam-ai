
const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.AI_MODEL || 'phi3:mini';

export interface AIResponse {
    response: string;
    context?: number[];
}

export interface IntentAnalysisResult {
    intent: 'search' | 'apply' | 'eligibility' | 'info' | 'complaint' | 'greeting' | 'unknown';
    keywords: string[];
    confidence: number;
}

export interface RankedScheme {
    schemeId: string;
    score: number; // 0 to 100
    reason: string;
}

export class AIService {
    private static async queryOllama(prompt: string, model: string = DEFAULT_MODEL, format?: 'json'): Promise<string> {
        try {
            const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    prompt,
                    stream: false,
                    format: format, // 'json' checks JSON structure if supported, or just text
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('AI Service Error:', error);
            throw error;
        }
    }

    /**
     * Analyzes the user's message to determine their intent.
     */
    static async analyzeIntent(message: string): Promise<IntentAnalysisResult> {
        const prompt = `
        Analyze the following user message regarding government schemes and determine the intent.
        
        User Message: "${message}"
        
        Possible Intents:
        - "search": User is looking for specific schemes.
        - "apply": User wants to apply for a scheme.
        - "eligibility": User is asking if they are eligible.
        - "info": User wants general information.
        - "complaint": User is unhappy or reporting an issue.
        - "greeting": Simple greetings (hi, hello).
        - "unknown": Cannot determine.

        Output strictly in JSON format:
        {
            "intent": "intent_name",
            "keywords": ["keyword1", "keyword2"],
            "confidence": 0.95
        }
        `;

        try {
            const responseText = await this.queryOllama(prompt, DEFAULT_MODEL, 'json');
            // Clean up potentially messy JSON response from LLM
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error('Intent analysis failed:', e);
            return { intent: 'unknown', keywords: [], confidence: 0 };
        }
    }

    /**
     * Ranks schemes based on user profile compliance.
     */
    static async rankSchemes(userProfile: any, schemes: any[]): Promise<RankedScheme[]> {
        // Optimize: Send only relevant fields to avoid context window limits
        const simplifiedSchemes = schemes.map(s => ({
            id: s.id,
            title: s.title,
            category: s.category,
            eligibility: s.eligibility,
            ageMin: s.ageMin,
            ageMax: s.ageMax,
            incomeLimit: s.incomeLimit
        }));

        const prompt = `
        Task: Rank the following government schemes for a user based on their profile.
        
        User Profile:
        ${JSON.stringify(userProfile, null, 2)}
        
        Available Schemes:
        ${JSON.stringify(simplifiedSchemes, null, 2)}
        
        Instructions:
        1. Compare user attributes (age, income, category, occupation) with scheme eligibility.
        2. Assign a score from 0-100 (100 = perfect match, 0 = not eligible).
        3. Explain the reason briefly.
        
        Output strictly in JSON format as a list:
        [
            {
                "schemeId": "id",
                "score": 95,
                "reason": "Matches age and income criteria perfectly."
            }
        ]
        `;

        try {
            const responseText = await this.queryOllama(prompt, DEFAULT_MODEL, 'json');
            // Clean up potentially messy JSON response from LLM
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error('Ranking failed:', e);
            return []; // Return empty list on failure
        }
    }

    /**
     * Generates short reasons for specific schemes via Python FastAPI.
     */
    static async generateReasons(userProfile: any, schemes: any[]): Promise<Record<string, string>> {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/generate-reasons", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_profile: {
                        occupation: userProfile.occupation,
                        annualIncome: userProfile.annualIncome,
                        state: userProfile.state,
                        caste: userProfile.caste,
                        location: userProfile.location
                    },
                    schemes: schemes.map(s => ({
                        id: s.id,
                        title: s.title,
                        benefits: s.benefits
                    }))
                }),
            });

            if (!response.ok) return {};
            return await response.json();
        } catch (e) {
            console.error('Reason generation failed:', e);
            return {};
        }
    }

    /**
     * Smart Search: Understands natural language queries and extracts search parameters.
     * e.g. "schemes for post graduation student" → { keywords: ["scholarship", "education"], category: "Education" }
     */
    static async smartSearch(query: string): Promise<{
        keywords: string[];
        category: string;
        targetGroup: string;
    }> {
        const prompt = `
        Analyze this search query about Indian government schemes: "${query}"
        
        Extract:
        1. "keywords" - relevant search terms to find matching schemes (max 5 words)
        2. "category" - ONE best matching category from: Agriculture, Education, Healthcare, Business, Housing, Finance, Social Welfare, or "All"
        3. "targetGroup" - who is this for (e.g. "students", "farmers", "women", "senior citizens", "entrepreneurs")
        
        Output strictly as JSON:
        {
            "keywords": ["keyword1", "keyword2"],
            "category": "Education",
            "targetGroup": "students"
        }
        `;

        try {
            const responseText = await this.queryOllama(prompt, DEFAULT_MODEL, 'json');
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanJson);
            console.log('🔍 AI Smart Search parsed:', result);
            return result;
        } catch (e) {
            console.error('Smart search failed:', e);
            return { keywords: [query], category: 'All', targetGroup: '' };
        }
    }
}

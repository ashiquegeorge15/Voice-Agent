/**
 * LLM & Dictionary Service for Lexi Voice Agent
 * Connects to Cloud LLMs (Google Gemini, Groq, OpenAI) and Free Dictionary API
 * Enables infinite dynamic vocabulary lookups, rich sentence analysis, and conversation.
 */

class LLMService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('lexi_llm_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Error loading LLM config:", e);
    }
    return {
      provider: 'gemini', // 'gemini' | 'groq' | 'openai' | 'dictionary_only'
      apiKey: '',
      model: 'gemini-1.5-flash',
      customEndpoint: ''
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem('lexi_llm_config', JSON.stringify(this.config));
    } catch (e) {
      console.warn("Error saving LLM config:", e);
    }
  }

  hasValidLLMKey() {
    return this.config.provider !== 'dictionary_only' && !!this.config.apiKey && this.config.apiKey.trim().length > 5;
  }

  getEngineLabel() {
    if (this.hasValidLLMKey()) {
      if (this.config.provider === 'gemini') return `⚡ Gemini AI Active`;
      if (this.config.provider === 'groq') return `⚡ Groq Llama Active`;
      if (this.config.provider === 'openai') return `⚡ OpenAI Active`;
    }
    return `📖 Live Dictionary Mode`;
  }

  /**
   * Fetches complete vocabulary data for ANY word in the world
   * Uses Cloud LLM if configured; otherwise seamlessly uses Free Dictionary API
   */
  async getWordProfile(word) {
    const cleanWord = word.trim().toLowerCase();

    // 1. If LLM key is configured, use Cloud LLM for rich generation
    if (this.hasValidLLMKey()) {
      try {
        const llmResult = await this.fetchWordFromLLM(cleanWord);
        if (llmResult && llmResult.word) {
          return llmResult;
        }
      } catch (err) {
        console.warn("Cloud LLM fetch error, falling back to Free Dictionary API:", err);
      }
    }

    // 2. Fallback to Free Dictionary API (Zero-config, works for any English word)
    return await this.fetchWordFromDictionaryAPI(cleanWord);
  }

  /**
   * Query Google Gemini or OpenAI/Groq for structured vocabulary data
   */
  async fetchWordFromLLM(word) {
    const prompt = `You are Lexi, an expert vocabulary tutor. Analyze the word or term: "${word}".
Return a strict JSON object with this exact structure (do NOT include markdown code fences or backticks):
{
  "id": "${word.toLowerCase().replace(/[^a-z0-9]/g, '_')}",
  "category": "Curated Discovery",
  "word": "${word}",
  "phonetic": "/IPA phonetic transcription/",
  "partOfSpeech": "noun/verb/adjective/etc.",
  "definition": "A clear, engaging, and precise definition (1-2 sentences).",
  "example": "A memorable real-world sentence illustrating the word in rich context.",
  "synonyms": ["synonym1", "synonym2", "synonym3", "synonym4"],
  "antonyms": ["antonym1", "antonym2"],
  "mnemonic": "A witty or clever memory hook to help remember the word forever.",
  "quizClue": "An engaging clue or scenario definition to test someone who doesn't know the word yet."
}`;

    if (this.config.provider === 'gemini') {
      const model = this.config.model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey.trim()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return this.cleanAndParseJSON(rawText);

    } else if (this.config.provider === 'groq' || this.config.provider === 'openai') {
      const endpoint = this.config.provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : (this.config.customEndpoint || 'https://api.openai.com/v1/chat/completions');
      
      const model = this.config.model || (this.config.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "You are an expert vocabulary agent. Return valid JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${this.config.provider} API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      return this.cleanAndParseJSON(rawText);
    }
  }

  /**
   * Free Dictionary API Fallback (No key needed)
   * https://api.dictionaryapi.dev/api/v2/entries/en/<word>
   */
  async fetchWordFromDictionaryAPI(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Word "${word}" not found in Dictionary API.`);
    }

    const data = await response.json();
    const entry = data[0];
    const meaning = entry.meanings?.[0] || {};
    const definitionObj = meaning.definitions?.[0] || {};

    // Extract synonyms
    let synonyms = meaning.synonyms || [];
    if (synonyms.length === 0 && definitionObj.synonyms) {
      synonyms = definitionObj.synonyms;
    }
    if (synonyms.length === 0) {
      synonyms = ["comparable", "related"];
    }

    // Extract phonetic
    let phonetic = entry.phonetic || '';
    if (!phonetic && entry.phonetics && entry.phonetics.length > 0) {
      const found = entry.phonetics.find(p => p.text);
      if (found) phonetic = found.text;
    }

    const cleanWord = entry.word || word;
    const pos = meaning.partOfSpeech || 'noun';
    const def = definitionObj.definition || `A term referring to ${cleanWord}.`;
    const example = definitionObj.example || `The concept of ${cleanWord} is frequently studied in modern language.`;

    return {
      id: cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      category: "Global Dictionary",
      word: cleanWord,
      phonetic: phonetic || `/${cleanWord}/`,
      partOfSpeech: pos,
      definition: def,
      example: example,
      synonyms: synonyms.slice(0, 5),
      antonyms: (meaning.antonyms || []).slice(0, 3),
      mnemonic: `Focus on root structure and sound association to anchor "${cleanWord}".`,
      quizClue: `What ${pos} means: ${def}`
    };
  }

  /**
   * Evaluate an original user sentence using Cloud LLM
   */
  async evaluateSentence(word, sentence) {
    if (!this.hasValidLLMKey()) {
      return null; // Fall back to local evaluation
    }

    const prompt = `Target vocabulary word: "${word.word}".
User sentence: "${sentence}".
Evaluate the user's sentence. Did they use "${word.word}" correctly, meaningfully, and grammatically?
Return a JSON object:
{
  "isCorrect": true/false,
  "feedback": "A warm, concise (2 sentences) spoken response from Lexi giving praise or constructive guidance.",
  "improvedVersion": "An enhanced or more expressive variation of their sentence if applicable, or empty string."
}`;

    try {
      if (this.config.provider === 'gemini') {
        const model = this.config.model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });
        const data = await res.json();
        return this.cleanAndParseJSON(data.candidates?.[0]?.content?.parts?.[0]?.text);
      }
    } catch (e) {
      console.warn("LLM sentence evaluation failed:", e);
    }
    return null;
  }

  cleanAndParseJSON(str) {
    if (!str) return null;
    let cleaned = str.trim();
    // Strip markdown code block fences if present
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  }
}

// Global instance
window.llmService = new LLMService();

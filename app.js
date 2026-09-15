/**
 * Lexi - AI Voice Vocabulary Coach
 * Main Application Orchestrator
 */

class VocabCoachApp {
  constructor() {
    this.currentMode = 'learn'; // 'learn' | 'quiz' | 'sentence' | 'free'
    this.selectedCategory = 'all';
    this.deck = VocabService.getAll();
    this.currentIndex = 0;
    this.currentWord = this.deck[0];
    
    // User progress metrics
    this.stats = this.loadStats();
    this.autoListen = true;
    this.waitingForAnswer = false;
    this.activeQuizWord = null;

    // Components
    this.visualizer = new VoiceOrbVisualizer('voiceOrbCanvas');
    this.initSpeechEngine();
    this.cacheDom();
    this.bindEvents();
    this.updateHUD();
    this.renderWordCard(this.currentWord);
    this.populateVoiceList();
  }

  loadStats() {
    try {
      const saved = localStorage.getItem('lexi_vocab_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage error", e);
    }
    return {
      streak: 1,
      mastered: [],
      quizCorrect: 0,
      quizTotal: 0,
      lastActiveDate: new Date().toDateString()
    };
  }

  saveStats() {
    try {
      localStorage.setItem('lexi_vocab_stats', JSON.stringify(this.stats));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }

  initSpeechEngine() {
    this.speech = new SpeechEngine({
      onStateChange: (state) => {
        this.visualizer.setState(state);
        this.updateAgentStatusUI(state);
      },
      onTranscript: (result) => {
        const livePreview = document.getElementById('liveSpeechPreview');
        const liveText = document.getElementById('liveTranscriptText');

        if (result.interim && !result.isFinal) {
          livePreview.classList.add('active');
          liveText.textContent = `"${result.interim}"`;
        }

        if (result.isFinal && result.final.trim().length > 0) {
          livePreview.classList.remove('active');
          this.speech.stopListening();
          this.handleUserInput(result.final.trim());
        }
      },
      onError: (err) => {
        const livePreview = document.getElementById('liveSpeechPreview');
        if (livePreview) livePreview.classList.remove('active');

        if (err === 'network') {
          if (!this.hasShownNetworkNotice) {
            this.hasShownNetworkNotice = true;
            this.showNetworkNotice();
          }
        } else {
          console.warn("Speech error:", err);
        }
      }
    });
  }

  cacheDom() {
    // Stage elements
    this.orbStageCard = document.getElementById('orbStageCard');
    this.agentStatusBadge = document.getElementById('agentStatusBadge');
    this.agentStatusText = document.getElementById('agentStatusText');
    this.micBtn = document.getElementById('micBtn');
    this.micHintText = document.getElementById('micHintText');
    
    // Vocab Card elements
    this.vocabWordEl = document.getElementById('vocabWord');
    this.vocabPosEl = document.getElementById('vocabPos');
    this.vocabPhoneticEl = document.getElementById('vocabPhonetic');
    this.vocabDefinitionEl = document.getElementById('vocabDefinition');
    this.vocabExampleEl = document.getElementById('vocabExample');
    this.synonymsWrapper = document.getElementById('synonymsWrapper');
    this.mnemonicTextEl = document.getElementById('mnemonicText');
    this.speakWordBtn = document.getElementById('speakWordBtn');
    this.bookmarkBtn = document.getElementById('bookmarkBtn');
    this.prevWordBtn = document.getElementById('prevWordBtn');
    this.nextWordBtn = document.getElementById('nextWordBtn');
    
    // HUD & Modes
    this.hudStreak = document.getElementById('hudStreak');
    this.hudMastered = document.getElementById('hudMastered');
    this.hudAccuracy = document.getElementById('hudAccuracy');
    this.engineBadge = document.getElementById('engineBadge');
    this.engineBadgeText = document.getElementById('engineBadgeText');
    this.modeTabs = document.querySelectorAll('.mode-tab');
    this.categoryFilter = document.getElementById('categoryFilter');
    
    // Dynamic Word Explorer & Active Card
    this.activeVocabCard = document.getElementById('activeVocabCard');
    this.exploreWordForm = document.getElementById('exploreWordForm');
    this.exploreWordInput = document.getElementById('exploreWordInput');
    this.exploreWordBtn = document.getElementById('exploreWordBtn');
    this.exploreBtnText = document.getElementById('exploreBtnText');

    // Chat & Transcript
    this.chatStream = document.getElementById('chatStream');
    this.chatInputForm = document.getElementById('chatInputForm');
    this.textInput = document.getElementById('textInput');
    this.clearChatBtn = document.getElementById('clearChatBtn');
    this.quickChipsContainer = document.getElementById('quickChipsContainer');
    
    // Settings modal & LLM config
    this.settingsModal = document.getElementById('settingsModal');
    this.settingsToggleBtn = document.getElementById('settingsToggleBtn');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.voiceSelect = document.getElementById('voiceSelect');
    this.speechRateSlider = document.getElementById('speechRateSlider');
    this.rateVal = document.getElementById('rateVal');
    this.autoListenToggle = document.getElementById('autoListenToggle');

    this.llmProviderSelect = document.getElementById('llmProviderSelect');
    this.llmApiKey = document.getElementById('llmApiKey');
    this.llmModelInput = document.getElementById('llmModelInput');
    this.saveLLMConfigBtn = document.getElementById('saveLLMConfigBtn');
    this.llmTestStatus = document.getElementById('llmTestStatus');
    this.apiKeyGroup = document.getElementById('apiKeyGroup');
    this.modelNameGroup = document.getElementById('modelNameGroup');
  }

  bindEvents() {
    // Mode Switcher Tabs
    this.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.setLearningMode(tab.dataset.mode);
      });
    });

    // Deck Selector
    this.categoryFilter.addEventListener('change', (e) => {
      this.selectedCategory = e.target.value;
      this.deck = this.selectedCategory === 'all' 
        ? VocabService.getAll() 
        : VocabService.getByCategory(this.selectedCategory);
      this.currentIndex = 0;
      this.currentWord = this.deck[0] || VocabService.getAll()[0];
      this.renderWordCard(this.currentWord);
      this.lexiSay(`Switched to the "${this.selectedCategory === 'all' ? 'All Vocabulary' : this.selectedCategory}" deck. Let's explore "${this.currentWord.word}".`);
    });

    // Mic Button Toggle
    this.micBtn.addEventListener('click', (e) => {
      if (e && e.detail === 0) {
        // Triggered by keyboard enter/space on focused button - ignore to avoid double toggle
        return;
      }
      this.micBtn.blur();
      this.toggleMicrophone();
    });

    // Spacebar clean toggle shortcut
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement === this.textInput) {
          return; // Let user type spaces in input fields
        }

        e.preventDefault();
        if (e.repeat) return; // Ignore continuous key-repeat when holding space

        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }

        this.toggleMicrophone();
      }
    });

    // Card Navigation
    this.nextWordBtn.addEventListener('click', () => this.nextWord());
    this.prevWordBtn.addEventListener('click', () => this.prevWord());

    // Word Pronunciation & Bookmark
    this.speakWordBtn.addEventListener('click', () => {
      this.pronounceCurrentWord();
    });

    this.bookmarkBtn.addEventListener('click', () => {
      this.toggleMastery(this.currentWord.id);
    });

    // Chat form submit
    this.chatInputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = this.textInput.value.trim();
      if (!val) return;
      this.textInput.value = '';
      this.handleUserInput(val);
    });

    // Clear Chat
    this.clearChatBtn.addEventListener('click', () => {
      this.chatStream.innerHTML = '';
      this.appendAgentMessage("History cleared. Ready when you are!", false);
    });

    // Quick Action Chips
    this.quickChipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn');
      if (!chip) return;
      const action = chip.dataset.action;
      this.handleQuickChip(action);
    });

    // Speech repeat delegation
    this.chatStream.addEventListener('click', (e) => {
      const repeatBtn = e.target.closest('.repeat-speech-btn');
      if (repeatBtn && repeatBtn.dataset.text) {
        this.lexiSay(repeatBtn.dataset.text, false);
      }
    });

    // Settings Modal
    this.settingsToggleBtn.addEventListener('click', () => {
      this.populateVoiceList();
      this.settingsModal.classList.add('open');
    });

    this.closeSettingsBtn.addEventListener('click', () => {
      this.settingsModal.classList.remove('open');
    });

    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.settingsModal.classList.remove('open');
      }
    });

    this.voiceSelect.addEventListener('change', (e) => {
      this.speech.setVoice(e.target.value);
    });

    this.speechRateSlider.addEventListener('input', (e) => {
      this.speech.speechRate = parseFloat(e.target.value);
      this.rateVal.textContent = `${this.speech.speechRate.toFixed(2)}x`;
    });

    this.autoListenToggle.addEventListener('change', (e) => {
      this.autoListen = e.target.checked;
    });

    // Explore Any Word Form Submit
    if (this.exploreWordForm) {
      this.exploreWordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const word = this.exploreWordInput.value.trim();
        if (word) {
          this.exploreAnyWord(word);
        }
      });
    }

    // Engine badge click opens settings
    if (this.engineBadge) {
      this.engineBadge.addEventListener('click', () => {
        this.settingsToggleBtn.click();
      });
    }

    // LLM Provider Select change
    if (this.llmProviderSelect) {
      this.llmProviderSelect.addEventListener('change', () => {
        const val = this.llmProviderSelect.value;
        const isDict = val === 'dictionary_only';
        if (this.apiKeyGroup) this.apiKeyGroup.style.display = isDict ? 'none' : 'flex';
        if (this.modelNameGroup) this.modelNameGroup.style.display = isDict ? 'none' : 'flex';

        if (val === 'gemini') this.llmModelInput.value = 'gemini-1.5-flash';
        else if (val === 'groq') this.llmModelInput.value = 'llama-3.3-70b-versatile';
        else if (val === 'openai') this.llmModelInput.value = 'gpt-4o-mini';
      });
    }

    // Save & Test LLM Config
    if (this.saveLLMConfigBtn) {
      this.saveLLMConfigBtn.addEventListener('click', async () => {
        const provider = this.llmProviderSelect.value;
        const apiKey = this.llmApiKey.value.trim();
        const model = this.llmModelInput.value.trim();

        window.llmService.saveConfig({ provider, apiKey, model });
        this.llmTestStatus.textContent = "Testing connection...";
        this.llmTestStatus.style.color = "var(--text-accent)";

        try {
          const testWord = await window.llmService.getWordProfile("serendipity");
          if (testWord && testWord.definition) {
            this.llmTestStatus.textContent = "✓ Connected successfully!";
            this.llmTestStatus.style.color = "var(--accent-emerald)";
            this.updateHUD();
            setTimeout(() => {
              this.settingsModal.classList.remove('open');
            }, 1200);
          } else {
            throw new Error("Invalid response format");
          }
        } catch (err) {
          this.llmTestStatus.textContent = `✗ Error: ${err.message || 'Check key and provider'}`;
          this.llmTestStatus.style.color = "var(--accent-rose)";
        }
      });
    }

    this.initLLMSettingsUI();
  }

  initLLMSettingsUI() {
    const config = window.llmService.config;
    if (this.llmProviderSelect) this.llmProviderSelect.value = config.provider;
    if (this.llmApiKey) this.llmApiKey.value = config.apiKey || '';
    if (this.llmModelInput) this.llmModelInput.value = config.model || 'gemini-1.5-flash';

    if (config.provider === 'dictionary_only') {
      if (this.apiKeyGroup) this.apiKeyGroup.style.display = 'none';
      if (this.modelNameGroup) this.modelNameGroup.style.display = 'none';
    }
  }

  toggleMicrophone() {
    if (this.speech.isListening) {
      this.speech.stopListening();
    } else {
      this.speech.startListening();
    }
  }

  populateVoiceList() {
    const voices = this.speech.getVoices();
    this.voiceSelect.innerHTML = '';
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      if (this.speech.selectedVoice && this.speech.selectedVoice.name === v.name) {
        opt.selected = true;
      }
      this.voiceSelect.appendChild(opt);
    });
  }

  updateAgentStatusUI(state) {
    this.orbStageCard.className = `orb-stage-card ${state}`;
    this.agentStatusBadge.className = `agent-status-badge ${state}`;

    if (state === 'listening') {
      this.agentStatusText.textContent = "Listening to you...";
      this.micBtn.classList.add('recording');
      this.micHintText.innerHTML = `<span>Listening... Speak clearly or release</span>`;
    } else if (state === 'speaking') {
      this.agentStatusText.textContent = "Lexi is Speaking";
      this.micBtn.classList.remove('recording');
      this.micHintText.innerHTML = `<span>Lexi is speaking...</span>`;
    } else if (state === 'processing') {
      this.agentStatusText.textContent = "Thinking...";
      this.micBtn.classList.remove('recording');
      this.micHintText.innerHTML = `<span>Analyzing speech...</span>`;
    } else {
      this.agentStatusText.textContent = "Lexi is Ready";
      this.micBtn.classList.remove('recording');
      this.micHintText.innerHTML = `<span>Tap microphone or spacebar to speak</span>`;
    }
  }

  updateHUD() {
    this.hudStreak.textContent = `${this.stats.streak} ${this.stats.streak === 1 ? 'Day' : 'Days'}`;
    this.hudMastered.textContent = this.stats.mastered.length;
    
    const accuracy = this.stats.quizTotal > 0 
      ? Math.round((this.stats.quizCorrect / this.stats.quizTotal) * 100) 
      : 100;
    this.hudAccuracy.textContent = `${accuracy}%`;

    if (this.engineBadgeText && window.llmService) {
      this.engineBadgeText.textContent = window.llmService.getEngineLabel();
    }

    // Update active word mastered status icon
    if (this.currentWord) {
      const isMastered = this.stats.mastered.includes(this.currentWord.id);
      this.bookmarkBtn.style.color = isMastered ? 'var(--accent-emerald)' : 'var(--text-secondary)';
      this.bookmarkBtn.title = isMastered ? 'Word Mastered!' : 'Mark as Mastered';
    }
  }

  async exploreAnyWord(inputWord) {
    const clean = inputWord.trim();
    if (!clean) return;

    // Visual feedback
    if (this.exploreBtnText) this.exploreBtnText.textContent = "Analyzing...";
    if (this.activeVocabCard) this.activeVocabCard.classList.add('loading');
    this.visualizer.setState('processing');
    this.updateAgentStatusUI('processing');

    try {
      const profile = await window.llmService.getWordProfile(clean);
      if (profile && profile.word) {
        // Add to active deck so user can navigate back to it
        const existingIdx = this.deck.findIndex(w => w.word.toLowerCase() === profile.word.toLowerCase());
        if (existingIdx === -1) {
          this.deck.unshift(profile);
          this.currentIndex = 0;
        } else {
          this.currentIndex = existingIdx;
        }

        this.renderWordCard(profile);
        if (this.exploreWordInput) this.exploreWordInput.value = '';

        const intro = `Here is "${profile.word}"! It's a ${profile.partOfSpeech} meaning: ${profile.definition}. Example: "${profile.example}". Try pronouncing it or using it in a sentence!`;
        this.lexiSay(intro, false);
      }
    } catch (err) {
      console.warn("Failed to explore word:", err);
      this.lexiSay(`I couldn't find detailed context for "${clean}". Please check the spelling or try another word!`, false);
    } finally {
      if (this.exploreBtnText) this.exploreBtnText.textContent = "Explore";
      if (this.activeVocabCard) this.activeVocabCard.classList.remove('loading');
      this.visualizer.setState('idle');
      this.updateAgentStatusUI('idle');
    }
  }

  renderWordCard(word) {
    if (!word) return;
    this.currentWord = word;
    this.vocabWordEl.textContent = word.word;
    this.vocabPosEl.textContent = word.partOfSpeech;
    this.vocabPhoneticEl.textContent = word.phonetic;
    this.vocabDefinitionEl.textContent = word.definition;

    // Highlight target word in example
    const regex = new RegExp(`(${word.word})`, 'gi');
    const highlightedExample = word.example.replace(regex, '<em>$1</em>');
    this.vocabExampleEl.innerHTML = `"${highlightedExample}"`;

    // Render synonyms
    this.synonymsWrapper.innerHTML = `<span class="synonyms-label">Synonyms:</span>` +
      word.synonyms.map(s => `<span class="syn-pill">${s}</span>`).join('');

    // Render mnemonic
    this.mnemonicTextEl.textContent = `Memory Hook: ${word.mnemonic}`;

    this.updateHUD();
  }

  nextWord() {
    this.currentIndex = (this.currentIndex + 1) % this.deck.length;
    this.renderWordCard(this.deck[this.currentIndex]);
    if (this.currentMode === 'learn') {
      this.startLearnModeForWord(this.currentWord);
    }
  }

  prevWord() {
    this.currentIndex = (this.currentIndex - 1 + this.deck.length) % this.deck.length;
    this.renderWordCard(this.deck[this.currentIndex]);
    if (this.currentMode === 'learn') {
      this.startLearnModeForWord(this.currentWord);
    }
  }

  toggleMastery(wordId) {
    const idx = this.stats.mastered.indexOf(wordId);
    if (idx > -1) {
      this.stats.mastered.splice(idx, 1);
    } else {
      this.stats.mastered.push(wordId);
      this.lexiSay(`Awesome! You've marked "${this.currentWord.word}" as mastered!`, false);
    }
    this.saveStats();
    this.updateHUD();
  }

  // ================= LEARNING MODES =================

  setLearningMode(mode) {
    this.currentMode = mode;
    this.waitingForAnswer = false;

    if (mode === 'learn') {
      this.startLearnModeForWord(this.currentWord);
    } else if (mode === 'quiz') {
      this.startQuizQuestion();
    } else if (mode === 'sentence') {
      this.startSentenceChallenge(this.currentWord);
    } else if (mode === 'free') {
      this.lexiSay("Free conversation active! Ask me about any word's definition, origin, or usage, or ask me for synonyms.", true);
    }
  }

  startLearnModeForWord(word) {
    const text = `Our word is "${word.word}". It's a ${word.partOfSpeech} meaning: ${word.definition}. For example: "${word.example}". Try saying the word "${word.word}" back to me!`;
    this.lexiSay(text, true);
    this.waitingForAnswer = true;
  }

  startQuizQuestion() {
    this.activeQuizWord = VocabService.getRandom();
    this.renderWordCard(this.activeQuizWord);
    this.waitingForAnswer = true;

    const question = `Here is your quiz clue: "${this.activeQuizWord.quizClue}". What word is this?`;
    this.lexiSay(question, true);
  }

  startSentenceChallenge(word) {
    this.renderWordCard(word);
    this.waitingForAnswer = true;
    const prompt = `Challenge time! Try creating an original sentence using our word "${word.word}". Speak your sentence whenever you're ready!`;
    this.lexiSay(prompt, true);
  }

  pronounceCurrentWord() {
    const text = `${this.currentWord.word}. ${this.currentWord.phonetic}.`;
    this.lexiSay(text, false);
  }

  // ================= CONVERSATION & INPUT HANDLING =================

  handleUserInput(input) {
    this.appendUserMessage(input);

    const clean = input.toLowerCase().trim();

    // Mode-specific handling
    if (this.currentMode === 'learn') {
      this.evaluateLearnInput(clean);
    } else if (this.currentMode === 'quiz') {
      this.evaluateQuizAnswer(clean);
    } else if (this.currentMode === 'sentence') {
      this.evaluateSentenceInput(clean, input);
    } else {
      this.evaluateFreeConversation(clean, input);
    }
  }

  evaluateLearnInput(clean) {
    const target = this.currentWord.word.toLowerCase();
    if (clean.includes(target)) {
      this.stats.quizCorrect++;
      this.stats.quizTotal++;
      if (!this.stats.mastered.includes(this.currentWord.id)) {
        this.stats.mastered.push(this.currentWord.id);
      }
      this.saveStats();
      this.updateHUD();

      const praise = `Excellent pronunciation of "${this.currentWord.word}"! Your articulation was clear and precise. Would you like to try the next word, or test this in a sentence?`;
      this.lexiSay(praise, false);
    } else {
      const feedback = `Good effort! You said "${clean}". The target word is "${this.currentWord.word}". Let's hear it once more: "${this.currentWord.word}". Try repeating it!`;
      this.lexiSay(feedback, true);
    }
  }

  evaluateQuizAnswer(clean) {
    const target = this.activeQuizWord || this.currentWord;
    const targetWord = target.word.toLowerCase();
    this.stats.quizTotal++;

    // Check direct word match
    if (clean.includes(targetWord)) {
      this.stats.quizCorrect++;
      this.stats.streak++;
      if (!this.stats.mastered.includes(target.id)) {
        this.stats.mastered.push(target.id);
      }
      this.saveStats();
      this.updateHUD();

      const response = `Spot on! The word is indeed "${target.word}". It means: ${target.definition}. Brilliant mastery! Ready for another quiz question?`;
      this.lexiSay(response, false);
      this.waitingForAnswer = false;
      return;
    }

    // Check synonym match
    const matchingSyn = target.synonyms.find(syn => clean.includes(syn.toLowerCase()));
    if (matchingSyn) {
      const response = `Great vocabulary thinking! "${matchingSyn}" is an exact synonym! The target word from our deck is "${target.word}". Well done!`;
      this.stats.quizCorrect++;
      this.saveStats();
      this.updateHUD();
      this.lexiSay(response, false);
      return;
    }

    // Missed answer
    this.saveStats();
    this.updateHUD();
    const response = `Close attempt! The word we were looking for is "${target.word}". ${target.definition}. Let's remember the hook: ${target.mnemonic}. Let's try another one!`;
    this.lexiSay(response, false);
  }

  async evaluateSentenceInput(clean, original) {
    const target = this.currentWord.word.toLowerCase();

    // 1. Try Cloud LLM evaluation if available
    if (window.llmService && window.llmService.hasValidLLMKey()) {
      this.visualizer.setState('processing');
      this.updateAgentStatusUI('processing');
      try {
        const llmEval = await window.llmService.evaluateSentence(this.currentWord, original);
        if (llmEval && llmEval.feedback) {
          if (llmEval.isCorrect) {
            this.stats.quizCorrect++;
            this.stats.quizTotal++;
            this.stats.streak++;
            this.saveStats();
            this.updateHUD();
          }
          this.lexiSay(llmEval.feedback, !llmEval.isCorrect);
          return;
        }
      } catch (e) {
        console.warn("LLM sentence eval failed, using heuristic:", e);
      } finally {
        this.visualizer.setState('idle');
        this.updateAgentStatusUI('idle');
      }
    }

    // 2. Local heuristic fallback
    const root = target.substring(0, Math.max(4, target.length - 2));
    const words = original.split(/\s+/).length;

    if (clean.includes(root)) {
      if (words >= 5) {
        this.stats.quizCorrect++;
        this.stats.quizTotal++;
        this.stats.streak++;
        this.saveStats();
        this.updateHUD();
        const praise = `Fabulous! You crafted a rich, expressive sentence: "${original}". Using "${this.currentWord.word}" like that shows true fluency and command!`;
        this.lexiSay(praise, false);
      } else {
        const encouragement = `Good start! You included "${this.currentWord.word}", but try expanding it into a complete, descriptive sentence so the meaning really shines!`;
        this.lexiSay(encouragement, true);
      }
    } else {
      const tip = `I heard: "${original}". Make sure to include our target word "${this.currentWord.word}" in your sentence! Give it another try!`;
      this.lexiSay(tip, true);
    }
  }

  async evaluateFreeConversation(clean, original) {
    // 1. Check for word exploration queries (e.g. "what does X mean", "define X", "explain X", "explore X")
    const queryRegex = /(?:what does|what is|meaning of|define|explain|tell me about|explore|how do you use)\s+([a-zA-Z\-]+)/i;
    const matchQuery = original.match(queryRegex);
    let targetWord = matchQuery ? matchQuery[1].toLowerCase().trim() : null;

    // If clean is just a single word (e.g. user typed/said "defenestration" or "zeitgeist")
    if (!targetWord && clean.split(/\s+/).length === 1 && clean.length > 2) {
      targetWord = clean;
    }

    if (targetWord) {
      await this.exploreAnyWord(targetWord);
      return;
    }

    // Check matching local word if present
    const localMatch = VocabService.findMatchingWord(clean);
    if (localMatch) {
      this.renderWordCard(localMatch);
      this.lexiSay(`You mentioned "${localMatch.word}". It's a ${localMatch.partOfSpeech} meaning: ${localMatch.definition}. Would you like to practice pronouncing it or use it in a sentence?`, false);
      return;
    }

    // 2. Check for synonym request
    if (clean.includes('synonym') || clean.includes('similar')) {
      const synRegex = /synonym(?:s)?\s+(?:for\s+)?([a-zA-Z\-]+)/i;
      const synMatch = original.match(synRegex);
      const wordForSyn = synMatch ? synMatch[1] : (this.currentWord ? this.currentWord.word : null);
      if (wordForSyn) {
        await this.exploreAnyWord(wordForSyn);
        return;
      }
    }

    // 3. Quiz request
    if (clean.includes('quiz') || clean.includes('test me') || clean.includes('challenge')) {
      this.modeTabs.forEach(t => {
        if (t.dataset.mode === 'quiz') t.click();
      });
      return;
    }

    // 4. Default conversational response
    const general = `I heard you say: "${original}". I'm your AI vocabulary coach! You can ask me to define or explore ANY word in the world—like "zeitgeist", "schadenfreude", or "defenestration"—and I'll explain its context, phonetics, and examples! What word shall we explore?`;
    this.lexiSay(general, false);
  }

  handleQuickChip(action) {
    if (action === 'pronounce') {
      this.pronounceCurrentWord();
    } else if (action === 'example') {
      this.lexiSay(`Here is an example sentence for "${this.currentWord.word}": "${this.currentWord.example}"`, false);
    } else if (action === 'repeat') {
      this.lexiSay(`The word is "${this.currentWord.word}". ${this.currentWord.definition}`, false);
    } else if (action === 'quiz_me') {
      this.modeTabs.forEach(t => {
        if (t.dataset.mode === 'quiz') t.click();
      });
    }
  }

  lexiSay(text, expectAnswer = false) {
    this.appendAgentMessage(text, true);
    this.speech.speak(text, {
      onEnd: () => {
        if (expectAnswer && this.autoListen && !this.speech.hasNetworkError) {
          setTimeout(() => {
            if (!this.speech.isSpeaking) {
              this.speech.startListening();
            }
          }, 450);
        }
      }
    });
  }

  showNetworkNotice() {
    const banner = document.createElement('div');
    banner.className = 'message-group agent';
    banner.innerHTML = `
      <div class="message-bubble" style="border-left: 3px solid var(--accent-amber); background: rgba(245, 158, 11, 0.12);">
        ⚠️ <strong>Microphone Cloud Notice:</strong><br>
        Your browser's speech recognition server reported a network reachability issue (common with VPNs, ad-blockers, or restricted networks).
        <br><br>
        💡 <strong>Quick Solutions:</strong>
        <ul style="margin: 0.5rem 0 0.5rem 1.2rem; font-size: 0.88rem; color: #F1F5F9;">
          <li>You can keep learning seamlessly right now using the <strong>chat input box below</strong> or prompt chips!</li>
          <li>Try opening in <strong>Microsoft Edge</strong> or disabling any active VPN / Brave shields.</li>
        </ul>
        <button id="retryVoiceBtn" style="margin-top: 0.4rem; background: rgba(245, 158, 11, 0.25); border: 1px solid rgba(245, 158, 11, 0.5); color: #FDE68A; padding: 0.35rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.82rem;">
          🔄 Retry Microphone Connection
        </button>
      </div>
    `;
    this.chatStream.appendChild(banner);
    this.chatStream.scrollTop = this.chatStream.scrollHeight;

    const retryBtn = banner.querySelector('#retryVoiceBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.speech.hasNetworkError = false;
        this.hasShownNetworkNotice = false;
        banner.remove();
        this.toggleMicrophone();
      });
    }

    if (this.textInput) {
      this.textInput.placeholder = "Type your answer or sentence here (press Enter)...";
      this.textInput.focus();
    }
  }

  appendAgentMessage(text, isSpoken = false) {
    const group = document.createElement('div');
    group.className = 'message-group agent';
    group.innerHTML = `
      <div class="message-bubble">${text}</div>
      <div class="message-meta">
        <span>Lexi • Just now</span>
        <button class="repeat-speech-btn" data-text="${text.replace(/"/g, '&quot;')}" title="Listen again">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
        </button>
      </div>
    `;
    this.chatStream.appendChild(group);
    this.chatStream.scrollTop = this.chatStream.scrollHeight;
  }

  appendUserMessage(text) {
    const group = document.createElement('div');
    group.className = 'message-group user';
    group.innerHTML = `
      <div class="message-bubble">${text}</div>
      <div class="message-meta">
        <span>You • Just now</span>
      </div>
    `;
    this.chatStream.appendChild(group);
    this.chatStream.scrollTop = this.chatStream.scrollHeight;
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new VocabCoachApp();
});

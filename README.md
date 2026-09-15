# Lexi — AI Voice Vocabulary Coach

A stunning, interactive **AI Voice Vocabulary Learning Agent** built with vanilla HTML, CSS, and JavaScript. Lexi helps you learn, pronounce, and master vocabulary through real-time voice interaction, dynamic word exploration, and multiple learning modes.

---

## ✨ Features

- 🎙️ **Voice Interaction**: Speak naturally using your microphone powered by the Web Speech API (TTS + STT)
- 🌐 **Infinite Vocabulary**: Explore **any word in the world** via Cloud LLM or Free Dictionary API — no static word lists!
- 🔮 **Dynamic Glowing Voice Orb**: A fluid Canvas-based 3D audio visualizer that reacts in real-time to listening, speaking, and processing states
- 🧠 **4 Smart Learning Modes**:
  - **Learn & Pronounce** — Lexi teaches words with IPA phonetics and evaluates your pronunciation
  - **Word Quiz** — Lexi gives clues and listens for your spoken answers
  - **Sentence Builder** — Craft original sentences with AI-powered evaluation
  - **Free Talk & Ask** — Ask Lexi anything conversationally
- 📖 **Explore Any Word**: Search bar to look up *zeitgeist, schadenfreude, defenestration* and any word instantly
- ⚡ **Cloud LLM Integration**: Connect your **Google Gemini**, **Groq**, or **OpenAI** API key for rich, AI-generated context, mnemonics, and sentence grading
- 📊 **Progress HUD**: Track daily streak, mastered words, and accuracy percentage
- 🎨 **Premium Dark UI**: Glassmorphism, neon glow effects, and micro-animations

---

## 🚀 Getting Started

### 1. Clone & Run Locally

```bash
git clone https://github.com/ashiquegeorge15/Voice-Agent.git
cd Voice-Agent
```

Start a local server (any one of these):

```bash
# Using Python (built-in)
python -m http.server 8080

# Using Node.js npx serve
npx serve .
```

Then open **[http://localhost:8080](http://localhost:8080)** in **Google Chrome** or **Microsoft Edge**.

> ⚠️ **Must use Chrome or Edge** — Web Speech API (microphone recognition) is not supported in Firefox or Safari.

---

## ⚡ Connecting a Cloud LLM (Recommended)

To unlock AI-powered vocabulary for **any word in the world**, connect a free Cloud LLM key:

1. Click the **⚙ Gear icon** in the top-right header (or click the AI engine badge).
2. Select your provider: **Google Gemini** (recommended), **Groq**, or **OpenAI**.
3. Enter your API Key:
   - **Gemini**: Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
   - **Groq**: Get a free key at [console.groq.com](https://console.groq.com/)
   - **OpenAI**: Get a key at [platform.openai.com](https://platform.openai.com/)
4. Click **"Save & Test AI Engine"** — Lexi will verify the connection live.

> 🔒 API keys are stored only in your **local browser's `localStorage`** — never sent to any server other than the AI provider directly.

---

## 🗂️ Project Structure

```
Voice-Agent/
├── index.html          # Main app shell — HUD, orb visualizer, word card, chat
├── style.css           # Design system — dark mode, glassmorphism, animations
├── app.js              # Application orchestrator — modes, scoring, conversation
├── llm-service.js      # Cloud LLM & Free Dictionary API integration
├── speech-engine.js    # Web Speech API TTS & STT manager
├── visualizer.js       # Canvas-based dynamic audio orb visualizer
├── vocab-data.js       # Curated starter vocabulary decks
└── run.bat             # One-click Windows server launcher
```

---

## 🖥️ Supported Browsers

| Browser | Voice Recognition | Voice Synthesis |
|---|---|---|
| Google Chrome | ✅ | ✅ |
| Microsoft Edge | ✅ | ✅ |
| Firefox | ❌ | ✅ |
| Safari | ❌ | ✅ |

---

## 🧩 Tech Stack

- **HTML5 + Vanilla JavaScript** — Zero dependencies, no build step required
- **Web Speech API** — Browser-native TTS and STT
- **HTML5 Canvas** — Real-time audio visualizer
- **Google Gemini / Groq / OpenAI API** — Cloud LLM for infinite vocabulary
- **Free Dictionary API** (`api.dictionaryapi.dev`) — Zero-config fallback

---

## 📄 License

MIT License — Free to use and modify.

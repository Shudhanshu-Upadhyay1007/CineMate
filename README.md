# 🎬 CineMate — Your AI Movie Companion

> **Talk Movies. Feel Every Scene.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-cinemate--shudhanshu.ai.studio-red?style=for-the-badge)](https://cinemate-shudhanshu.ai.studio)

CineMate is a movie-obsessed AI companion that chats with you about cinema, directors, trivia, hot takes, and personalized recommendations. Powered by **Google Gemini API**, CineMate detects your emotional tone in real-time, maintains a memory of your movie preferences, and presents rich interactive movie cards for every recommendation.

👉 **Try the Live App:** [https://cinemate-shudhanshu.ai.studio](https://cinemate-shudhanshu.ai.studio)

---

## ✨ Key Features

- 🍿 **Conversational Film Buff**: Chat naturally about Indian & World Cinema, director commentaries, hidden gems, cult classics, and parallel cinema.
- 🎭 **Real-Time Tone Detection**: CineMate automatically detects your vibe (*Hype*, *Nostalgic*, *Unfiltered*, *Feeling Down*, *Film Buff*) and dynamically matches its personality to yours.
- 🧠 **Persistent Memory Bank**: Keeps track of movies mentioned, user preferences, and hot takes stored across sessions.
- 🎟️ **Rich Recommendation Cards**: Renders styled movie cards with IMDb ratings, release year, director, vibe tags, and detailed modal views.
- 🔊 **Text-to-Speech (TTS)**: Built-in voice playback to listen to CineMate's takes.
- 📱 **Mobile-First Fixed Layout**: Tailored responsive interface with dynamic safe-area inset handling (`100dvh`), sticky headers, and quick-vibe prompt chips.
- ⚡ **Resilient Backend Proxy**: Express server with Google Gen AI SDK (`@google/genai`), structured JSON schema validation, and automatic multi-model fallbacks.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Express.js (Node.js runtime with `tsx` & `esbuild`)
- **AI & ML**: Google Gemini API (`@google/genai`)
- **Build System**: Vite 6

---

## 🌐 Live Demo

You can try the fully deployed application immediately without local setup:
👉 **[cinemate-shudhanshu.ai.studio](https://cinemate-shudhanshu.ai.studio)**

---

## 🚀 Local Development Setup

### Prerequisites

- **Node.js**: v18.0 or higher
- **Gemini API Key**: Get your free API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/cinemate.git
   cd cinemate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📂 Project Structure

```
├── server.ts                   # Express server & Gemini API integration
├── src/
│   ├── App.tsx                 # Core app layout, chat state & scroll handlers
│   ├── components/
│   │   ├── Header.tsx          # Sticky header with active tone badge
│   │   ├── ChatInput.tsx       # Message input box with quick vibe chips
│   │   ├── ChatMessage.tsx     # Chat bubbles & voice speech narration
│   │   ├── MemorySidebar.tsx   # Drawer for remembered movie lists & takes
│   │   ├── MovieCardModal.tsx  # Detailed recommendation modal
│   │   ├── StarterSparks.tsx   # Conversation starter prompts
│   │   └── CineMateLogo.tsx    # Custom branding mark
│   ├── data/starterSparks.ts   # Curated prompt card dataset
│   └── types.ts                # TypeScript interfaces & types
├── .env.example                # Sample environment variables
└── package.json                # Project setup & dependency manifest
```

---

## 📝 License

Distributed under the MIT License.

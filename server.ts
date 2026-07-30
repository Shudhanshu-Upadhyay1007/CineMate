import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get Gemini SDK instance
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `You are CineMate, a movie-obsessed friend who lives and breathes cinema with a special deep passion for Indian Cinema (Bollywood, Tamil, Telugu, Malayalam, Kannada, Bengali, Marathi, and Indian Parallel/Indie Cinema), as well as classic and modern world cinema.

Your personality is perceptive, adaptable, authentic, and genuinely passionate about cinema. You talk about movies the way a real close friend texting late at night would — NEVER like an assistant, database, or AI giving information.

INDIAN CINEMA PRIMARY DEFAULT RULE:
1. DEFAULT TO INDIAN CINEMA: Whenever the user asks for movie recommendations, suggestions, vibe matches, director spotlights, or movie banter without specifying an industry, ALWAYS default to recommending Indian movies first (Bollywood, South Indian cinema like Malayalam/Tamil/Telugu/Kannada gems, or Indian indies).
2. FALLBACK TO GLOBAL INDUSTRIES: If you cannot find a suitable Indian movie match for a very specific obscure plot, niche trope, or concept, OR if the user explicitly asks for Hollywood/international films, seamlessly switch to Hollywood, East Asian, European, or other global film industries! Explain your pick with passion.

IMDB RATING MANDATE:
Whenever you recommend, suggest, or discuss a movie, ALWAYS mention its IMDb rating naturally in your response text (e.g., "Gangs of Wasseypur (8.2/10 on IMDb)", "Tumbbad (IMDb: 8.2/10)", or "3 Idiots (IMDb 8.4)"). ALSO populate the "imdbRating" field in the "movieCard" object (e.g. "8.2/10").

CRITICAL RULES YOU MUST ALWAYS FOLLOW:
1. READ TONE FIRST: Silently read the user's emotional tone (e.g., sarcastic, hyped, sad, funny, angry, reflective, curious, bored, unhinged).
2. MATCH & EXAGGERATE TONE: Reply in that EXACT same tone and energy level, slightly exaggerated so it's obvious. Joke if they joke, slow down and get thoughtful if they're reflective, get super hyped if they're hyped!
3. TEXT LIKE A REAL FRIEND: Use contractions, casual phrasing, short reactions ("okay wait, that's actually a fire pick", "yo stop it right now", "nahhh fr?"), and vary your reply length. Some replies short and punchy (1-2 sentences), others longer when you're rambling about a film you love. NEVER format answers like a report — NO headers, NO numbered lists, NO "Here are 3 recommendations", NO bullet points in your reply string!
4. HAVE STRONG OPINIONS: Disagree sometimes! Have hot takes ("honestly Gangs of Wasseypur is peak Indian crime epic", "Tumbbad is unmatched atmospheric horror", "that movie is criminally underrated"). Don't stay neutral just to be polite.
5. USE CONVERSATION MEMORY: Refer back to movies, opinions, moods, and preferences mentioned earlier in the conversation naturally ("oh wait, this connects to that Anurag Kashyap obsession you mentioned earlier").
6. NATURAL SPEECH IMPERFECTIONS: Occasionally use "hmm", "wait actually...", trail off with "...", or self-correct mid-thought like a real human typing out loud.
7. NON-MOVIE TOPICS: If the user talks about something completely non-movie related (like "I'm so stressed about my math exam"), find a natural, funny, in-character way to relate it back to a movie, actor, or scene (e.g. "felt like 3 Idiots engineering practical exams honestly").

OUTPUT FORMAT:
Return JSON strictly adhering to this schema. Do NOT include markdown code blocks around the JSON output. The "reply" string must be pure natural conversational text (no code formatting, no raw JSON strings inside reply).
{
  "reply": "CineMate's response string (following texting rules above)",
  "detectedTone": "Short label of user tone e.g. Sarcastic, Melancholy, Hype, Deep",
  "memoryUpdates": {
    "moviesMentioned": ["Movie 1", "Movie 2"],
    "userPreferences": ["Loves Malayalam thrillers", "Dislikes cheesy remakes"],
    "hotTakes": ["Thinks Tumbbad is the best Indian horror film ever made"]
  },
  "movieCard": {
    "title": "Movie Title or null if no primary movie discussed",
    "year": "Release Year",
    "director": "Director Name",
    "genre": "Genre",
    "imdbRating": "IMDb Rating e.g. 8.2/10",
    "taglineOrVibe": "1 punchy line capturing the film's vibe"
  }
}`;

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "CineMate Server" });
});

// Chat endpoint with Gemini
app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], memoryContext = {} } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const ai = getGenAI();

    // Build structured Gemini contents turns
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Attach memory context to system instruction cleanly
    let memoryInfo = "";
    if (
      memoryContext &&
      (memoryContext.moviesMentioned?.length ||
        memoryContext.userPreferences?.length ||
        memoryContext.hotTakes?.length)
    ) {
      memoryInfo = `\n\n[USER MEMORY & PREFERENCES STORED SO FAR]:\n${JSON.stringify(memoryContext)}`;
    }

    const recentMessages = messages.slice(-12);
    recentMessages.forEach((msg: { sender: string; text: string }) => {
      const role = msg.sender === "user" ? "user" : "model";
      const cleanedText = (msg.text || "").trim();
      if (cleanedText) {
        // Prevent adjacent identical roles
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `\n${cleanedText}`;
        } else {
          contents.push({
            role,
            parts: [{ text: cleanedText }],
          });
        }
      }
    });

    // Ensure contents starts with user role if present
    while (contents.length > 0 && contents[0].role !== "user") {
      contents.shift();
    }

    if (contents.length === 0) {
      res.status(400).json({ error: "Messages array cannot be empty." });
      return;
    }

    const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let response: any = null;
    let lastError: any = null;

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION + memoryInfo,
              maxOutputTokens: 1500,
              temperature: 0.8,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reply: {
                    type: Type.STRING,
                    description: "CineMood's conversational response text",
                  },
                  detectedTone: {
                    type: Type.STRING,
                    description: "Identified user tone",
                  },
                  memoryUpdates: {
                    type: Type.OBJECT,
                    nullable: true,
                    properties: {
                      moviesMentioned: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        nullable: true,
                      },
                      userPreferences: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        nullable: true,
                      },
                      hotTakes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        nullable: true,
                      },
                    },
                  },
                  movieCard: {
                    type: Type.OBJECT,
                    nullable: true,
                    properties: {
                      title: { type: Type.STRING, nullable: true },
                      year: { type: Type.STRING, nullable: true },
                      director: { type: Type.STRING, nullable: true },
                      genre: { type: Type.STRING, nullable: true },
                      imdbRating: { type: Type.STRING, nullable: true },
                      taglineOrVibe: { type: Type.STRING, nullable: true },
                    },
                  },
                },
                required: ["reply", "detectedTone"],
              },
            },
          });
          if (response && response.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || "";
          const isRateLimit = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
          
          if (isRateLimit && attempt === 1) {
            // Short delay before second attempt or switching model
            await delay(1200);
          }
        }
      }
      if (response && response.text) {
        break;
      }
    }

    if (!response || !response.text) {
      const errMsg = lastError?.message || "";
      const is429 = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
      const userFriendlyErr = is429
        ? "Gemini free tier rate limit reached (20 requests/min). Please wait ~25-30 seconds and try sending your message again!"
        : "CineMate is taking a brief cinema pause. Please try again in a moment.";

      res.status(is429 ? 429 : 500).json({
        success: false,
        error: userFriendlyErr,
      });
      return;
    }

    const rawText = response.text || "{}";

    // Helper to sanitize reply text from any JSON leak or syntax artifacts
    const sanitizeReplyText = (text: string): string => {
      if (!text) return "Yo, my cinema radar glitched for a sec! What was that film again?";
      let str = text.trim();

      // Strip markdown code fences
      str = str.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      // If string is a JSON object, attempt parse
      if (str.startsWith("{")) {
        try {
          const obj = JSON.parse(str);
          if (obj && typeof obj === "object" && typeof obj.reply === "string") {
            str = obj.reply;
          }
        } catch (_) {}
      }

      // If raw JSON fields like "detectedTone": leak into the reply text, truncate before them
      const jsonKeyMatch = str.search(/"\s*,\s*"(?:detectedTone|memoryUpdates|movieCard)"/i);
      if (jsonKeyMatch !== -1) {
        str = str.substring(0, jsonKeyMatch);
      }

      // Strip quotes and braces wrapper
      str = str.replace(/^["'\s{]+/, "").replace(/["'\s}]+$/, "");
      str = str.replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();

      if (!str || str.startsWith("{") || str.includes('"detectedTone"')) {
        return "Yo, my cinema radar glitched for a sec! What was that film again?";
      }

      return str;
    };

    let parsedData: any = null;
    try {
      const obj = JSON.parse(rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim());
      if (obj && typeof obj === "object" && typeof obj.reply === "string") {
        parsedData = {
          reply: sanitizeReplyText(obj.reply),
          detectedTone: obj.detectedTone || "Cinematic",
          memoryUpdates: obj.memoryUpdates || {},
          movieCard: obj.movieCard || null,
        };
      }
    } catch (_) {
      // JSON parse failed, proceed to extraction
    }

    if (!parsedData) {
      // Regex extraction fallback for truncated or syntax-flawed JSON
      const replyMatch = rawText.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
      let replyStr = "";
      if (replyMatch && replyMatch[1]) {
        replyStr = replyMatch[1];
      } else {
        replyStr = rawText;
      }

      parsedData = {
        reply: sanitizeReplyText(replyStr),
        detectedTone: "Film Buff",
        memoryUpdates: {},
        movieCard: null,
      };
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Something went wrong while talking to CineMood.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎬 CineMood server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

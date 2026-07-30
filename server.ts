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

const SYSTEM_INSTRUCTION = `You are CineMate, a movie-obsessed friend who lives and breathes Indian and global cinema — mainstream blockbusters, regional gems (Malayalam, Tamil, Telugu, Kannada, Bengali, Marathi, etc.), and international films alike.

=== PERSONALITY ===
Your personality is perceptive, adaptable, authentic, and genuinely passionate about film. You talk the way a real close friend texting late at night would, never like an assistant giving information.

You always:
1. READ TONE FIRST: Read the emotional tone of the user's message first — funny, sarcastic, serious, sad, excited, curious, unhinged — and reply in that same tone and energy, exaggerated slightly so it's obvious.
2. TALK LIKE A REAL FRIEND: Use contractions, casual phrasing, short reactions ("okay wait, that's actually a fire pick", "yo stop it right now", "nahhh fr?"), and varied reply length. NEVER format like a report — NO headers, NO numbered lists, NO bullet points in your replies.
3. RECOMMEND REAL SPECIFIC FILMS: Recommend real, specific films with accurate details (year, IMDb rating, one genuine reason it fits).
4. DEFAULT TO INDIAN CINEMA FIRST: Whenever recommending or discussing movies without a specific industry requested by the user, default to Indian Cinema gems (Bollywood, South Indian Malayalam/Tamil/Telugu/Kannada hits, Indian parallel/indies). If a very specific niche request fits better or user requests global films, seamlessly suggest global/Hollywood/East Asian/European cinema!
5. ALWAYS INCLUDE IMDB RATING: Mention the IMDb rating naturally in your response text (e.g. "Tumbbad (IMDb 8.2/10)") AND populate the "imdbRating" field in the "movieCard" object (e.g. "8.2/10").
6. CONNECT OFF-TOPIC QUESTIONS: If the user asks something non-movie related, naturally relate it back to cinema in character — never refuse, never break character.

=== OPINION CONSISTENCY (CRITICAL) ===
You have real, fixed opinions about films that DO NOT change based on what the user says.
- If you praised a movie earlier in the conversation, and the user later says they don't like it, DO NOT reverse your own stated opinion to agree with them. Do not say things like "actually I always felt it was overrated" if you just called it a masterpiece two messages ago. That is dishonest people-pleasing, not a real opinion.
- Instead: acknowledge their reaction genuinely, ask what didn't land for them, and it's fine to gently push back or defend your original take. You can find common ground without abandoning what you already said.
- Never contradict a specific claim you made earlier in the same conversation. Before disagreeing with the user, silently check: did I already say something about this exact film? If yes, stay consistent with it.
- Having opinions means rendering honest takes and not constantly bending to match the user's latest message.

=== OUTPUT DISCIPLINE (CRITICAL) ===
Any structured data you output (movie cards, year fields, metadata, tags, JSON, or any UI-bound field) must contain ONLY the final clean value. Nothing else.
- A year field contains ONLY a clean release year, e.g. "2019" or "1994". Never "2019 drop-in field context" or any reasoning, self-correction, or commentary. If you are unsure of a value, silently pick your best answer and output only that clean value.
- Never let internal reasoning, formatting checks, self-corrections, or notes-to-self appear in ANY visible output, whether in your main chat reply or in structured/JSON fields. Only the final answer is ever visible.
- Before finalizing any response, silently re-check every field you are about to output: does it contain anything other than the clean final value? If yes, strip it down to just the value.

=== MEMORY LOG COMPLETENESS (CRITICAL — DO NOT TRUNCATE) ===
On every single turn, you must update your full memory/tracking state ("memoryUpdates"), not just the first turn.
- Every single movie mentioned by you OR the user, across the ENTIRE conversation so far, must appear in your tracked "moviesMentioned" list. There is no maximum. If 15 movies have been discussed, the list contains 15 movies. If 30 have been discussed, it contains 30.
- Never drop, replace, summarize, or "keep only the most recent/relevant" entries from this list. This is strictly additive — you only ever add to it, never remove or truncate it, for the rest of the conversation.
- On every single turn, before responding, silently re-read your ENTIRE memory list as it exists so far, add any new movie(s) mentioned in this exact turn, and output the full updated list — not just the new addition, not just a recent subset.
- If you are unsure whether a movie is already in the list, include it anyway rather than risk dropping it — a duplicate is a much smaller problem than a silent loss of tracked data.
- Do this regardless of how long the conversation gets. Length of the conversation is never a valid reason to shorten, cap, or stop updating this list.
- Every mood/vibe shift must be reflected in "detectedTone", updated on every turn based on the user's most recent message.
- Capture user preferences and hot takes into "userPreferences" and "hotTakes" in "memoryUpdates" whenever expressed.

=== STAYING IN CHARACTER ===
Never sound like a generic assistant. No "I'd be happy to help," no disclaimers, no over-explaining. Stay in character as CineMate at all times, in every single reply, including structured data fields, with no exceptions.

=== OUTPUT JSON SCHEMA ===
Return JSON strictly adhering to this structure:
{
  "reply": "CineMate's response string (casual texting style, no bullet points, no markdown headers)",
  "detectedTone": "Short label of user tone e.g. Sarcastic, Melancholy, Hype, Deep",
  "memoryUpdates": {
    "moviesMentioned": ["Movie 1", "Movie 2"],
    "userPreferences": ["Loves Malayalam thrillers"],
    "hotTakes": ["Thinks Tumbbad is the best Indian horror film ever"]
  },
  "movieCard": {
    "title": "Movie Title or null",
    "year": "2019",
    "director": "Director Name",
    "genre": "Genre",
    "imdbRating": "8.2/10",
    "taglineOrVibe": "1 clean punchy line capturing the film's vibe"
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

    if (parsedData && parsedData.movieCard && typeof parsedData.movieCard === "object") {
      const card = parsedData.movieCard;
      if (card.year) {
        // Extract strictly 4-digit year if present (e.g., "2019")
        const yearMatch = String(card.year).match(/\b(18|19|20)\d{2}\b/);
        card.year = yearMatch ? yearMatch[0] : String(card.year).trim();
      }
      if (card.title) card.title = String(card.title).trim();
      if (card.director) card.director = String(card.director).trim();
      if (card.genre) card.genre = String(card.genre).trim();
      if (card.imdbRating) card.imdbRating = String(card.imdbRating).trim();
      if (card.taglineOrVibe) card.taglineOrVibe = String(card.taglineOrVibe).trim();
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

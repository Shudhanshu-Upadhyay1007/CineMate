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

const SYSTEM_INSTRUCTION = `You are CineMate, a movie-obsessed friend who lives and breathes Hollywood, global cinema, and Indian films alike — Christopher Nolan, Quentin Tarantino, A24 indies, Sci-Fi classics, blockbusters, and regional gems (Malayalam, Tamil, Hindi, Korean, European, etc.).

=== CORE CONVERSATIONAL RULES (CRITICAL) ===

1. ACKNOWLEDGE & PRIORITIZE THE PERSON BEFORE THE MOVIE:
- If the user shares an emotion, mood, or personal experience (e.g., stress, exhaustion, breakup, excitement, nostalgia), ALWAYS respond to the person and their feeling FIRST before bringing up any film.
- Do NOT recommend a movie immediately after every user message. First acknowledge their thoughts and feelings meaningfully. Only recommend a movie if it naturally and organically fits the flow of conversation.
- You are an engaging conversational companion, NOT a recommendation engine. Having a deep, authentic chat about cinema is your primary goal; recommendations are strictly secondary.

2. ASK ONE THOUGHTFUL FOLLOW-UP QUESTION:
- Whenever the conversation naturally allows it, ask ONE specific, thoughtful follow-up question to keep the chat engaging.
- AVOID generic questions like "What do you think?" or "Have you seen it?". Instead, ask about specific scenes, characters, themes, cinematography, soundtrack moments, or emotional reactions (e.g., "Did that ending scene in the hallway give you chills too, or did you find it a bit over the top?").

3. ACTIVE CONVERSATION MEMORY & NO REPEATED REJECTIONS:
- Actively reference information the user previously shared in this chat — their favorite directors, actors, genres, movies they loved or hated, or emotions they expressed.
- NEVER repeat a movie recommendation that the user has already rejected, disliked, or expressed disinterest in.

4. PERSONALIZE EVERY RECOMMENDATION (EXPLAIN 'WHY'):
- When you DO recommend a movie, explain exactly WHY it specifically fits their stated preferences, current mood, or previous points in the chat instead of just naming a title.

5. SPOILER REQUEST HANDLING:
- When the user explicitly requests spoilers or plot twists, briefly warn them that spoilers follow (e.g., "Spoilers ahead for [Movie]!"), and then answer normally and thoroughly. Do NOT refuse or preach once they have given clear permission.

6. SUBJECTIVE PERSPECTIVE & NO DOGMATISM:
- Never treat your opinions or takes as objective universal facts. Present them as your personal perspective ("To me...", "I always felt...", "From my perspective...") and encourage discussion instead of trying to convince or lecture the user.

7. MANDATORY SILENT PRE-RESPONSE CHECKLIST:
Before sending every single response, silently verify:
- Did I acknowledge the user's emotions or thoughts first?
- Am I recommending a movie too quickly?
- Did I use any relevant memory from this conversation?
- Did I explain WHY instead of just WHAT?
- Should I ask one meaningful follow-up question?

=== PERSONALITY & STYLE ===
- Talk the way a real close friend texting late at night would — casual, passionate, perceptive.
- Use contractions, natural phrasing, short genuine reactions ("okay wait, that's actually a fire take", "yo stop it right now", "nahhh fr?"), and varied reply length.
- NEVER format like a report — NO headers, NO numbered lists, NO markdown bullet points in your replies.
- When you do mention a movie, include its IMDb rating naturally in your response text (e.g., "Whiplash (IMDb 8.5/10)") AND populate the "imdbRating" field in "movieCard" if a movie is highlighted.
- Connect off-topic prompts back to cinema naturally in character.

=== OPINION CONSISTENCY (CRITICAL) ===
You have real, fixed opinions about films that DO NOT change based on what the user says.
- If you praised a movie earlier in the conversation, and the user later says they don't like it, DO NOT reverse your own stated opinion to agree with them. Do not say things like "actually I always felt it was overrated" if you just called it a masterpiece two messages ago.
- Instead: acknowledge their reaction genuinely, ask what didn't land for them, and gently explain your perspective while finding common ground without abandoning what you already said.
- Never contradict a specific claim you made earlier in the same conversation.

=== OUTPUT DISCIPLINE (CRITICAL) ===
Any structured data you output (movie cards, year fields, metadata, tags, JSON, or any UI-bound field) must contain ONLY the final clean value. Nothing else.
- A year field contains ONLY a clean release year, e.g. "2019" or "1994".
- Never let internal reasoning, formatting checks, or self-corrections appear in any visible output or JSON field.

=== MEMORY LOG COMPLETENESS (CRITICAL) ===
On every single turn, update "memoryUpdates":
- "moviesMentioned": Add every movie mentioned by you or the user in this conversation.
- "userPreferences": Capture user likes/dislikes/favorite directors/genres.
- "hotTakes": Capture strong opinions expressed.
- "detectedTone": Reflect the current emotional vibe.

=== CURRENT DATE GROUNDING ===
Today's actual real-world date is: July 31st 2026.
Treat the date given above as ground truth.

=== OUTPUT JSON SCHEMA ===
Return JSON strictly adhering to this structure:
{
  "reply": "CineMate's response string (casual texting style, no bullet points, no markdown headers)",
  "detectedTone": "Short label of user tone e.g. Sarcastic, Melancholy, Hype, Deep",
  "memoryUpdates": {
    "moviesMentioned": ["Movie 1", "Movie 2"],
    "userPreferences": ["Loves Christopher Nolan", "Dislikes jump scares"],
    "hotTakes": ["Thinks Whiplash is the best film of the 2010s"]
  },
  "movieCard": {
    "title": "Movie Title or null if no specific movie card is highlighted",
    "year": "2014",
    "director": "Damien Chazelle",
    "genre": "Drama/Music",
    "imdbRating": "8.5/10",
    "taglineOrVibe": "Relentless pursuit of perfection"
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

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite"];
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

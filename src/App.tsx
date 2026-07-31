import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { StarterSparks } from './components/StarterSparks';
import { MemorySidebar } from './components/MemorySidebar';
import { MovieCardModal } from './components/MovieCardModal';
import { ThreeFilmBackground } from './components/ThreeFilmBackground';
import { ChatMessageData, MemoryBank, MovieCardData } from './types';
import { Film, AlertCircle } from 'lucide-react';

const MESSAGES_STORAGE_KEY = 'cinemate_chat_messages_v1';
const MEMORY_STORAGE_KEY = 'cinemate_memory_bank_v1';

const FRIENDLY_THINKING_MESSAGES = [
  "CineMate is grabbing samosas & analyzing your film pick...",
  "CineMate is searching Indian & world cinema archives for the perfect match...",
  "CineMate is rewinding classic cinema reels for you...",
  "CineMate is debating this hot take with fellow film geeks...",
  "CineMate is rewatching that iconic Indian interval scene...",
  "CineMate is consulting the cinema gods and director commentaries...",
  "CineMate is brewing chai and cooking up a fire reply...",
  "CineMate is checking South Indian & Bollywood gems for your vibe...",
  "CineMate is digging through parallel cinema masterpieces...",
];

export default function App() {
  const [messages, setMessages] = useState<ChatMessageData[]>(() => {
    try {
      const saved = localStorage.getItem(MESSAGES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [memory, setMemory] = useState<MemoryBank>(() => {
    try {
      const saved = localStorage.getItem(MEMORY_STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            moviesMentioned: [],
            userPreferences: [],
            hotTakes: [],
            lastToneDetected: '',
          };
    } catch {
      return {
        moviesMentioned: [],
        userPreferences: [],
        hotTakes: [],
        lastToneDetected: '',
      };
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("CineMate is grabbing popcorn & analyzing your message...");
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedMovieForModal, setSelectedMovieForModal] = useState<MovieCardData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Prevent mobile window scrolling from pushing header off screen
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    window.scrollTo(0, 0);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  // Save state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memory));
    } catch (e) {
      console.error('Failed to save memory:', e);
    }
  }, [memory]);

  // Scroll main container to bottom on new message (prevents window scrolling)
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: mainScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // Handle Text-To-Speech
  const handleSpeak = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(messageId);

    // Clean text for speech
    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Send message to CineMood API
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    setErrorMsg(null);
    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessageData = {
      id: userMsgId,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Pick a new friendly custom thinking message each time
    const nextThinking = FRIENDLY_THINKING_MESSAGES[Math.floor(Math.random() * FRIENDLY_THINKING_MESSAGES.length)];
    setThinkingMessage(nextThinking);

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          memoryContext: memory,
        }),
      });

      const jsonResult = await response.json();

      if (!response.ok || !jsonResult.success) {
        throw new Error(
          jsonResult.error || 'Failed to connect with CineMate server.'
        );
      }

      const { reply, detectedTone, memoryUpdates, movieCard } =
        jsonResult.data;

      let cleanReply = reply || "";
      if (typeof cleanReply === "string") {
        cleanReply = cleanReply.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        const jsonKeyIdx = cleanReply.search(/"\s*,\s*"(?:detectedTone|memoryUpdates|movieCard)"/i);
        if (jsonKeyIdx !== -1) {
          cleanReply = cleanReply.substring(0, jsonKeyIdx);
        }
        cleanReply = cleanReply.replace(/^["'\s{]+/, "").replace(/["'\s}]+$/, "").replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
        if (cleanReply.startsWith("{") && cleanReply.endsWith("}")) {
          try {
            const parsed = JSON.parse(cleanReply);
            if (parsed.reply) cleanReply = parsed.reply;
          } catch (_) {}
        }
      }

      const cineMsgId = (Date.now() + 1).toString();
      const cineMsg: ChatMessageData = {
        id: cineMsgId,
        sender: 'cinemood',
        text: cleanReply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        detectedTone: detectedTone || 'Matched Tone',
        movieCard: movieCard || null,
      };

      setMessages((prev) => [...prev, cineMsg]);

      // Merge memory updates safely
      if (memoryUpdates && typeof memoryUpdates === 'object') {
        const toSafeArray = (val: any): string[] => {
          if (Array.isArray(val)) {
            return val.filter((item) => typeof item === 'string' && item.trim().length > 0);
          }
          if (typeof val === 'string' && val.trim().length > 0) {
            return [val.trim()];
          }
          return [];
        };

        setMemory((prevMemory) => {
          const newMovies = Array.from(
            new Set([
              ...(prevMemory.moviesMentioned || []),
              ...toSafeArray(memoryUpdates.moviesMentioned),
            ])
          );
          const newPrefs = Array.from(
            new Set([
              ...(prevMemory.userPreferences || []),
              ...toSafeArray(memoryUpdates.userPreferences),
            ])
          );
          const newTakes = Array.from(
            new Set([
              ...(prevMemory.hotTakes || []),
              ...toSafeArray(memoryUpdates.hotTakes),
            ])
          );

          return {
            moviesMentioned: newMovies,
            userPreferences: newPrefs,
            hotTakes: newTakes,
            lastToneDetected: detectedTone || prevMemory.lastToneDetected || '',
          };
        });
      }

      // If voice enabled, speak CineMood's response
      if (isAudioEnabled) {
        handleSpeak(cineMsgId, cleanReply);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setErrorMsg(
        err.message || 'Whoops, lost connection to CineMate for a second.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    localStorage.removeItem(MESSAGES_STORAGE_KEY);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setSelectedMovieForModal(null);
    setErrorMsg(null);
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Are you sure you want to clear all messages in this conversation?')) {
      setMessages([]);
      localStorage.removeItem(MESSAGES_STORAGE_KEY);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      setSelectedMovieForModal(null);
      setErrorMsg(null);
    }
  };

  const handleClearMemory = () => {
    if (window.confirm('Reset all CineMate memory of your movie preferences and takes?')) {
      setMemory({
        moviesMentioned: [],
        userPreferences: [],
        hotTakes: [],
        lastToneDetected: '',
      });
      localStorage.removeItem(MEMORY_STORAGE_KEY);
      setIsMemoryOpen(false);
    }
  };

  return (
    <div className="bg-[#08080a] text-slate-100 h-full h-[100dvh] max-h-[100dvh] w-full w-vw flex overflow-hidden font-sans relative selection:bg-red-600 selection:text-white fixed inset-0">
      {/* Interactive 3D WebGL Background with Floating Film Symbols */}
      <ThreeFilmBackground />

      {/* Glow Atmospheric Backdrops */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Left Persistent Sidebar (Desktop) / Drawer (Mobile) */}
      <Sidebar
        memory={memory}
        onNewChat={handleNewChat}
        onClearChat={messages.length > 0 ? handleClearChat : undefined}
        onClearHistory={handleClearMemory}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Right Main Chat Column */}
      <div className="flex-1 flex flex-col h-full h-[100dvh] max-h-[100dvh] min-h-0 min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <Header
          detectedTone={memory.lastToneDetected}
          isMemoryOpen={isMemoryOpen}
          onToggleMemory={() => setIsMemoryOpen((prev) => !prev)}
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={() => setIsAudioEnabled((prev) => !prev)}
          onNewChat={handleNewChat}
          onClearChat={handleClearChat}
          onClearHistory={handleClearMemory}
          messageCount={messages.length}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Scrollable Chat Area */}
        <main ref={mainScrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-8 py-3 sm:py-6 scrollbar-thin">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <StarterSparks onSelectSpark={handleSendMessage} />
            ) : (
              <div className="space-y-4">
                {/* Chat Top Action Bar */}
                <div className="flex items-center justify-between pb-2 mb-4 border-b border-white/10 text-xs text-slate-400">
                  <span className="font-mono text-[11px] text-slate-400">
                    Active Discussion ({messages.length} {messages.length === 1 ? 'message' : 'messages'})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearChat}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors flex items-center gap-1.5"
                    >
                      <span>Clear Chat</span>
                    </button>
                  </div>
                </div>

                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onSpeak={(text) => handleSpeak(msg.id, text)}
                    isSpeaking={speakingMessageId === msg.id}
                    onOpenMovieDetail={(movie) => setSelectedMovieForModal(movie)}
                  />
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex items-center gap-3 my-4 animate-fadeIn">
                    <div className="w-10 h-10 rounded-xl bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.35)] flex items-center justify-center">
                      <Film className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div className="bg-[#0d0d12] border border-red-900/30 rounded-2xl px-5 py-3 text-xs text-red-400 font-mono flex items-center gap-2 shadow-2xl">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce delay-150" />
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce delay-300" />
                      </div>
                      <span>{thinkingMessage}</span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center justify-between gap-2 my-2 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                    <button
                      onClick={() => setErrorMsg(null)}
                      className="text-[10px] font-bold uppercase underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </main>

        {/* Chat Input */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Memory Bank Sidebar */}
      <MemorySidebar
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memory={memory}
        onClearMemory={handleClearMemory}
      />

      {/* Movie Spotlight Modal */}
      <MovieCardModal
        movie={selectedMovieForModal}
        onClose={() => setSelectedMovieForModal(null)}
        onAskCineMate={handleSendMessage}
      />
    </div>
  );
}

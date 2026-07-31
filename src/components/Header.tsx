import React from 'react';
import { Brain, Volume2, VolumeX, Sparkles, Menu, Plus, Trash2, RotateCcw } from 'lucide-react';
import { CineMateHeaderBrand } from './CineMateLogo';

interface HeaderProps {
  detectedTone?: string;
  isMemoryOpen: boolean;
  onToggleMemory: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onNewChat: () => void;
  onClearChat?: () => void;
  onClearHistory?: () => void;
  messageCount: number;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  detectedTone,
  isMemoryOpen,
  onToggleMemory,
  isAudioEnabled,
  onToggleAudio,
  onNewChat,
  onClearChat,
  onClearHistory,
  messageCount,
  onToggleMobileSidebar,
}) => {
  return (
    <header className="shrink-0 h-16 min-h-[64px] border-b border-white/10 flex items-center justify-between px-3 sm:px-6 bg-[#0d0d14] z-30 w-full shadow-lg sticky top-0">
      {/* Left: Mobile Drawer Trigger + App Logo & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* App Logo & Title - Always Visible */}
        <CineMateHeaderBrand />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* CLEAR CHAT BUTTON (Visible when messages exist) */}
        {messageCount > 0 && onClearChat && (
          <button
            onClick={onClearChat}
            title="Clear current chat messages"
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Clear Chat</span>
          </button>
        )}

        {/* NEW CHAT BUTTON */}
        <button
          onClick={onNewChat}
          title="Start a new conversation"
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(220,38,38,0.4)] active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">New Chat</span>
        </button>

        {detectedTone && (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Vibe: {detectedTone}</span>
          </div>
        )}

        {/* Audio Toggle Button */}
        <button
          onClick={onToggleAudio}
          title={isAudioEnabled ? "Voice Speech Enabled" : "Enable Voice Speech"}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            isAudioEnabled
              ? "bg-red-600/30 text-red-300 border border-red-500/40 shadow-[0_0_12px_rgba(220,38,38,0.25)]"
              : "bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10"
          }`}
        >
          {isAudioEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{isAudioEnabled ? "Voice On" : "Voice Off"}</span>
        </button>

        {/* Memory Drawer Button */}
        <button
          onClick={onToggleMemory}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            isMemoryOpen
              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              : "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5"
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Memory</span>
          <span className="px-1.5 py-0.2 bg-black/40 text-slate-300 text-[10px] rounded-full border border-white/10">
            {messageCount}
          </span>
        </button>
      </div>
    </header>
  );
};


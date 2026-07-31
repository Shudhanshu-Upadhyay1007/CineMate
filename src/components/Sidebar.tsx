import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Clapperboard, X, Plus, Trash2, RotateCcw } from 'lucide-react';
import { MemoryBank } from '../types';
import { CineMateHeaderBrand } from './CineMateLogo';
import { getRandomObsessions, ObsessionMovie } from '../data/obsessions';

interface SidebarProps {
  memory: MemoryBank;
  onNewChat?: () => void;
  onClearChat?: () => void;
  onClearHistory?: () => void;
  onCloseMobile?: () => void;
  isMobileOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  memory,
  onNewChat,
  onClearChat,
  onClearHistory,
  onCloseMobile,
  isMobileOpen = false,
}) => {
  const [obsessions, setObsessions] = useState<ObsessionMovie[]>(() => getRandomObsessions(3));

  // Re-roll obsessions when a new chat is started
  const handleStartNewChat = () => {
    setObsessions(getRandomObsessions(3));
    if (onNewChat) onNewChat();
    if (onCloseMobile) onCloseMobile();
  };
  const hypePercentage = memory.lastToneDetected
    ? Math.min(
        100,
        Math.max(
          50,
          memory.lastToneDetected.length * 8 + memory.hotTakes.length * 10
        )
      )
    : 75;

  const hasMemoryItems =
    memory.moviesMentioned.length > 0 ||
    memory.hotTakes.length > 0 ||
    memory.userPreferences.length > 0;

  const sidebarContent = (
    <div className="w-72 h-full bg-[#0d0d12] border-r border-white/5 flex flex-col p-6 z-10 overflow-y-auto scrollbar-none">
      {/* Mobile/Tablet Close Button */}
      {onCloseMobile && (
        <div className="flex lg:hidden justify-end mb-2">
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Brand Header */}
      <div className="mb-6 pb-2 border-b border-white/5">
        <CineMateHeaderBrand size="md" />
      </div>

      {/* Primary Action Buttons: Start New Chat & Clear Chat */}
      <div className="space-y-2 mb-6">
        {onNewChat && (
          <button
            onClick={handleStartNewChat}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Chat</span>
          </button>
        )}

        {onClearChat && (
          <button
            onClick={() => {
              onClearChat();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Chat Messages</span>
          </button>
        )}
      </div>

      <div className="space-y-8 flex-1">
        {/* Vibe Check Section */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-red-500" />
            <span>Vibe Check</span>
          </p>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Hype Level</span>
              <span className="text-[11px] text-red-500 font-mono font-bold uppercase">
                {memory.lastToneDetected || 'Hyped'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all duration-500"
                style={{ width: `${hypePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Currently Obsessed With */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-3 flex items-center gap-1.5">
            <Clapperboard className="w-3 h-3 text-red-500" />
            <span>Currently Obsessed With</span>
          </p>
          <div className="space-y-3">
            {obsessions.map((film, idx) => (
              <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-14 bg-slate-800 rounded shadow-lg overflow-hidden border border-white/10 shrink-0 group-hover:border-red-500/40 transition-colors">
                  <div className={`w-full h-full bg-gradient-to-br ${film.gradient}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight group-hover:text-red-300 transition-colors">
                    {film.title}
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    "{film.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memory Log Header + Clear History Button */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-red-500" />
              <span>Memory Log</span>
            </p>
            {hasMemoryItems && onClearHistory && (
              <button
                onClick={() => {
                  onClearHistory();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/40 hover:bg-rose-900/60 px-2 py-0.5 rounded-md border border-rose-800/40 transition-colors"
                title="Clear all logged memory & preferences"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 space-y-2 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 max-h-48 overflow-y-auto scrollbar-thin">
            {!hasMemoryItems ? (
              <p className="text-[11px] text-slate-500 italic">
                Start chatting! cine-takes and movie opinions will log here...
              </p>
            ) : (
              <>
                {memory.moviesMentioned.map((movie, idx) => (
                  <p key={`m-${idx}`} className="truncate">
                    • Discussed <span className="text-white font-medium">{movie}</span>
                  </p>
                ))}
                {memory.hotTakes.map((take, idx) => (
                  <p key={`t-${idx}`} className="text-red-300">
                    • Take: "{take}"
                  </p>
                ))}
                {memory.userPreferences.map((pref, idx) => (
                  <p key={`p-${idx}`}>
                    • Preference: <span className="text-slate-200">{pref}</span>
                  </p>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );


  // Desktop persistent sidebar (lg screens)
  return (
    <>
      <div className="hidden lg:block h-full shrink-0">{sidebarContent}</div>

      {/* Mobile/Tablet drawer backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm animate-fadeIn flex">
          {sidebarContent}
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
};

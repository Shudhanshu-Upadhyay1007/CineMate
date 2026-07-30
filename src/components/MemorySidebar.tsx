import React from 'react';
import { X, Film, Flame, Heart, Sparkles, Trash2, Brain } from 'lucide-react';
import { MemoryBank } from '../types';

interface MemorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  memory: MemoryBank;
  onClearMemory: () => void;
}

export const MemorySidebar: React.FC<MemorySidebarProps> = ({
  isOpen,
  onClose,
  memory,
  onClearMemory,
}) => {
  if (!isOpen) return null;

  const totalMemoryItems =
    memory.moviesMentioned.length +
    memory.userPreferences.length +
    memory.hotTakes.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-l border-amber-500/20 h-full flex flex-col shadow-2xl overflow-hidden animate-slideInRight">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">CineMate's Memory</h2>
              <p className="text-xs text-slate-400">
                What your film buddy has picked up about you so far
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Active Vibe Status */}
          {memory.lastToneDetected && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900 border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-medium mb-1">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Current Tone Detected</span>
              </div>
              <p className="text-sm font-semibold text-slate-100 pl-6">
                "{memory.lastToneDetected}"
              </p>
            </div>
          )}

          {totalMemoryItems === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <Film className="w-12 h-12 text-slate-700 mx-auto animate-bounce" />
              <h3 className="text-sm font-semibold text-slate-300">
                No memories logged yet
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Start texting CineMate! As you mention movies, directors, and opinions, CineMate will naturally track them here.
              </p>
            </div>
          ) : (
            <>
              {/* Movies Mentioned */}
              {memory.moviesMentioned.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Film className="w-4 h-4" />
                    <span>Movies Discussed ({memory.moviesMentioned.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {memory.moviesMentioned.map((movie, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-slate-800/90 text-slate-200 border border-amber-500/20 text-xs font-medium flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {movie}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* User Taste & Preferences */}
              {memory.userPreferences.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <Heart className="w-4 h-4" />
                    <span>Taste & Preferences ({memory.userPreferences.length})</span>
                  </div>
                  <ul className="space-y-2">
                    {memory.userPreferences.map((pref, idx) => (
                      <li
                        key={idx}
                        className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 leading-relaxed flex items-start gap-2"
                      >
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{pref}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hot Takes */}
              {memory.hotTakes.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
                    <Flame className="w-4 h-4" />
                    <span>Hot Takes & Disagreements ({memory.hotTakes.length})</span>
                  </div>
                  <ul className="space-y-2">
                    {memory.hotTakes.map((take, idx) => (
                      <li
                        key={idx}
                        className="p-3 rounded-lg bg-orange-950/20 border border-orange-500/20 text-xs text-orange-200 leading-relaxed flex items-start gap-2"
                      >
                        <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span>{take}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {totalMemoryItems > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <button
              onClick={onClearMemory}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Reset CineMood Memory</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, MessageSquare, Brain, Sparkles } from 'lucide-react';

export type ClearType = 'chat' | 'memory' | 'everything' | null;

interface ClearConfirmModalProps {
  clearType: ClearType;
  onClose: () => void;
  onConfirmChat: () => void;
  onConfirmMemory: () => void;
  onConfirmEverything: () => void;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  clearType,
  onClose,
  onConfirmChat,
  onConfirmMemory,
  onConfirmEverything,
}) => {
  if (!clearType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f0f15] border border-rose-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-scaleUp">
        {/* Glow backdrop effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content based on type */}
        {clearType === 'chat' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Clear Chat Messages?</h3>
                <p className="text-xs text-slate-400">Remove all current conversation messages</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-rose-950/20 p-3 rounded-xl border border-rose-900/30">
              This will erase all active messages in this chat window. Your stored movie preferences and memory bank will remain safe.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirmChat();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Clear Chat</span>
              </button>
            </div>
          </div>
        )}

        {clearType === 'memory' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Reset Memory & History?</h3>
                <p className="text-xs text-slate-400">Clear all logged taste profile & movie memory</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-purple-950/20 p-3 rounded-xl border border-purple-900/30">
              This will wipe CineMate's memory log of your discussed movies, taste preferences, and hot takes.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirmMemory();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Memory</span>
              </button>
            </div>
          </div>
        )}

        {clearType === 'everything' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Clear All Chat & Memory?</h3>
                <p className="text-xs text-slate-400">Complete fresh restart of CineMate</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-red-950/30 p-3 rounded-xl border border-red-900/40">
              This will completely wipe all chat messages AND reset your memory bank. Everything will revert to a clean slate.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirmEverything();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Wipe Everything</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

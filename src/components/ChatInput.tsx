import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Zap, Flame, Heart, Coffee, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const QUICK_VIBES = [
  { label: 'Hyped!', prefix: 'YO! ', icon: Zap },
  { label: 'Unfiltered Take', prefix: 'Honestly... ', icon: Flame },
  { label: 'Feeling Down', prefix: "I'm feeling down today. ", icon: Heart },
  { label: 'Non-Movie Topic', prefix: 'Okay totally unrelated to movies but ', icon: Coffee },
];

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickVibe = (prefix: string) => {
    setText((prev) => (prev ? `${prev} ${prefix}` : prefix));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="shrink-0 border-t border-white/5 bg-[#0a0a0c]/95 backdrop-blur-md px-3 sm:px-6 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-4 z-20 sticky bottom-0">
      <div className="max-w-4xl mx-auto space-y-1.5 sm:space-y-2.5">
        {/* Quick Vibe Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-500" />
            <span className="hidden xs:inline">Vibe Starter:</span>
          </span>
          {QUICK_VIBES.map((vibe, idx) => {
            const Icon = vibe.icon;
            return (
              <button
                key={idx}
                onClick={() => handleQuickVibe(vibe.prefix)}
                type="button"
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/40 text-slate-300 hover:text-white text-[11px] sm:text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                <span>{vibe.label}</span>
              </button>
            );
          })}
        </div>

        {/* Text Area & Submit Form */}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 sm:gap-3">
          <div className="relative flex-1 bg-white/5 border border-white/10 focus-within:border-red-500/50 rounded-2xl p-2 sm:p-2.5 transition-all shadow-2xl">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => window.scrollTo(0, 0)}
              placeholder="Text CineMate about a movie, hot take..."
              disabled={isLoading}
              className="w-full bg-transparent text-slate-200 text-base sm:text-sm placeholder:text-slate-500 outline-none resize-none px-1.5 py-0.5 max-h-28 sm:max-h-36 scrollbar-thin"
            />
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`p-3 sm:p-3.5 rounded-xl font-bold transition-all flex items-center justify-center shrink-0 ${
              text.trim() && !isLoading
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-95'
                : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-slate-600">
          <span>MOOD DETECTION: ACTIVE</span>
          <span className="hidden sm:inline">PRESS ENTER TO SEND • SHIFT+ENTER FOR NEW LINE</span>
        </div>
      </div>
    </div>
  );
};

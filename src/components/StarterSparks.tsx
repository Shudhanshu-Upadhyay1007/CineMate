import React from 'react';
import { Film, Flame, HeartHandshake, Zap, Sparkles, Coffee, MessageSquareText } from 'lucide-react';
import { STARTER_SPARKS } from '../data/starterSparks';
import { StarterSpark } from '../types';
import { CineMateIcon } from './CineMateLogo';

interface StarterSparksProps {
  onSelectSpark: (prompt: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  HeartHandshake,
  Zap,
  Sparkles,
  Coffee,
};

export const StarterSparks: React.FC<StarterSparksProps> = ({ onSelectSpark }) => {
  return (
    <div className="py-4 sm:py-8 md:py-10 px-2 sm:px-4 md:px-6 max-w-3xl mx-auto space-y-5 sm:space-y-8 animate-fadeIn">
      {/* Intro Banner */}
      <div className="text-center space-y-2.5 sm:space-y-4">
        <div className="inline-flex p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 mb-0.5 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
          <CineMateIcon className="w-12 h-12 sm:w-16 sm:h-16" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-sans">
            <span className="text-[#FFF8EE]">Yo! What are we watching or arguing about today?</span>
          </h2>
          <p className="text-[11px] sm:text-xs font-mono text-amber-400 font-bold tracking-[0.2em] uppercase pt-1">
            Talk Movies. Feel Every Scene.
          </p>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed pt-1">
          I'm <span className="text-white font-bold">CineMate</span> — your ultimate cinema bestie for Hollywood blockbusters, cult classics, A24 indies, and Indian cinema. Drop your hot takes, mood, or what movie you're craving to watch!
        </p>
      </div>

      {/* Starter Cards Grid */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono font-bold text-red-500 uppercase tracking-widest px-1">
          <MessageSquareText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Cinematic Icebreakers</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2">
          {STARTER_SPARKS.map((spark: StarterSpark) => {
            const Icon = ICON_MAP[spark.iconName] || Film;
            return (
              <button
                key={spark.id}
                onClick={() => onSelectSpark(spark.prompt)}
                className="p-3 sm:p-4 rounded-xl bg-[#0d0d12] border border-white/5 hover:border-red-500/40 text-left transition-all hover:scale-[1.01] hover:shadow-2xl group flex flex-col justify-between gap-2 sm:gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] font-mono font-semibold text-red-400 border border-white/5">
                    <Icon className="w-3 h-3 text-red-500" />
                    {spark.vibe}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                  "{spark.prompt}"
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Film, Volume2, VolumeX, Sparkles, Clapperboard, Calendar, User, Star } from 'lucide-react';
import { ChatMessageData, MovieCardData } from '../types';

interface ChatMessageProps {
  message: ChatMessageData;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  onOpenMovieDetail?: (movie: MovieCardData) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSpeak,
  isSpeaking,
  onOpenMovieDetail,
}) => {
  const isCineMood = message.sender === 'cinemood';

  return (
    <div
      className={`flex gap-3 my-5 ${
        isCineMood ? 'justify-start' : 'justify-end'
      } animate-fadeIn`}
    >
      {/* CineMood Avatar */}
      {isCineMood && (
        <div className="shrink-0 mt-1">
          <div className="w-10 h-10 rounded-xl bg-red-600 p-0.5 shadow-[0_0_15px_rgba(220,38,38,0.35)] flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        className={`max-w-[85%] sm:max-w-[78%] md:max-w-[72%] flex flex-col ${
          isCineMood ? 'items-start' : 'items-end'
        }`}
      >
        {/* Header line */}
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isCineMood ? 'CineMate' : 'You'}
          </span>
          <span className="text-[10px] text-slate-600 uppercase">
            {message.timestamp}
          </span>

          {isCineMood && message.detectedTone && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-red-500" />
              {message.detectedTone}
            </span>
          )}
        </div>

        {/* Text Box */}
        <div
          className={`relative p-5 text-sm leading-relaxed shadow-2xl transition-all ${
            isCineMood
              ? 'bg-gradient-to-br from-red-950/40 via-[#0e0e14] to-slate-900 border border-red-900/20 text-slate-200 rounded-2xl rounded-tl-none'
              : 'bg-[#1a1a22] border border-white/5 text-slate-200 rounded-2xl rounded-tr-none'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">{message.text}</div>

          {/* Audio Speak button & Pro Tip footer for CineMood */}
          {isCineMood && (
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest font-mono">
                  CINEMATE TAKE:
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Matched energy response
                </span>
              </div>

              <button
                onClick={() => onSpeak(message.text)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSpeaking
                    ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
                title="Listen to CineMate talk"
              >
                {isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className="text-[10px]">{isSpeaking ? 'Pause' : 'Listen'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Movie Feature Card if attached */}
        {isCineMood && message.movieCard && message.movieCard.title && (
          <div
            onClick={() => onOpenMovieDetail && onOpenMovieDetail(message.movieCard!)}
            className="mt-3 w-full bg-[#0d0d12] border border-red-500/20 hover:border-red-500/50 rounded-xl p-4 cursor-pointer transition-all shadow-2xl group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 group-hover:scale-105 transition-transform">
                  <Clapperboard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-red-300 transition-colors">
                    {message.movieCard.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                    {message.movieCard.year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-red-400" />
                        {message.movieCard.year}
                      </span>
                    )}
                    {message.movieCard.director && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        Dir: {message.movieCard.director}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                {message.movieCard.imdbRating && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    IMDb {message.movieCard.imdbRating}
                  </span>
                )}
                {message.movieCard.genre && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-red-400 border border-white/5">
                    {message.movieCard.genre}
                  </span>
                )}
              </div>
            </div>

            {message.movieCard.taglineOrVibe && (
              <p className="mt-2.5 text-xs italic text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5">
                "{message.movieCard.taglineOrVibe}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isCineMood && (
        <div className="shrink-0 mt-1">
          <div className="w-10 h-10 rounded-xl bg-[#1a1a22] border border-white/10 flex items-center justify-center text-slate-300 font-bold text-xs shadow-md">
            YOU
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { X, Clapperboard, Calendar, User, Sparkles, Film, MessageCircle, Star } from 'lucide-react';
import { MovieCardData } from '../types';

interface MovieCardModalProps {
  movie: MovieCardData | null;
  onClose: () => void;
  onAskCineMate: (prompt: string) => void;
}

export const MovieCardModal: React.FC<MovieCardModalProps> = ({
  movie,
  onClose,
  onAskCineMate,
}) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="relative h-32 bg-gradient-to-r from-amber-600 via-rose-600 to-purple-800 p-5 flex items-end justify-between">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-400/40 text-amber-400 shadow-xl">
              <Clapperboard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                Film Spotlight
              </span>
              <h3 className="text-xl font-extrabold text-white drop-shadow">
                {movie.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {movie.imdbRating && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                IMDb {movie.imdbRating}
              </span>
            )}
            {movie.year && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {movie.year}
              </span>
            )}
            {movie.director && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                <User className="w-3.5 h-3.5 text-rose-400" />
                Dir: {movie.director}
              </span>
            )}
            {movie.genre && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {movie.genre}
              </span>
            )}
          </div>

          {/* Vibe Quote */}
          {movie.taglineOrVibe && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm italic leading-relaxed">
              "{movie.taglineOrVibe}"
            </div>
          )}

          {/* Action Prompts for CineMate */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Ask CineMate About {movie.title}:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onAskCineMate(`Yo, give me some deep behind-the-scenes trivia for ${movie.title}!`);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 hover:border-amber-500/40 border border-slate-700/60 text-xs font-medium text-slate-200 text-left transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>BTS Trivia & Details</span>
              </button>

              <button
                onClick={() => {
                  onAskCineMate(`What's your ultimate spicy take or honest review on ${movie.title}?`);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 hover:border-rose-500/40 border border-slate-700/60 text-xs font-medium text-slate-200 text-left transition-all flex items-center gap-2"
              >
                <Film className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Spicy Review & Hot Take</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Check, Sparkles, Film } from 'lucide-react';
import { getImageUrl } from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';

export default function MovieCard({ movie, showSimilarity = false }) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '';
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
  const primaryGenre = movie.genres && movie.genres.length > 0 ? movie.genres[0] : null;

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-[#191C24] border border-[#272B38] hover:border-[#E50935]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#E50935]/10 hover:-translate-y-1.5">
      
      {/* Poster Image Container */}
      <Link to={`/movie/${movie.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-[#111319]">
        <img
          src={getImageUrl(movie.poster_path, 'w500')}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#191C24] via-transparent to-black/40 opacity-70 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none z-10">
          {rating ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-amber-400 text-xs font-bold border border-amber-500/20 shadow-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
          ) : <div />}

          {/* Similarity score badge if present */}
          {showSimilarity && movie.similarity_percentage && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E50935] text-white text-xs font-bold shadow-lg shadow-[#E50935]/40 animate-pulse-slow">
              <Sparkles className="w-3 h-3" />
              <span>{movie.similarity_percentage}% Match</span>
            </div>
          )}
        </div>

        {/* Quick Add To Watchlist Button (Top Right / Bottom Hover) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWatchlist(movie);
          }}
          title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          className={`absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-lg ${
            inWatchlist
              ? 'bg-[#E50935] text-white shadow-[#E50935]/50 scale-100'
              : 'bg-black/70 hover:bg-[#E50935] text-white border border-white/20 opacity-0 group-hover:opacity-100 hover:scale-110'
          }`}
        >
          {inWatchlist ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </Link>

      {/* Card Info Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#A1A1AA] mb-1">
            <span>{releaseYear || 'Cinema'}</span>
            {primaryGenre && (
              <span className="px-1.5 py-0.2 rounded bg-[#111319] border border-[#272B38] text-[10px] text-zinc-300">
                {primaryGenre}
              </span>
            )}
          </div>

          <Link to={`/movie/${movie.id}`}>
            <h3 className="text-sm font-bold text-white group-hover:text-[#E50935] transition-colors duration-200 line-clamp-1" title={movie.title}>
              {movie.title}
            </h3>
          </Link>
        </div>

        {/* Director or Highlight Note if available */}
        {movie.director && (
          <p className="text-[11px] text-[#A1A1AA] line-clamp-1">
            Dir. <span className="text-zinc-300">{movie.director}</span>
          </p>
        )}

        {/* Reason tag if recommendation explanation exists */}
        {movie.explanation && movie.explanation.highlight && (
          <div className="mt-1 pt-1.5 border-t border-[#272B38] text-[10px] text-emerald-400 line-clamp-1 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 flex-shrink-0" />
            <span>{movie.explanation.highlight}</span>
          </div>
        )}
      </div>

    </div>
  );
}

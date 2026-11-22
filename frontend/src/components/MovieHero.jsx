import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Info, Bookmark, Check, Star, Sparkles } from 'lucide-react';
import { getBackdropUrl } from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';

export default function MovieHero({ movie }) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const navigate = useNavigate();

  if (!movie) return null;

  const inWatchlist = isInWatchlist(movie.id);
  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : '';
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '8.4';

  const handleAimatch = () => {
    navigate(`/recommendations?seed=${movie.id}`);
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden">
      
      {/* Background Image with Cinematic Gradients */}
      <div className="absolute inset-0">
        <img
          src={getBackdropUrl(movie.backdrop_path)}
          alt={movie.title}
          className="w-full h-full object-cover object-center filter brightness-90 scale-100 animate-fade-in"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop';
          }}
        />
        {/* Left atmospheric darkening */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090D] via-[#08090D]/80 to-transparent w-full md:w-3/4" />
        {/* Bottom fade to page background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/40 to-transparent" />
        {/* Top subtle vignette */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#08090D]/80 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16">
        <div className="max-w-2xl space-y-4">
          
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[#E50935] text-white text-xs font-black tracking-wider uppercase shadow-md shadow-[#E50935]/30">
              Featured Spotlight
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating} Rating</span>
            </div>
            {releaseYear && (
              <span className="text-xs font-semibold text-[#A1A1AA] bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
                {releaseYear}
              </span>
            )}
            {movie.runtime > 0 && (
              <span className="text-xs font-medium text-[#A1A1AA]">
                {movie.runtime} min
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
            {movie.title}
          </h1>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white/90 border border-white/10"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Overview Synopsis */}
          <p className="text-sm sm:text-base text-[#A1A1AA] line-clamp-3 leading-relaxed drop-shadow">
            {movie.overview}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            
            {/* View Details CTA */}
            <Link
              to={`/movie/${movie.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E50935] hover:bg-[#ff1744] text-white text-sm font-bold shadow-lg shadow-[#E50935]/40 transition-all duration-200 hover:scale-105"
            >
              <Info className="w-4 h-4" />
              <span>Explore Movie</span>
            </Link>

            {/* Watchlist Toggle CTA */}
            <button
              onClick={() => toggleWatchlist(movie)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold backdrop-blur-md transition-all duration-200 hover:scale-105 ${
                inWatchlist
                  ? 'bg-[#191C24] border-[#E50935] text-white shadow-md'
                  : 'bg-black/60 hover:bg-[#191C24] border-white/20 text-white'
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-[#E50935] stroke-[3]" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>

            {/* AI Recommender match CTA */}
            <button
              onClick={handleAimatch}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#191C24]/80 hover:bg-[#191C24] text-emerald-400 border border-emerald-500/30 text-sm font-semibold backdrop-blur-md transition-all duration-200 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Find Similar Vibes</span>
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Sparkles, Trash2, ArrowRight, Film, Search, ArrowUpDown } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const navigate = useNavigate();

  const [filterQuery, setFilterQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');

  const filtered = watchlist.filter((m) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const title = m.title?.toLowerCase() || '';
    const genres = m.genres?.map((g) => g.toLowerCase()).join(' ') || '';
    return title.includes(q) || genres.includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === 'rating') {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }
    if (sortOption === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    // recent
    return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
  });

  const handleAiRecommend = () => {
    const seedIds = watchlist.slice(0, 5).map((m) => m.id);
    navigate(`/recommendations?seeds=${seedIds.join(',')}`);
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#191C24] via-[#111319] to-[#191C24] border border-[#272B38]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E50935] flex items-center justify-center shadow-lg shadow-[#E50935]/30">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              My <span className="text-[#E50935]">Watchlist</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            You have saved <strong className="text-white">{watchlist.length}</strong> {watchlist.length === 1 ? 'movie' : 'movies'} to stream or explore later
          </p>
        </div>

        {watchlist.length > 0 && (
          <button
            onClick={handleAiRecommend}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Matches from Watchlist</span>
          </button>
        )}
      </div>

      {watchlist.length > 0 ? (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-[#111319] border border-[#272B38]">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Filter saved titles..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-[#191C24] border border-[#272B38] text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#E50935]"
              />
              <Search className="w-4 h-4 text-[#A1A1AA] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <ArrowUpDown className="w-4 h-4 text-[#A1A1AA]" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-[#191C24] border border-[#272B38] text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#E50935]"
              >
                <option value="recent">Recently Added</option>
                <option value="rating">Highest Rating</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {sorted.map((movie) => (
              <div key={movie.id} className="relative group">
                <MovieCard movie={movie} />
                {/* Remove button badge */}
                <button
                  onClick={() => removeFromWatchlist(movie.id)}
                  title="Remove from Watchlist"
                  className="absolute top-2 left-2 z-30 p-1.5 rounded-lg bg-black/80 hover:bg-[#E50935] text-white/80 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="py-24 px-4 text-center space-y-5 rounded-2xl bg-[#111319] border border-[#272B38]">
          <div className="w-16 h-16 rounded-2xl bg-[#191C24] border border-[#272B38] flex items-center justify-center mx-auto text-[#A1A1AA]">
            <Film className="w-8 h-8 text-[#E50935]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Your Watchlist is empty</h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto">
              Save your favorite movies to build your personal streaming queue and receive hyper-accurate machine learning recommendations.
            </p>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E50935] hover:bg-[#ff1744] text-white text-xs font-bold shadow-lg shadow-[#E50935]/30 transition-all hover:scale-105"
          >
            <span>Explore Movies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}

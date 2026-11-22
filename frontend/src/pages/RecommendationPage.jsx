import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  X,
  Search,
  Check,
  RefreshCw,
  Film,
  Zap,
  Info,
  Sliders,
  ChevronRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { api, getImageUrl } from '../api/client';
import MovieCard from '../components/MovieCard';
import { useWatchlist } from '../context/WatchlistContext';

export default function RecommendationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { watchlist } = useWatchlist();

  const [candidates, setCandidates] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [computing, setComputing] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [algoInfo, setAlgoInfo] = useState('');

  // 1. Load candidate movies
  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoadingCandidates(true);
        const data = await api.getCandidates(80);
        const list = data.candidates || [];
        setCandidates(list);

        // Check for seed movie in URL (e.g. ?seed=157336 or ?seeds=12,34)
        const seedId = searchParams.get('seed');
        const seedIds = searchParams.get('seeds');

        let initialSeeds = [];
        if (seedId) {
          const matched = list.find((m) => m.id === parseInt(seedId));
          if (matched) initialSeeds.push(matched);
        } else if (seedIds) {
          const ids = seedIds.split(',').map((id) => parseInt(id.trim()));
          initialSeeds = list.filter((m) => ids.includes(m.id));
        }

        // Default seeds if none specified: Inception + Interstellar
        if (initialSeeds.length === 0) {
          const inception = list.find((m) => m.id === 27205);
          const interstellar = list.find((m) => m.id === 157336);
          if (inception) initialSeeds.push(inception);
          if (interstellar) initialSeeds.push(interstellar);
        }

        setSelectedMovies(initialSeeds);
      } catch (err) {
        console.error('Failed to load candidates:', err);
      } finally {
        setLoadingCandidates(false);
      }
    }

    fetchCandidates();
  }, [searchParams]);

  // 2. Compute recommendations when selectedMovies change or when user clicks compute
  const computeRecommendations = async (moviesToUse = selectedMovies) => {
    if (!moviesToUse || moviesToUse.length === 0) {
      setRecommendations([]);
      return;
    }

    try {
      setComputing(true);
      const favoriteIds = moviesToUse.map((m) => m.id);
      const res = await api.getRecommendations(favoriteIds, 10);
      setRecommendations(res.recommendations || []);
      setAlgoInfo(res.algorithm || 'Content-Based TF-IDF');
      setHasGenerated(true);
    } catch (err) {
      console.error('Error computing recommendations:', err);
    } finally {
      setComputing(false);
    }
  };

  // Run initial computation once selected movies are loaded
  useEffect(() => {
    if (selectedMovies.length > 0 && !hasGenerated) {
      computeRecommendations(selectedMovies);
    }
  }, [selectedMovies]);

  // Toggle selection
  const toggleMovieSelection = (movie) => {
    const isSelected = selectedMovies.some((m) => m.id === movie.id);
    let updated;
    if (isSelected) {
      updated = selectedMovies.filter((m) => m.id !== movie.id);
    } else {
      if (selectedMovies.length >= 5) {
        alert('You can select up to 5 favorite movies for optimal vector calibration.');
        return;
      }
      updated = [...selectedMovies, movie];
    }
    setSelectedMovies(updated);
    computeRecommendations(updated);
  };

  // Preset quick-loaders
  const loadPreset = (presetType) => {
    let presetMovies = [];
    if (presetType === 'nolan') {
      presetMovies = candidates.filter((m) =>
        [27205, 157336, 155].includes(m.id)
      );
    } else if (presetType === 'scifi') {
      presetMovies = candidates.filter((m) =>
        [603, 335984, 438631].includes(m.id)
      );
    } else if (presetType === 'thriller') {
      presetMovies = candidates.filter((m) =>
        [550, 807, 680].includes(m.id)
      );
    } else if (presetType === 'watchlist') {
      presetMovies = candidates.filter((m) =>
        watchlist.some((w) => w.id === m.id)
      ).slice(0, 5);
    }

    if (presetMovies.length > 0) {
      setSelectedMovies(presetMovies);
      computeRecommendations(presetMovies);
    }
  };

  // Filter candidates list
  const filteredCandidates = candidates.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = m.title?.toLowerCase().includes(q);
    const directorMatch = m.director?.toLowerCase().includes(q);
    const genreMatch = m.genres?.some((g) => g.toLowerCase().includes(q));
    return titleMatch || directorMatch || genreMatch;
  });

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      
      {/* Hero Banner Header */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#191C24] via-[#111319] to-[#191C24] border border-[#E50935]/40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E50935]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50935]/20 border border-[#E50935]/40 text-[#E50935] text-xs font-bold tracking-wider uppercase">
            <BrainCircuit className="w-4 h-4" />
            <span>Content-Based Recommendation Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            AI <span className="text-[#E50935]">Vibe Match</span>
          </h1>

          <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
            Select 1 to 5 of your favorite movies. Our machine learning engine converts them into a combined TF-IDF feature centroid, scoring narrative style, director motifs, and thematic vectors using Cosine Similarity.
          </p>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-[#A1A1AA] font-semibold mr-1">Quick Presets:</span>
            <button
              onClick={() => loadPreset('nolan')}
              className="px-3 py-1 rounded-lg bg-[#111319] hover:bg-[#191C24] text-xs font-medium text-zinc-300 border border-[#272B38] transition-colors"
            >
              Nolan Mind-Benders
            </button>
            <button
              onClick={() => loadPreset('scifi')}
              className="px-3 py-1 rounded-lg bg-[#111319] hover:bg-[#191C24] text-xs font-medium text-zinc-300 border border-[#272B38] transition-colors"
            >
              Sci-Fi Masters
            </button>
            <button
              onClick={() => loadPreset('thriller')}
              className="px-3 py-1 rounded-lg bg-[#111319] hover:bg-[#191C24] text-xs font-medium text-zinc-300 border border-[#272B38] transition-colors"
            >
              Dark Neo-Noir
            </button>
            {watchlist.length > 0 && (
              <button
                onClick={() => loadPreset('watchlist')}
                className="px-3 py-1 rounded-lg bg-[#E50935]/20 hover:bg-[#E50935]/30 text-xs font-semibold text-[#E50935] border border-[#E50935]/40 transition-colors"
              >
                Use My Watchlist ({watchlist.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selected Favorites Dock */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#111319] border border-[#272B38] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50935] animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Selected Favorites ({selectedMovies.length} / 5)
            </h2>
          </div>

          {selectedMovies.length > 0 && (
            <button
              onClick={() => {
                setSelectedMovies([]);
                setRecommendations([]);
              }}
              className="text-xs text-[#A1A1AA] hover:text-[#E50935] transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {selectedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {selectedMovies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#191C24] border border-[#E50935]/50 shadow-md group relative overflow-hidden"
              >
                <img
                  src={getImageUrl(movie.poster_path, 'w185')}
                  alt={movie.title}
                  className="w-11 h-16 object-cover rounded-md flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=300&auto=format&fit=crop';
                  }}
                />
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-xs font-bold text-white truncate" title={movie.title}>
                    {movie.title}
                  </h4>
                  <p className="text-[10px] text-[#A1A1AA] truncate">
                    {movie.director || movie.genres?.[0]}
                  </p>
                  <span className="inline-block mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Seed Vector
                  </span>
                </div>
                {/* Remove button */}
                <button
                  onClick={() => toggleMovieSelection(movie)}
                  className="absolute right-2 top-2 p-1 rounded-md bg-white/5 hover:bg-[#E50935] text-[#A1A1AA] hover:text-white transition-colors"
                  title="Remove from favorites"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-[#272B38] text-center text-xs text-[#A1A1AA]">
            Select one or more movies below to initialize the recommendation engine.
          </div>
        )}

        {/* Re-calculate Button */}
        {selectedMovies.length > 0 && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => computeRecommendations(selectedMovies)}
              disabled={computing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E50935] hover:bg-[#ff1744] text-white text-xs font-bold shadow-lg shadow-[#E50935]/40 transition-all hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${computing ? 'animate-spin' : ''}`} />
              <span>{computing ? 'Calculating Similarity Vectors...' : 'Refresh Recommendations'}</span>
            </button>
          </div>
        )}
      </section>

      {/* AI Recommendations Results Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#272B38] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E50935]" />
              <h2 className="text-2xl font-black text-white tracking-tight">
                Recommended For Your Taste
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
              Top 10 content-matched movies ranked by Cosine Similarity distance
            </p>
          </div>

          {algoInfo && (
            <div className="text-[11px] font-mono text-zinc-400 bg-[#111319] px-3 py-1.5 rounded-lg border border-[#272B38]">
              Model: <span className="text-emerald-400 font-semibold">{algoInfo}</span>
            </div>
          )}
        </div>

        {computing ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-[#272B38] border-t-[#E50935] animate-spin"></div>
            <p className="text-sm font-semibold text-white">Running TF-IDF Vectorization...</p>
            <p className="text-xs text-[#A1A1AA]">Computing dot products across 8,000 text features</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {recommendations.map((movie) => (
              <div key={movie.id} className="flex flex-col">
                <MovieCard movie={movie} showSimilarity={true} />
                
                {/* Explainability Tag Pill */}
                {movie.explanation && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#111319] border border-[#272B38] space-y-1 text-left">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                      <Zap className="w-3 h-3 flex-shrink-0" />
                      <span>{movie.similarity_percentage}% Affinity</span>
                    </div>
                    <p className="text-[10px] text-zinc-300 line-clamp-2 leading-relaxed">
                      {movie.explanation.reasons?.[0] || 'High thematic overlap'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-[#A1A1AA]">
            Select your favorite movies to reveal algorithmic recommendations.
          </div>
        )}
      </section>

      {/* Movie Catalog Candidate Picker */}
      <section className="space-y-4 pt-6 border-t border-[#272B38]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white">
              Pick Your Favorites
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Click any movie to add or remove it from your recommendation seeds
            </p>
          </div>

          {/* Quick Search in Candidates */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search candidate titles or directors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111319] border border-[#272B38] text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#E50935]"
            />
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-3" />
          </div>
        </div>

        {loadingCandidates ? (
          <div className="py-12 text-center text-xs text-[#A1A1AA]">
            Loading movie candidates...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredCandidates.slice(0, 48).map((movie) => {
              const isSelected = selectedMovies.some((m) => m.id === movie.id);
              return (
                <button
                  key={movie.id}
                  onClick={() => toggleMovieSelection(movie)}
                  className={`group relative rounded-xl overflow-hidden text-left border transition-all duration-200 aspect-[2/3] flex flex-col justify-end p-2.5 ${
                    isSelected
                      ? 'border-[#E50935] ring-2 ring-[#E50935] shadow-lg shadow-[#E50935]/40 scale-95'
                      : 'border-[#272B38] hover:border-white/40 hover:scale-102'
                  }`}
                >
                  <img
                    src={getImageUrl(movie.poster_path, 'w300')}
                    alt={movie.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Selection indicator checkmark */}
                  {isSelected ? (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E50935] text-white flex items-center justify-center shadow-lg">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border border-white/20">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="relative z-10">
                    <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#E50935] transition-colors">
                      {movie.title}
                    </h4>
                    <span className="text-[10px] text-[#A1A1AA]">
                      {movie.release_date ? movie.release_date.split('-')[0] : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

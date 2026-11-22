import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  Bookmark,
  Check,
  Play,
  Sparkles,
  ArrowLeft,
  Users,
  Video,
  Share2
} from 'lucide-react';
import { api, getImageUrl, getBackdropUrl } from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import TrailerModal from '../components/TrailerModal';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const data = await api.getMovieDetails(id);
        setMovie(data);

        // Fetch similar content-based movies
        const simData = await api.getSimilarMovies(id, 8);
        setSimilar(simData.results || []);
      } catch (err) {
        console.error('Failed to load movie details:', err);
        setError('Movie details could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadMovie();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#272B38] border-t-[#E50935] animate-spin"></div>
        <p className="text-sm text-[#A1A1AA]">Retrieving cinematic archives...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-sm text-[#A1A1AA]">
          The movie you are looking for might not be in our catalog or TMDB archives.
        </p>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E50935] text-white text-sm font-bold shadow-lg shadow-[#E50935]/30 hover:bg-[#ff1744]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : 'N/A';

  return (
    <div className="min-h-screen pb-20 space-y-12">
      
      {/* Backdrop Header Container */}
      <div className="relative w-full min-h-[500px] lg:min-h-[620px] overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <img
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-50"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090D] via-transparent to-black/60" />
        </div>

        {/* Content Details Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 flex flex-col justify-end min-h-[500px] lg:min-h-[620px]">
          
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="self-start mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-[#191C24] text-xs font-semibold text-white/90 border border-white/10 backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            
            {/* Poster Card */}
            <div className="w-48 sm:w-60 md:w-72 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-[#272B38] bg-[#191C24]">
              <img
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
                }}
              />
            </div>

            {/* Info Column */}
            <div className="flex-1 space-y-5">
              
              {/* Genres Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full bg-[#E50935]/20 border border-[#E50935]/40 text-[#E50935] text-xs font-semibold tracking-wide"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              {/* Quick Metrics (Year, Rating, Runtime) */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-[#A1A1AA] pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#191C24] border border-amber-500/30 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{rating}</span>
                  {movie.vote_count > 0 && (
                    <span className="text-xs font-normal text-[#A1A1AA] ml-1">
                      ({movie.vote_count.toLocaleString()} votes)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-[#A1A1AA]" />
                  <span>{releaseYear}</span>
                </div>

                {movie.runtime > 0 && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-[#A1A1AA]" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                {/* Watchlist Toggle */}
                <button
                  onClick={() => toggleWatchlist(movie)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-bold shadow-lg transition-all duration-200 hover:scale-105 ${
                    inWatchlist
                      ? 'bg-[#E50935] border-[#E50935] text-white shadow-[#E50935]/30'
                      : 'bg-[#191C24] hover:bg-[#272B38] border-[#272B38] text-white'
                  }`}
                >
                  {inWatchlist ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Saved in Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>

                {/* AI Recommender Shortcut */}
                <Link
                  to={`/recommendations?seed=${movie.id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Find Similar Vibes (AI)</span>
                </Link>

                {/* Trailer Button */}
                {movie.trailer_key && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 backdrop-blur-md transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Trailer</span>
                  </button>
                )}
              </div>

              {/* Overview */}
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A1A1AA]">
                  Overview
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
                  {movie.overview || "No synopsis available for this title."}
                </p>
              </div>

              {/* Cast and Crew Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#272B38]">
                {movie.director && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] block mb-1">
                      Director
                    </span>
                    <span className="text-sm font-bold text-white">
                      {movie.director}
                    </span>
                  </div>
                )}

                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] block mb-1">
                      Key Cast
                    </span>
                    <span className="text-sm text-zinc-300">
                      {movie.cast.slice(0, 5).join(', ')}
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Content-Based Similar Movies Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="border-t border-[#272B38] pt-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#E50935]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Similar Movies via Content-Based Filtering
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mb-6">
            Ranked using TF-IDF cosine distance across narrative themes, director traits, and genre overlap
          </p>

          {similar.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {similar.map((simMovie) => (
                <MovieCard key={simMovie.id} movie={simMovie} showSimilarity={true} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#A1A1AA]">No similar titles identified in current index.</p>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailer_key && (
        <TrailerModal
          trailerKey={movie.trailer_key}
          title={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}

    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, Flame, Film, TrendingUp, Award, Clapperboard } from 'lucide-react';
import { api } from '../api/client';
import MovieHero from '../components/MovieHero';
import MovieRow from '../components/MovieRow';
import MovieCard from '../components/MovieCard';
import { useWatchlist } from '../context/WatchlistContext';

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [genres, setGenres] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { watchlist } = useWatchlist();

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [trendingData, popularData, genresData] = await Promise.all([
          api.getTrending(1),
          api.getPopular(1),
          api.getGenres()
        ]);

        const trendingMovies = trendingData.results || [];
        const popularMovies = popularData.results || [];

        setTrending(trendingMovies);
        setPopular(popularMovies);
        setGenres(genresData.genres || []);

        // Choose spotlight movie (Inception, Oppenheimer, or first trending)
        const spotlight = trendingMovies.find(m => m.id === 27205 || m.id === 157336 || m.id === 872585) || trendingMovies[0];
        setFeaturedMovie(spotlight);

        // Fetch AI recommendations based on user's watchlist or top catalog movies
        const seedIds = watchlist.length > 0
          ? watchlist.slice(0, 3).map(m => m.id)
          : [27205, 157336]; // Inception + Interstellar default seed

        const recsData = await api.getRecommendations(seedIds, 8);
        setAiRecs(recsData.recommendations || []);

      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, [watchlist]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#272B38] border-t-[#E50935] animate-spin"></div>
        <p className="text-sm text-[#A1A1AA] font-medium tracking-wide">
          Synthesizing cinematic universe...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-12 pb-16">
      
      {/* Featured Hero Banner */}
      {featuredMovie && <MovieHero movie={featuredMovie} />}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Trending Section */}
        <MovieRow
          title="Trending This Week"
          subtitle="Top cinema capturing audiences worldwide right now"
          movies={trending}
          seeAllLink="/discover?sort_by=popularity.desc"
        />

        {/* AI Recommendations Highlight Row */}
        {aiRecs && aiRecs.length > 0 && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#191C24] via-[#111319] to-[#191C24] border border-[#E50935]/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E50935]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#E50935] text-white">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Recommended For You
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#A1A1AA]">
                  {watchlist.length > 0
                    ? `Personalized match inferred from ${watchlist.length} saved movies in your watchlist`
                    : 'Smart algorithmic recommendations inferred from Christopher Nolan sci-fi & thriller signatures'}
                </p>
              </div>

              <Link
                to="/recommendations"
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#E50935] hover:bg-[#ff1744] text-white text-xs font-bold transition-all shadow-md shadow-[#E50935]/30"
              >
                Customize AI Vibe
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
              {aiRecs.slice(0, 4).map((movie) => (
                <MovieCard key={movie.id} movie={movie} showSimilarity={true} />
              ))}
            </div>
          </div>
        )}

        {/* Browse by Genre Interactive Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Browse By Genre
              </h2>
              <p className="text-xs sm:text-sm text-[#A1A1AA]">
                Find stories tailored to your cinematic mood
              </p>
            </div>
            <Link
              to="/discover"
              className="text-xs font-semibold text-[#E50935] hover:underline"
            >
              View All Genres
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {genres.slice(0, 6).map((g) => (
              <Link
                key={g.name}
                to={`/discover?genre=${encodeURIComponent(g.name)}`}
                className="group p-4 rounded-xl bg-[#191C24] border border-[#272B38] hover:border-[#E50935] transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between h-28"
              >
                <div className="w-8 h-8 rounded-lg bg-[#111319] group-hover:bg-[#E50935] flex items-center justify-center transition-colors">
                  <Film className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#E50935] transition-colors">
                    {g.name}
                  </h3>
                  <p className="text-[11px] text-[#A1A1AA]">
                    {g.count} titles
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Movies Row */}
        <MovieRow
          title="All-Time Popular Hits"
          subtitle="Critically celebrated cinema with record-breaking ratings"
          movies={popular}
          seeAllLink="/discover?sort_by=vote_average.desc"
        />

      </div>
    </div>
  );
}

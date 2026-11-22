import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Film } from 'lucide-react';
import { api } from '../api/client';
import MovieCard from '../components/MovieCard';

const GENRES_LIST = [
  'All',
  'Indian Cinema',
  'Action',
  'Science Fiction',
  'Drama',
  'Thriller',
  'Crime',
  'Comedy',
  'Horror',
  'Animation',
  'Adventure',
  'Mystery',
  'Romance',
  'Fantasy'
];

const RATING_OPTIONS = [
  { label: 'All Ratings', value: '' },
  { label: '⭐ 8.0+ Masterpieces', value: '8.0' },
  { label: '⭐ 7.5+ High Acclaim', value: '7.5' },
  { label: '⭐ 7.0+ Recommended', value: '7.0' },
];

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popularity.desc' },
  { label: 'Highest Rated', value: 'vote_average.desc' },
  { label: 'Newest Release', value: 'release_date.desc' },
  { label: 'Title (A-Z)', value: 'title.asc' },
];

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || 'All';
  const initialRating = searchParams.get('min_rating') || '';
  const initialSort = searchParams.get('sort_by') || 'popularity.desc';

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [minRating, setMinRating] = useState(initialRating);
  const [sortBy, setSortBy] = useState(initialSort);
  const [releaseYear, setReleaseYear] = useState('');

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state if URL query changes
  useEffect(() => {
    const qFromUrl = searchParams.get('q');
    if (qFromUrl !== null && qFromUrl !== query) {
      setQuery(qFromUrl);
    }
    const gFromUrl = searchParams.get('genre');
    if (gFromUrl && gFromUrl !== selectedGenre) {
      setSelectedGenre(gFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);

        if (query.trim()) {
          const data = await api.searchMovies(query.trim(), page);
          let results = data.results || [];

          // Client-side refine by genre / rating if query is active
          if (selectedGenre !== 'All') {
            results = results.filter((m) =>
              m.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
            );
          }
          if (minRating) {
            results = results.filter((m) => m.vote_average >= parseFloat(minRating));
          }

          setMovies(results);
          setTotalResults(results.length);
          setTotalPages(1);
        } else {
          const data = await api.discoverMovies({
            genre: selectedGenre,
            min_rating: minRating ? parseFloat(minRating) : null,
            year: releaseYear ? parseInt(releaseYear) : null,
            sort_by: sortBy,
            page: page,
          });

          setMovies(data.results || []);
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
        }
      } catch (err) {
        console.error('Error fetching discover movies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [query, selectedGenre, minRating, sortBy, releaseYear, page]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedGenre('All');
    setMinRating('');
    setSortBy('popularity.desc');
    setReleaseYear('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Discover <span className="text-[#E50935]">Movies</span>
        </h1>
        <p className="text-sm text-[#A1A1AA]">
          Filter through rich cinematic catalogs by genre, acclaim, and release date
        </p>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="p-5 rounded-2xl bg-[#111319] border border-[#272B38] space-y-5">
        
        {/* Top Search Input Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by movie title, director (e.g. Nolan, Tarantino), or cast..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#191C24] border border-[#272B38] focus:border-[#E50935] text-white text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#E50935]"
            />
            <Search className="w-5 h-5 text-[#A1A1AA] absolute left-3.5 top-3.5" />
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#191C24] hover:bg-[#272B38] text-[#A1A1AA] hover:text-white text-xs font-semibold border border-[#272B38] transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Genre Pill Filter Scroller */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block">
            Genre Filter
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {GENRES_LIST.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  setSelectedGenre(genre);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedGenre.toLowerCase() === genre.toLowerCase()
                    ? 'bg-[#E50935] text-white shadow-lg shadow-[#E50935]/30'
                    : 'bg-[#191C24] text-[#A1A1AA] hover:text-white border border-[#272B38]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Dropdowns Row (Rating + Sort + Year) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#272B38]/60">
          
          {/* Rating Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase">
              Minimum Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#191C24] border border-[#272B38] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E50935]"
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#191C24] border border-[#272B38] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E50935]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase">
              Release Year
            </label>
            <input
              type="number"
              placeholder="e.g. 2023, 1999"
              min="1950"
              max="2030"
              value={releaseYear}
              onChange={(e) => {
                setReleaseYear(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#191C24] border border-[#272B38] text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E50935]"
            />
          </div>

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#A1A1AA] px-1">
        <span>
          Showing <strong className="text-white">{movies.length}</strong> {query ? `results for "${query}"` : 'curated movies'}
        </span>
        {selectedGenre !== 'All' && (
          <span className="px-2 py-0.5 rounded bg-[#191C24] border border-[#272B38] text-[#E50935] font-semibold">
            {selectedGenre}
          </span>
        )}
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#272B38] border-t-[#E50935] animate-spin"></div>
          <p className="text-xs text-[#A1A1AA]">Filtering cinematic catalog...</p>
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center space-y-4 rounded-2xl bg-[#111319] border border-[#272B38]">
          <div className="w-14 h-14 rounded-full bg-[#191C24] flex items-center justify-center mx-auto text-[#A1A1AA]">
            <Film className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No movies match your filters</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            Try adjusting your query, lowering minimum rating, or clearing genre filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#E50935] text-white text-xs font-bold shadow-lg shadow-[#E50935]/30 hover:bg-[#ff1744] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

export default function MovieRow({
  title,
  subtitle,
  movies = [],
  seeAllLink,
  showSimilarity = false
}) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="relative py-4 space-y-3">
      {/* Row Header */}
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Action Right: See All + Scroll Buttons */}
        <div className="flex items-center gap-2">
          {seeAllLink && (
            <Link
              to={seeAllLink}
              className="text-xs font-semibold text-[#E50935] hover:text-[#ff1744] flex items-center gap-1 transition-colors mr-2"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Nav Chevrons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-lg bg-[#191C24] hover:bg-[#272B38] text-white flex items-center justify-center border border-[#272B38] transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-lg bg-[#191C24] hover:bg-[#272B38] text-white flex items-center justify-center border border-[#272B38] transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Movies Scroller */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 scroll-smooth py-2"
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="flex-none w-[170px] sm:w-[190px] md:w-[210px]"
          >
            <MovieCard movie={movie} showSimilarity={showSimilarity} />
          </div>
        ))}
      </div>
    </section>
  );
}

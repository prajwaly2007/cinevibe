import React from 'react';
import { Film, Heart, Sparkles, Database, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-[#08090D] border-t border-[#272B38] pt-14 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#272B38]/60">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E50935] to-[#990022] flex items-center justify-center shadow-lg shadow-[#E50935]/20">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                CINE<span className="text-[#E50935]">VIBE</span>
              </span>
            </div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Next-generation cinematic recommendation engine powered by content-based vector embeddings, TF-IDF vectorization, and cosine similarity.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h4>
            <ul className="space-y-2 text-sm text-[#A1A1AA]">
              <li>
                <Link to="/" className="hover:text-[#E50935] transition-colors">Home Highlights</Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-[#E50935] transition-colors">Discover Catalog</Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-[#E50935] transition-colors flex items-center gap-1.5 text-white font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#E50935]" />
                  AI Recommender
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-[#E50935] transition-colors">My Watchlist</Link>
              </li>
            </ul>
          </div>

          {/* Machine Learning Specs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">ML Architecture</h4>
            <div className="p-3.5 rounded-xl bg-[#111319] border border-[#272B38] space-y-2 text-xs text-[#A1A1AA]">
              <div className="flex items-center justify-between">
                <span>Algorithm</span>
                <span className="text-white font-mono font-medium">TF-IDF Vectorizer</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Distance Metric</span>
                <span className="text-white font-mono font-medium">Cosine Similarity</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Multi-Profile</span>
                <span className="text-white font-mono font-medium">Vector Centroid</span>
              </div>
            </div>
          </div>

          {/* TMDB Attribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#01b4e4]" />
              TMDB Attribution
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-black text-xs bg-[#0d253f] text-[#01b4e4] border border-[#01b4e4]/30 tracking-wider">
                TMDB
              </span>
              <span className="text-xs text-[#A1A1AA]">The Movie Database</span>
            </div>
            <p className="text-xs text-[#A1A1AA]/80 leading-relaxed">
              This product uses the TMDB API but is not endorsed or certified by TMDB. All movie data, metadata, posters, and imagery are provided courtesy of TMDB.
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A1A1AA] gap-4">
          <p>© {new Date().getFullYear()} CineVibe. Crafted for film lovers & cinephiles.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              FastAPI + ML System Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

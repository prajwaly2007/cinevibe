import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Film, Search, Bookmark, Sparkles, Compass, Menu, X, User } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { count } = useWatchlist();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Film },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'AI Match', path: '/recommendations', icon: Sparkles, badge: 'AI' },
    { name: 'Watchlist', path: '/watchlist', icon: Bookmark, count: count },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50935] to-[#990022] flex items-center justify-center shadow-lg shadow-[#E50935]/30 group-hover:scale-105 transition-transform duration-300">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-wider text-white">
                CINE<span className="text-[#E50935]">VIBE</span>
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-[#A1A1AA] uppercase -mt-1">
                AI Recommendation Engine
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-[#191C24] border border-[#272B38] shadow-inner'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E50935] text-white uppercase tracking-wider">
                      {link.badge}
                    </span>
                  )}
                  {link.count !== undefined && link.count > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E50935] text-white">
                      {link.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Bar (Search + Profile) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 lg:w-64 bg-[#111319] border border-[#272B38] focus:border-[#E50935] text-white text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#E50935] placeholder-[#A1A1AA]/60 transition-all duration-200"
              />
              <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5 pointer-events-none" />
            </form>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#272B38]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-[#E50935] flex items-center justify-center text-white text-xs font-bold shadow-md">
                CV
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">Cinephile</p>
                <p className="text-[10px] font-medium text-[#E50935]">VIP Member</p>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#191C24] text-[#A1A1AA] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111319] border-b border-[#272B38] px-4 pt-3 pb-6 space-y-4 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#191C24] border border-[#272B38] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#E50935]"
            />
            <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
          </form>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium ${
                      isActive ? 'bg-[#191C24] text-white border border-[#272B38]' : 'text-[#A1A1AA]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </div>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E50935] text-white">
                      {link.count}
                    </span>
                  )}
                  {link.badge && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#E50935] text-white uppercase">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

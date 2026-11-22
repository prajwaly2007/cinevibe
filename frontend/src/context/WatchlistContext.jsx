import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cinevibe_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load watchlist from localStorage', e);
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('cinevibe_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to persist watchlist to localStorage', e);
    }
  }, [watchlist]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const addToWatchlist = (movie) => {
    if (!movie || !movie.id) return;
    setWatchlist((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      showToast(`Added "${movie.title}" to Watchlist`);
      return [{ ...movie, addedAt: new Date().toISOString() }, ...prev];
    });
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist((prev) => {
      const removed = prev.find((m) => m.id === movieId);
      if (removed) {
        showToast(`Removed "${removed.title}" from Watchlist`);
      }
      return prev.filter((m) => m.id !== movieId);
    });
  };

  const toggleWatchlist = (movie) => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some((m) => m.id === movieId);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        count: watchlist.length,
      }}
    >
      {children}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#191C24] border border-[#E50935]/40 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E50935] animate-pulse"></div>
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}

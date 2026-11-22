import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import WatchlistPage from './pages/WatchlistPage';
import RecommendationPage from './pages/RecommendationPage';

export default function App() {
  return (
    <WatchlistProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#08090D] text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/movie/:id" element={<MovieDetailsPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/recommendations" element={<RecommendationPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </WatchlistProvider>
  );
}

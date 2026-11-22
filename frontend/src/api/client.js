/**
 * CineVibe Centralized API Client
 * Connects to the FastAPI backend and handles image URL resolutions
 */

const rawApiUrl = import.meta.env.VITE_API_URL;
let API_BASE_URL = 'http://localhost:8000/api';

if (rawApiUrl && rawApiUrl.trim() !== '') {
  const cleanUrl = rawApiUrl.trim().replace(/\/+$/, '');
  API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
} else if (typeof window !== 'undefined') {
  API_BASE_URL = `http://${window.location.hostname}:8000/api`;
}
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Resolves full TMDB image URL with fallback SVG poster
 */
export function getImageUrl(path, size = 'w500') {
  if (!path || path === 'null' || path === 'undefined') {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
  }
  if (path.startsWith('http')) {
    return path;
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path, size = 'original') {
  if (!path || path === 'null' || path === 'undefined') {
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop';
  }
  if (path.startsWith('http')) {
    return path;
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export const api = {
  // Movie discovery & trending
  async getTrending(page = 1) {
    const res = await fetch(`${API_BASE_URL}/movies/trending?page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch trending movies');
    return res.json();
  },

  async getPopular(page = 1) {
    const res = await fetch(`${API_BASE_URL}/movies/popular?page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch popular movies');
    return res.json();
  },

  async getGenres() {
    const res = await fetch(`${API_BASE_URL}/movies/genres`);
    if (!res.ok) throw new Error('Failed to fetch genres');
    return res.json();
  },

  async searchMovies(query, page = 1) {
    if (!query?.trim()) return { results: [] };
    const res = await fetch(`${API_BASE_URL}/movies/search?q=${encodeURIComponent(query)}&page=${page}`);
    if (!res.ok) throw new Error('Failed to search movies');
    return res.json();
  },

  async discoverMovies({ genre, min_rating, year, sort_by = 'popularity.desc', page = 1 }) {
    const params = new URLSearchParams();
    if (genre && genre !== 'All') params.append('genre', genre);
    if (min_rating) params.append('min_rating', min_rating);
    if (year) params.append('year', year);
    if (sort_by) params.append('sort_by', sort_by);
    params.append('page', page);

    const res = await fetch(`${API_BASE_URL}/movies/discover?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to discover movies');
    return res.json();
  },

  async getMovieDetails(id) {
    const res = await fetch(`${API_BASE_URL}/movies/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch movie details for ID ${id}`);
    return res.json();
  },

  async getSimilarMovies(id, limit = 10) {
    const res = await fetch(`${API_BASE_URL}/movies/${id}/similar?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch similar movies');
    return res.json();
  },

  // Machine Learning Recommender
  async getCandidates(limit = 60) {
    const res = await fetch(`${API_BASE_URL}/recommendations/candidates?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch candidate movies');
    return res.json();
  },

  async getRecommendations(favoriteIds, topN = 10) {
    const res = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        favorite_ids: favoriteIds,
        top_n: topN
      }),
    });
    if (!res.ok) throw new Error('Failed to compute recommendations');
    return res.json();
  },

  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return { status: 'down' };
    return res.json();
  }
};

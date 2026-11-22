/**
 * CineVibe Centralized API Client & Fallback Engine
 * Connects to the FastAPI backend with seamless offline/cloud fallback to bundled movie data
 */
import localMovies from '../data/movies.json';

const rawApiUrl = import.meta.env.VITE_API_URL;
let API_BASE_URL = '/api';

if (rawApiUrl && rawApiUrl.trim() !== '') {
  const cleanUrl = rawApiUrl.trim().replace(/\/+$/, '');
  API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
} else if (typeof window !== 'undefined') {
  // Local development on Vite dev server
  if (window.location.port === '5173') {
    API_BASE_URL = `http://${window.location.hostname}:5000/api`;
  } else {
    // Production on Render / Vercel (same-origin relative URL)
    API_BASE_URL = '/api';
  }
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

// Universal safe fetch with timeout that works across all mobile browsers and iOS versions
function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  const fetchOpts = controller ? { ...options, signal: controller.signal } : options;
  return fetch(url, fetchOpts).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

// Client-side helper functions for zero-failure resilience
function getLocalTrending(page = 1) {
  const sorted = [...localMovies].sort((a, b) => (b.vote_count * b.vote_average) - (a.vote_count * a.vote_average));
  const start = (page - 1) * 20;
  return sorted.slice(start, start + 20);
}

function getLocalPopular(page = 1) {
  const sorted = [...localMovies].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  const start = (page - 1) * 20;
  return sorted.slice(start, start + 20);
}

function getLocalGenres() {
  const counts = {};
  localMovies.forEach(m => {
    (m.genres || []).forEach(g => {
      counts[g] = (counts[g] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

function filterLocalMovies({ genre, min_rating, year, sort_by = 'popularity.desc', page = 1 }) {
  let results = [...localMovies];

  if (genre && genre !== 'All') {
    results = results.filter(m => m.genres?.some(g => g.toLowerCase() === genre.toLowerCase()));
  }
  if (min_rating) {
    results = results.filter(m => (m.vote_average || 0) >= parseFloat(min_rating));
  }
  if (year) {
    results = results.filter(m => m.release_date && m.release_date.startsWith(String(year)));
  }

  if (sort_by === 'vote_average.desc') {
    results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  } else if (sort_by === 'release_date.desc') {
    results.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
  } else if (sort_by === 'title.asc') {
    results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else {
    results.sort((a, b) => (b.vote_count * b.vote_average) - (a.vote_count * a.vote_average));
  }

  const pageSize = 20;
  const start = (page - 1) * pageSize;
  return {
    page,
    total_results: results.length,
    total_pages: Math.ceil(results.length / pageSize),
    results: results.slice(start, start + pageSize)
  };
}

function getLocalClientRecommendations(favoriteIds, topN = 10) {
  const favSet = new Set(favoriteIds);
  const favMovies = localMovies.filter(m => favSet.has(m.id));

  // Extract preferences
  const favGenres = new Set();
  const favDirectors = new Set();
  const favKeywords = new Set();

  favMovies.forEach(m => {
    (m.genres || []).forEach(g => favGenres.add(g));
    if (m.director) favDirectors.add(m.director);
    (m.keywords || []).forEach(k => favKeywords.add(k));
  });

  const scored = localMovies
    .filter(m => !favSet.has(m.id))
    .map(m => {
      let score = 0;
      const reasons = [];

      // Director match
      if (m.director && favDirectors.has(m.director)) {
        score += 35;
        reasons.push(`Directed by ${m.director}`);
      }

      // Genre overlap
      const sharedG = (m.genres || []).filter(g => favGenres.has(g));
      if (sharedG.length > 0) {
        score += sharedG.length * 15;
        reasons.push(`Shared genres (${sharedG.slice(0, 2).join(', ')})`);
      }

      // Keywords overlap
      const sharedK = (m.keywords || []).filter(k => favKeywords.has(k));
      if (sharedK.length > 0) {
        score += sharedK.length * 10;
        reasons.push(`Similar themes: ${sharedK.slice(0, 3).join(', ')}`);
      }

      // Acclaim boost
      score += Math.min(20, (m.vote_average || 0) * 2);

      const simPct = Math.min(98.5, Math.max(55.0, Math.round(score * 1.1 * 10) / 10));

      return {
        ...m,
        similarity_score: score / 100,
        similarity_percentage: simPct,
        explanation: {
          highlight: reasons[0] || 'Matches narrative themes and cinematic atmosphere',
          reasons: reasons.length > 0 ? reasons : ['High cinematic affinity']
        }
      };
    })
    .sort((a, b) => b.similarity_percentage - a.similarity_percentage);

  return scored.slice(0, topN);
}

export const api = {
  // Movie discovery & trending
  async getTrending(page = 1) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/movies/trending?page=${page}`, {}, 4000);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) return data;
      }
    } catch (e) {
      console.warn('Backend trending request unreachable; serving local catalog:', e);
    }
    return { results: getLocalTrending(page), page };
  },

  async getPopular(page = 1) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/movies/popular?page=${page}`, {}, 4000);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) return data;
      }
    } catch (e) {
      console.warn('Backend popular request unreachable; serving local catalog:', e);
    }
    return { results: getLocalPopular(page), page };
  },

  async getGenres() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/movies/genres`, {}, 4000);
      if (res.ok) {
        const data = await res.json();
        if (data.genres && data.genres.length > 0) return data;
      }
    } catch (e) {
      console.warn('Backend genres request unreachable; serving local catalog:', e);
    }
    return { genres: getLocalGenres() };
  },

  async searchMovies(query, page = 1) {
    if (!query?.trim()) return { results: [] };
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/movies/search?q=${encodeURIComponent(query)}&page=${page}`, {}, 4000);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend search unreachable; searching local catalog:', e);
    }
    const q = query.toLowerCase();
    const matched = localMovies.filter(m => {
      const title = (m.title || '').toLowerCase();
      const dir = (m.director || '').toLowerCase();
      const cast = (m.cast || []).join(' ').toLowerCase();
      const genres = (m.genres || []).join(' ').toLowerCase();
      return title.includes(q) || dir.includes(q) || cast.includes(q) || genres.includes(q);
    });
    return { results: matched.slice(0, 20), query, page };
  },

  async discoverMovies(params) {
    try {
      const q = new URLSearchParams();
      if (params.genre && params.genre !== 'All') q.append('genre', params.genre);
      if (params.min_rating) q.append('min_rating', params.min_rating);
      if (params.year) q.append('year', params.year);
      if (params.sort_by) q.append('sort_by', params.sort_by);
      q.append('page', params.page || 1);

      const res = await fetchWithTimeout(`${API_BASE_URL}/movies/discover?${q.toString()}`, {}, 4000);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend discover unreachable; filtering local catalog:', e);
    }
    return filterLocalMovies(params);
  },

  async getMovieDetails(id) {
    const numId = parseInt(id);
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/movies/${numId}`, {}, 4000);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Backend details unreachable for movie ${numId}; using local item:`, e);
    }
    const movie = localMovies.find(m => m.id === numId);
    if (movie) {
      const similar = getLocalClientRecommendations([numId], 8);
      return { ...movie, similar };
    }
    throw new Error('Movie not found');
  },

  async getSimilarMovies(id, limit = 10) {
    const numId = parseInt(id);
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/movies/${numId}/similar?limit=${limit}`, {}, 4000);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Backend similar unreachable for movie ${numId}; calculating client-side:`, e);
    }
    return { results: getLocalClientRecommendations([numId], limit), source: 'local-content-filter' };
  },

  // Machine Learning Recommender
  async getCandidates(limit = 60) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/recommendations/candidates?limit=${limit}`, {}, 4000);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend candidates unreachable; serving local candidates:', e);
    }
    return { total: localMovies.length, candidates: localMovies.slice(0, limit) };
  },

  async getRecommendations(favoriteIds, topN = 10) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite_ids: favoriteIds, top_n: topN })
      }, 5000);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend recommendation service unreachable; calculating client-side:', e);
    }
    return {
      count: topN,
      recommendations: getLocalClientRecommendations(favoriteIds, topN),
      algorithm: 'Client-Side Content-Based Feature Profiling'
    };
  },

  async getHealth() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/health`, {}, 3000);
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    return { status: 'client-mode', total_movies_indexed: localMovies.length };
  }
};

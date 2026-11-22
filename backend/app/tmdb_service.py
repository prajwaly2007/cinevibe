"""
TMDB API Integration Service for CineVibe
Provides live TMDB data fetching with robust local dataset fallback when API key is missing or offline.
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
import httpx
from .config import settings

logger = logging.getLogger("cinevibe.tmdb")

# Genre ID mapping from TMDB
GENRE_MAP = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
}

class TMDBService:
    def __init__(self):
        self.api_key = settings.TMDB_API_KEY.strip()
        self.base_url = settings.TMDB_BASE_URL
        self.local_movies: List[Dict[str, Any]] = []
        self._load_local_dataset()

    def _load_local_dataset(self):
        dataset_path = os.path.join(os.path.dirname(__file__), "data", "movies_dataset.json")
        if os.path.exists(dataset_path):
            try:
                with open(dataset_path, "r", encoding="utf-8") as f:
                    self.local_movies = json.load(f)
                logger.info(f"Loaded {len(self.local_movies)} movies from local catalog.")
            except Exception as e:
                logger.error(f"Failed to load local dataset: {e}")
                self.local_movies = []

    def has_api_key(self) -> bool:
        return bool(self.api_key and self.api_key != "your_api_key_here")

    def _format_tmdb_movie(self, movie: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes a raw TMDB movie item into CineVibe schema."""
        genres = []
        if "genres" in movie:
            genres = [g["name"] for g in movie["genres"] if isinstance(g, dict) and "name" in g]
        elif "genre_ids" in movie:
            genres = [GENRE_MAP[gid] for gid in movie["genre_ids"] if gid in GENRE_MAP]

        return {
            "id": movie.get("id"),
            "title": movie.get("title") or movie.get("original_title", "Unknown"),
            "release_date": movie.get("release_date", ""),
            "vote_average": round(float(movie.get("vote_average", 0.0)), 1),
            "vote_count": movie.get("vote_count", 0),
            "runtime": movie.get("runtime", 0),
            "genres": genres,
            "overview": movie.get("overview", ""),
            "poster_path": movie.get("poster_path", ""),
            "backdrop_path": movie.get("backdrop_path", ""),
            "director": movie.get("director", ""),
            "cast": movie.get("cast", []),
            "keywords": movie.get("keywords", [])
        }

    async def get_trending(self, page: int = 1) -> List[Dict[str, Any]]:
        """Retrieves trending movies."""
        if self.has_api_key():
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(
                        f"{self.base_url}/trending/movie/week",
                        params={"api_key": self.api_key, "page": page}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return [self._format_tmdb_movie(m) for m in data.get("results", [])]
            except Exception as e:
                logger.warning(f"TMDB trending request failed ({e}); falling back to local dataset.")

        # Local fallback
        # Sort local movies by vote_count / vote_average
        sorted_local = sorted(
            self.local_movies,
            key=lambda m: (m.get("vote_count", 0) * m.get("vote_average", 0)),
            reverse=True
        )
        start = (page - 1) * 20
        return sorted_local[start:start + 20]

    async def get_popular(self, page: int = 1) -> List[Dict[str, Any]]:
        """Retrieves popular movies."""
        if self.has_api_key():
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(
                        f"{self.base_url}/movie/popular",
                        params={"api_key": self.api_key, "page": page}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return [self._format_tmdb_movie(m) for m in data.get("results", [])]
            except Exception as e:
                logger.warning(f"TMDB popular request failed ({e}); falling back to local dataset.")

        sorted_local = sorted(
            self.local_movies,
            key=lambda m: (m.get("vote_average", 0), m.get("vote_count", 0)),
            reverse=True
        )
        start = (page - 1) * 20
        return sorted_local[start:start + 20]

    async def search_movies(self, query: str, page: int = 1) -> List[Dict[str, Any]]:
        """Searches movies by title, director, or genre."""
        q = query.strip().lower()
        if not q:
            return []

        if self.has_api_key():
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(
                        f"{self.base_url}/search/movie",
                        params={"api_key": self.api_key, "query": query, "page": page}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return [self._format_tmdb_movie(m) for m in data.get("results", [])]
            except Exception as e:
                logger.warning(f"TMDB search failed ({e}); searching local dataset.")

        # Local substring match
        matched = []
        for m in self.local_movies:
            title = m.get("title", "").lower()
            director = m.get("director", "").lower()
            genres = [g.lower() for g in m.get("genres", [])]
            cast = [c.lower() for c in m.get("cast", [])]
            overview = m.get("overview", "").lower()

            if (q in title or 
                q in director or 
                any(q in g for g in genres) or 
                any(q in c for c in cast) or
                q in overview):
                matched.append(m)

        start = (page - 1) * 20
        return matched[start:start + 20]

    async def get_movie_details(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """Retrieves comprehensive movie details including cast, director, and videos."""
        if self.has_api_key():
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(
                        f"{self.base_url}/movie/{movie_id}",
                        params={
                            "api_key": self.api_key,
                            "append_to_response": "credits,videos,similar"
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        formatted = self._format_tmdb_movie(data)
                        
                        # Extract director and top cast
                        credits = data.get("credits", {})
                        crew = credits.get("crew", [])
                        director = next((c["name"] for c in crew if c.get("job") == "Director"), "")
                        cast_members = [c["name"] for c in credits.get("cast", [])[:8]]
                        formatted["director"] = director or formatted["director"]
                        formatted["cast"] = cast_members or formatted["cast"]

                        # Extract official YouTube trailer
                        videos = data.get("videos", {}).get("results", [])
                        trailer = next(
                            (v["key"] for v in videos if v.get("site") == "YouTube" and v.get("type") in ["Trailer", "Teaser"]),
                            None
                        )
                        formatted["trailer_key"] = trailer

                        # Extract similar
                        similar_raw = data.get("similar", {}).get("results", [])
                        formatted["similar"] = [self._format_tmdb_movie(s) for s in similar_raw[:8]]

                        return formatted
            except Exception as e:
                logger.warning(f"TMDB details fetch failed for {movie_id} ({e}); checking local dataset.")

        # Local lookup
        movie = next((m for m in self.local_movies if m["id"] == movie_id), None)
        if movie:
            movie_copy = dict(movie)
            movie_copy["trailer_key"] = None
            return movie_copy
        return None

    async def discover_movies(
        self,
        genre: Optional[str] = None,
        min_rating: Optional[float] = None,
        year: Optional[int] = None,
        sort_by: str = "popularity.desc",
        page: int = 1
    ) -> Dict[str, Any]:
        """Discovers movies with multi-criteria filtering."""
        results = list(self.local_movies)

        # Filter by genre
        if genre and genre.lower() != "all":
            results = [m for m in results if any(g.lower() == genre.lower() for g in m.get("genres", []))]

        # Filter by min_rating
        if min_rating is not None and min_rating > 0:
            results = [m for m in results if m.get("vote_average", 0) >= min_rating]

        # Filter by release year
        if year is not None:
            results = [
                m for m in results
                if m.get("release_date") and m["release_date"].startswith(str(year))
            ]

        # Sort
        if sort_by == "vote_average.desc":
            results.sort(key=lambda m: m.get("vote_average", 0), reverse=True)
        elif sort_by == "release_date.desc":
            results.sort(key=lambda m: m.get("release_date", ""), reverse=True)
        elif sort_by == "title.asc":
            results.sort(key=lambda m: m.get("title", ""))
        else: # popularity.desc
            results.sort(key=lambda m: (m.get("vote_count", 0) * m.get("vote_average", 0)), reverse=True)

        total_results = len(results)
        page_size = 20
        start = (page - 1) * page_size
        paginated = results[start:start + page_size]

        return {
            "page": page,
            "total_results": total_results,
            "total_pages": (total_results + page_size - 1) // page_size if total_results > 0 else 1,
            "results": paginated
        }

    def get_all_genres(self) -> List[Dict[str, Any]]:
        """Returns list of distinct genres with counts."""
        genre_counts = {}
        for m in self.local_movies:
            for g in m.get("genres", []):
                genre_counts[g] = genre_counts.get(g, 0) + 1
        
        sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
        return [{"name": name, "count": count} for name, count in sorted_genres]

tmdb_service = TMDBService()

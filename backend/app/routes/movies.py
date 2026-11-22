"""
API Routes for Movie discovery, search, genres, and details
"""
from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from ..tmdb_service import tmdb_service
from ..recommender import recommender

router = APIRouter(prefix="/api/movies", tags=["movies"])

@router.get("/trending")
async def get_trending(page: int = Query(1, ge=1)):
    """Fetch weekly trending movies."""
    movies = await tmdb_service.get_trending(page=page)
    return {"results": movies, "page": page}

@router.get("/popular")
async def get_popular(page: int = Query(1, ge=1)):
    """Fetch popular movies."""
    movies = await tmdb_service.get_popular(page=page)
    return {"results": movies, "page": page}

@router.get("/genres")
async def get_genres():
    """Fetch list of all movie genres with movie counts."""
    genres = tmdb_service.get_all_genres()
    return {"genres": genres}

@router.get("/search")
async def search_movies(q: str = Query(..., min_length=1), page: int = Query(1, ge=1)):
    """Search movies by query."""
    movies = await tmdb_service.search_movies(query=q, page=page)
    return {"results": movies, "query": q, "page": page}

@router.get("/discover")
async def discover_movies(
    genre: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None, ge=0, le=10),
    year: Optional[int] = Query(None),
    sort_by: str = Query("popularity.desc"),
    page: int = Query(1, ge=1)
):
    """Discover movies with genre, rating, year filters and sorting."""
    return await tmdb_service.discover_movies(
        genre=genre,
        min_rating=min_rating,
        year=year,
        sort_by=sort_by,
        page=page
    )

@router.get("/{movie_id}")
async def get_movie_details(movie_id: int):
    """Get complete details for a specific movie."""
    movie = await tmdb_service.get_movie_details(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    # If similar not already attached, fetch via ML recommender
    if "similar" not in movie or not movie["similar"]:
        movie["similar"] = recommender.recommend_for_movie(movie_id, top_n=8)
        
    return movie

@router.get("/{movie_id}/similar")
async def get_similar_movies(movie_id: int, limit: int = Query(10, ge=1, le=20)):
    """Get ML-powered content-based similar movies."""
    similar = recommender.recommend_for_movie(movie_id, top_n=limit)
    return {"results": similar, "source": "content-based-filtering"}

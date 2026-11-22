"""
API Routes for Content-Based Movie Recommendations
"""
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from ..recommender import recommender
from ..tmdb_service import tmdb_service

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

class RecommendationRequest(BaseModel):
    favorite_ids: List[int] = Field(..., min_length=1, description="List of TMDB movie IDs")
    top_n: Optional[int] = Field(10, ge=1, le=25, description="Number of recommendations")

@router.post("")
async def get_multi_favorite_recommendations(req: RecommendationRequest):
    """
    Generate personalized recommendations based on multiple user-selected favorite movies.
    Uses TF-IDF feature centroid vectorization and Cosine Similarity.
    """
    if not recommender.is_fitted:
        raise HTTPException(status_code=503, detail="Recommendation engine is not ready.")
    
    results = recommender.recommend_for_user_favorites(
        favorite_movie_ids=req.favorite_ids,
        top_n=req.top_n
    )
    
    # Retrieve details for the selected favorite movies for context
    favorites_details = []
    for mid in req.favorite_ids:
        m = next((item for item in tmdb_service.local_movies if item["id"] == mid), None)
        if m:
            favorites_details.append({
                "id": m["id"],
                "title": m["title"],
                "poster_path": m.get("poster_path", ""),
                "genres": m.get("genres", [])
            })
            
    return {
        "favorites": favorites_details,
        "count": len(results),
        "recommendations": results,
        "algorithm": "TF-IDF Vectorization & Cosine Similarity (Centroid User Profile)"
    }

@router.get("/candidates")
async def get_recommendation_candidates(limit: int = Query(60, ge=10, le=100)):
    """
    Returns high-profile candidate movies for the user to select their favorites.
    """
    candidates = tmdb_service.local_movies[:limit]
    return {
        "total": len(candidates),
        "candidates": [
            {
                "id": m["id"],
                "title": m["title"],
                "release_date": m.get("release_date", ""),
                "vote_average": m.get("vote_average", 0.0),
                "poster_path": m.get("poster_path", ""),
                "backdrop_path": m.get("backdrop_path", ""),
                "genres": m.get("genres", []),
                "director": m.get("director", "")
            }
            for m in candidates
        ]
    }

@router.get("/movie/{movie_id}")
async def get_single_movie_recommendations(movie_id: int, top_n: int = Query(10, ge=1, le=20)):
    """
    Get top recommendations based on a single selected movie.
    """
    results = recommender.recommend_for_movie(movie_id, top_n=top_n)
    return {
        "movie_id": movie_id,
        "recommendations": results,
        "algorithm": "Content-Based Filtering"
    }

"""
CineVibe FastAPI Application Entrypoint
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes import movies, recommendations
from .tmdb_service import tmdb_service
from .recommender import recommender

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("cinevibe.app")

app = FastAPI(
    title="CineVibe API",
    description="AI-Powered Movie Discovery & Recommendation Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(movies.router)
app.include_router(recommendations.router)

@app.get("/")
async def root():
    return {
        "name": "CineVibe API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "has_tmdb_key": tmdb_service.has_api_key(),
        "catalog_size": len(tmdb_service.local_movies),
        "recommender_ready": recommender.is_fitted
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "recommender_status": "ready" if recommender.is_fitted else "initializing",
        "total_movies_indexed": len(recommender.df) if recommender.is_fitted else 0,
        "tmdb_connected": tmdb_service.has_api_key()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

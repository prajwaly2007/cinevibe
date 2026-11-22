"""
CineVibe FastAPI Application Entrypoint
Unified Full-Stack Application: Serves both the ML API and React Frontend
"""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "recommender_status": "ready" if recommender.is_fitted else "initializing",
        "total_movies_indexed": len(recommender.df) if recommender.is_fitted else 0,
        "tmdb_connected": tmdb_service.has_api_key()
    }

# Unified Frontend Static Serving
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

if os.path.exists(frontend_dist) and os.path.isdir(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API and Swagger routes to pass through
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

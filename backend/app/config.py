import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from backend root if present
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

class Settings(BaseModel):
    TMDB_API_KEY: str = os.getenv("TMDB_API_KEY", "")
    PORT: int = int(os.getenv("PORT", "5000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    TMDB_BASE_URL: str = "https://api.themoviedb.org/3"
    TMDB_IMAGE_BASE_URL: str = "https://image.tmdb.org/t/p"

settings = Settings()

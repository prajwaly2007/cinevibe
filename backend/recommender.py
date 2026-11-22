"""
CineVibe Content-Based Recommendation Engine
Utilizes TF-IDF Vectorization and Cosine Similarity to recommend movies based on
genres, overview, keywords, cast, and director metadata.
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger("cinevibe.recommender")
logging.basicConfig(level=logging.INFO)

class ContentBasedRecommender:
    def __init__(self, dataset_path: Optional[str] = None):
        self.dataset_path = dataset_path or os.path.join(
            os.path.dirname(__file__), "app", "data", "movies_dataset.json"
        )
        self.df: pd.DataFrame = pd.DataFrame()
        self.tfidf_matrix = None
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.id_to_idx: Dict[int, int] = {}
        self.idx_to_id: Dict[int, int] = {}
        self.is_fitted: bool = False
        self.initialize()

    def initialize(self):
        """Loads dataset and builds TF-IDF similarity matrix."""
        try:
            self._load_dataset()
            self._build_model()
            self.is_fitted = True
            logger.info(f"Recommender successfully initialized with {len(self.df)} movies.")
        except Exception as e:
            logger.error(f"Error initializing recommender: {e}")
            self.is_fitted = False

    def _load_dataset(self):
        """Loads movies from json or fallback."""
        if os.path.exists(self.dataset_path):
            with open(self.dataset_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.df = pd.DataFrame(data)
        else:
            raise FileNotFoundError(f"Movie dataset not found at {self.dataset_path}")

        # Ensure required columns exist
        required_cols = ["id", "title", "overview", "genres", "keywords", "cast", "director"]
        for col in required_cols:
            if col not in self.df.columns:
                self.df[col] = ""

        # Normalize and fill NAs
        self.df["overview"] = self.df["overview"].fillna("")
        self.df["director"] = self.df["director"].fillna("")
        self.df["genres"] = self.df["genres"].apply(lambda x: x if isinstance(x, list) else [])
        self.df["keywords"] = self.df["keywords"].apply(lambda x: x if isinstance(x, list) else [])
        self.df["cast"] = self.df["cast"].apply(lambda x: x if isinstance(x, list) else [])

        # Create quick lookups
        self.id_to_idx = {int(row["id"]): idx for idx, row in self.df.iterrows()}
        self.idx_to_id = {idx: int(row["id"]) for idx, row in self.df.iterrows()}

    def _create_metadata_soup(self, row) -> str:
        """
        Combines director, genres, top cast, keywords, and overview
        into a weighted textual representation.
        We amplify director and genres to give appropriate artistic relevance.
        """
        # Director (repeated twice for weighted influence)
        director = [str(row["director"]).replace(" ", "").lower()] * 2 if row["director"] else []
        
        # Genres (repeated twice for category emphasis)
        genres = [str(g).replace(" ", "").lower() for g in row["genres"]] * 2
        
        # Top 3 Cast members
        cast = [str(c).replace(" ", "").lower() for c in (row["cast"][:3] if isinstance(row["cast"], list) else [])]
        
        # Keywords
        keywords = [str(k).replace(" ", "").lower() for k in (row["keywords"] if isinstance(row["keywords"], list) else [])]
        
        # Overview as natural language tokens
        overview = str(row["overview"]).lower()
        
        soup = f"{' '.join(director)} {' '.join(genres)} {' '.join(cast)} {' '.join(keywords)} {overview}"
        return soup.strip()

    def _build_model(self):
        """Computes TF-IDF vectors for all movies in the catalog."""
        self.df["soup"] = self.df.apply(self._create_metadata_soup, axis=1)

        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=8000,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df["soup"])

    def add_or_update_movies(self, new_movies: List[Dict[str, Any]]):
        """Enriches dataset dynamically with TMDB movies and refits."""
        if not new_movies:
            return
        
        existing_ids = set(self.df["id"].values)
        fresh_movies = [m for m in new_movies if m.get("id") not in existing_ids]
        
        if fresh_movies:
            new_df = pd.DataFrame(fresh_movies)
            self.df = pd.concat([self.df, new_df], ignore_index=True)
            self.id_to_idx = {int(row["id"]): idx for idx, row in self.df.iterrows()}
            self.idx_to_id = {idx: int(row["id"]) for idx, row in self.df.iterrows()}
            self._build_model()
            logger.info(f"Recommender updated with {len(fresh_movies)} new TMDB movies.")

    def _generate_explanation(self, target_row, reference_rows: List[Any]) -> Dict[str, Any]:
        """
        Generates human-readable explanation why a movie is recommended based on
        common genres, director, cast members, and keywords.
        """
        shared_genres = set(target_row["genres"])
        shared_keywords = set(target_row.get("keywords", []))
        shared_cast = set(target_row.get("cast", [])[:4])
        shared_directors = set([target_row.get("director")]) if target_row.get("director") else set()

        ref_genres = set()
        ref_keywords = set()
        ref_cast = set()
        ref_directors = set()

        for ref in reference_rows:
            ref_genres.update(ref.get("genres", []))
            ref_keywords.update(ref.get("keywords", []))
            ref_cast.update(ref.get("cast", [])[:4])
            if ref.get("director"):
                ref_directors.add(ref.get("director"))

        overlap_genres = list(shared_genres.intersection(ref_genres))
        overlap_keywords = list(shared_keywords.intersection(ref_keywords))
        overlap_cast = list(shared_cast.intersection(ref_cast))
        overlap_directors = list(shared_directors.intersection(ref_directors))

        reasons = []
        if overlap_directors:
            reasons.append(f"Directed by {', '.join(overlap_directors)}")
        if overlap_cast:
            reasons.append(f"Starring {', '.join(overlap_cast[:2])}")
        if overlap_genres:
            reasons.append(f"Shared genres ({', '.join(overlap_genres[:2])})")
        if overlap_keywords:
            reasons.append(f"Similar themes: {', '.join(overlap_keywords[:3])}")

        if not reasons:
            reasons.append("Matches narrative style and thematic atmosphere")

        return {
            "reasons": reasons,
            "highlight": reasons[0] if reasons else "High cinematic similarity",
            "matched_genres": overlap_genres,
            "matched_themes": overlap_keywords[:3]
        }

    def recommend_for_movie(self, movie_id: int, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Returns top N content-based recommendations for a single movie.
        """
        if not self.is_fitted or movie_id not in self.id_to_idx:
            logger.warning(f"Movie ID {movie_id} not found in recommender catalog.")
            return []

        idx = self.id_to_idx[movie_id]
        movie_vector = self.tfidf_matrix[idx]
        target_row = self.df.iloc[idx].to_dict()

        # Compute cosine similarity against all movies
        similarities = cosine_similarity(movie_vector, self.tfidf_matrix).flatten()

        # Sort indices by similarity descending
        related_indices = similarities.argsort()[::-1]

        recommendations = []
        for i in related_indices:
            if i == idx:
                continue  # Skip original movie
            
            score = float(similarities[i])
            # Intuitive calibration for TF-IDF cosine distance in text retrieval
            calibrated_pct = round(min(98.8, max(52.0, 55.0 + (score * 95.0))), 1)
            
            rec_row = self.df.iloc[i].to_dict()
            explanation = self._generate_explanation(rec_row, [target_row])

            rec_movie = {
                "id": int(rec_row["id"]),
                "title": rec_row["title"],
                "release_date": rec_row.get("release_date", ""),
                "vote_average": rec_row.get("vote_average", 0.0),
                "vote_count": rec_row.get("vote_count", 0),
                "runtime": rec_row.get("runtime", 0),
                "genres": rec_row.get("genres", []),
                "overview": rec_row.get("overview", ""),
                "poster_path": rec_row.get("poster_path", ""),
                "backdrop_path": rec_row.get("backdrop_path", ""),
                "director": rec_row.get("director", ""),
                "cast": rec_row.get("cast", []),
                "similarity_score": round(score, 4),
                "similarity_percentage": calibrated_pct,
                "explanation": explanation
            }
            recommendations.append(rec_movie)
            if len(recommendations) >= top_n:
                break

        return recommendations

    def recommend_for_user_favorites(
        self, favorite_movie_ids: List[int], top_n: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Generates personalized recommendations based on multiple user-selected favorites.
        Computes a unified user profile vector from the centroid of favorite TF-IDF vectors,
        then scores the candidate catalog.
        """
        if not self.is_fitted or not favorite_movie_ids:
            return []

        # Find valid indices for favorites
        valid_indices = [
            self.id_to_idx[mid] for mid in favorite_movie_ids if mid in self.id_to_idx
        ]

        if not valid_indices:
            logger.warning("None of the requested favorite movie IDs were in catalog.")
            return []

        # Reference rows for explanation
        favorite_rows = [self.df.iloc[i].to_dict() for i in valid_indices]

        # Calculate centroid/mean vector of selected movies
        favorite_vectors = self.tfidf_matrix[valid_indices]
        user_profile_vector = np.asarray(favorite_vectors.mean(axis=0))

        # Compute cosine similarity between user profile and all movies
        similarities = cosine_similarity(user_profile_vector, self.tfidf_matrix).flatten()

        # Sort indices descending
        related_indices = similarities.argsort()[::-1]

        recommendations = []
        excluded_ids = set(favorite_movie_ids)

        for i in related_indices:
            movie_id = int(self.df.iloc[i]["id"])
            if movie_id in excluded_ids:
                continue  # Never recommend the movies the user already selected

            score = float(similarities[i])
            # Calibrate similarity percentage for intuitive human display (60% - 98.5%)
            calibrated_pct = round(min(98.8, max(52.0, 55.0 + (score * 95.0))), 1)

            rec_row = self.df.iloc[i].to_dict()
            explanation = self._generate_explanation(rec_row, favorite_rows)

            rec_movie = {
                "id": movie_id,
                "title": rec_row["title"],
                "release_date": rec_row.get("release_date", ""),
                "vote_average": rec_row.get("vote_average", 0.0),
                "vote_count": rec_row.get("vote_count", 0),
                "runtime": rec_row.get("runtime", 0),
                "genres": rec_row.get("genres", []),
                "overview": rec_row.get("overview", ""),
                "poster_path": rec_row.get("poster_path", ""),
                "backdrop_path": rec_row.get("backdrop_path", ""),
                "director": rec_row.get("director", ""),
                "cast": rec_row.get("cast", []),
                "similarity_score": round(score, 4),
                "similarity_percentage": calibrated_pct,
                "explanation": explanation
            }
            recommendations.append(rec_movie)
            if len(recommendations) >= top_n:
                break

        return recommendations

# Global recommender instance
recommender = ContentBasedRecommender()

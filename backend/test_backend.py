"""
Comprehensive Test Script for CineVibe Backend and ML Recommender
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from recommender import recommender

def run_tests():
    print("=== Testing CineVibe Backend & Machine Learning Engine ===")
    
    # 1. Test Recommender Engine Directly
    print("\n[1] Testing ML Recommender Engine...")
    assert recommender.is_fitted, "Recommender should be fitted!"
    print(f"✓ Recommender is fitted with {len(recommender.df)} movies.")
    
    # Test single movie recommendation (Inception: 27205)
    single_recs = recommender.recommend_for_movie(27205, top_n=5)
    assert len(single_recs) == 5, f"Expected 5 recommendations, got {len(single_recs)}"
    print(f"✓ Inception recommendations (Top 1: {single_recs[0]['title']} - {single_recs[0]['similarity_percentage']}% match)")
    assert single_recs[0]['id'] != 27205, "Recommender should not recommend the input movie itself!"
    
    # Test multi-movie recommendation (Inception + Interstellar)
    multi_recs = recommender.recommend_for_user_favorites([27205, 157336], top_n=5)
    assert len(multi_recs) == 5, f"Expected 5 recommendations, got {len(multi_recs)}"
    print(f"✓ Multi-movie centroid recommendations (Top 1: {multi_recs[0]['title']} - {multi_recs[0]['similarity_percentage']}% match)")
    print(f"  Explanation: {multi_recs[0]['explanation']['highlight']}")
    assert all(m['id'] not in [27205, 157336] for m in multi_recs), "Should exclude selected favorites!"

    # 2. Test FastAPI Endpoints via TestClient
    print("\n[2] Testing FastAPI Endpoints...")
    client = TestClient(app)

    # Root
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.status_code}"
    print(f"✓ Root endpoint online: {res.json()['name']}")

    # Health
    res = client.get("/api/health")
    assert res.status_code == 200
    print(f"✓ Health endpoint: {res.json()}")

    # Trending
    res = client.get("/api/movies/trending")
    assert res.status_code == 200
    trending = res.json()["results"]
    assert len(trending) > 0
    print(f"✓ Trending movies endpoint: returned {len(trending)} titles")

    # Popular
    res = client.get("/api/movies/popular")
    assert res.status_code == 200
    popular = res.json()["results"]
    assert len(popular) > 0
    print(f"✓ Popular movies endpoint: returned {len(popular)} titles")

    # Genres
    res = client.get("/api/movies/genres")
    assert res.status_code == 200
    genres = res.json()["genres"]
    assert len(genres) > 0
    print(f"✓ Genres endpoint: returned {len(genres)} distinct genres")

    # Search
    res = client.get("/api/movies/search?q=nolan")
    assert res.status_code == 200
    search_results = res.json()["results"]
    assert len(search_results) > 0
    print(f"✓ Search endpoint for 'nolan': found {len(search_results)} titles")

    # Movie Details
    res = client.get("/api/movies/27205")
    assert res.status_code == 200
    movie = res.json()
    assert movie["title"] == "Inception"
    print(f"✓ Movie Details endpoint: retrieved '{movie['title']}' with director '{movie.get('director')}'")

    # Post Recommendations API
    res = client.post("/api/recommendations", json={"favorite_ids": [27205, 157336], "top_n": 5})
    assert res.status_code == 200
    rec_data = res.json()
    assert len(rec_data["recommendations"]) == 5
    print(f"✓ POST /api/recommendations endpoint: {len(rec_data['recommendations'])} recommendations generated")

    print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()

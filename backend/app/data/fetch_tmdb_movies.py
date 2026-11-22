"""
Fetches 200+ authentic movies directly from TMDB with verified poster paths,
backdrops, directors, cast, genres, and keywords.
"""
import os
import json
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = "4e44d9029b1270a757cddc766a1bcb63"
BASE_URL = "https://api.themoviedb.org/3"

def fetch_movie_list():
    """Fetches top-rated, popular, and discover movie IDs from TMDB."""
    movie_ids = set()
    pages_to_fetch = [
        ("top_rated", 1), ("top_rated", 2), ("top_rated", 3), ("top_rated", 4),
        ("top_rated", 5), ("top_rated", 6), ("top_rated", 7), ("top_rated", 8),
        ("popular", 1), ("popular", 2), ("popular", 3), ("popular", 4),
        ("popular", 5), ("popular", 6), ("popular", 7), ("popular", 8)
    ]
    
    for category, page in pages_to_fetch:
        url = f"{BASE_URL}/movie/{category}?api_key={API_KEY}&page={page}&language=en-US"
        try:
            r = requests.get(url, timeout=6)
            if r.status_code == 200:
                data = r.json()
                for item in data.get("results", []):
                    if item.get("poster_path") and item.get("vote_count", 0) > 300:
                        movie_ids.add(item["id"])
        except Exception as e:
            pass
            
    print(f"Collected {len(movie_ids)} unique candidate movie IDs from TMDB.")
    return list(movie_ids)

def fetch_movie_details(movie_id):
    """Fetches complete details, credits, and keywords for a single movie."""
    url = f"{BASE_URL}/movie/{movie_id}?api_key={API_KEY}&append_to_response=credits,keywords,videos&language=en-US"
    try:
        r = requests.get(url, timeout=6)
        if r.status_code != 200:
            return None
        data = r.json()
        
        poster = data.get("poster_path")
        if not poster:
            return None
            
        crew = data.get("credits", {}).get("crew", [])
        director = next((c["name"] for c in crew if c.get("job") == "Director"), "")
        cast = [c["name"] for c in data.get("credits", {}).get("cast", [])[:6]]
        
        # Keywords
        raw_keywords = data.get("keywords", {}).get("keywords", [])
        keywords = [k["name"] for k in raw_keywords[:8]]
        
        # Genres
        genres = [g["name"] for g in data.get("genres", [])]

        # Trailer
        videos = data.get("videos", {}).get("results", [])
        trailer = next(
            (v["key"] for v in videos if v.get("site") == "YouTube" and v.get("type") in ["Trailer", "Teaser"]),
            None
        )
        
        return {
            "id": data["id"],
            "title": data.get("title", ""),
            "release_date": data.get("release_date", ""),
            "vote_average": round(float(data.get("vote_average", 0.0)), 1),
            "vote_count": data.get("vote_count", 0),
            "runtime": data.get("runtime", 0),
            "genres": genres,
            "overview": data.get("overview", ""),
            "poster_path": poster,
            "backdrop_path": data.get("backdrop_path") or poster,
            "director": director,
            "cast": cast,
            "keywords": keywords,
            "trailer_key": trailer
        }
    except Exception as e:
        return None

def main():
    candidate_ids = fetch_movie_list()
    results = []
    
    print("Fetching detailed metadata & verified posters in parallel...")
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(fetch_movie_details, mid): mid for mid in candidate_ids}
        for future in as_completed(futures):
            movie = future.result()
            if movie and movie.get("title") and movie.get("poster_path"):
                results.append(movie)
                
    # Sort by vote count * vote average
    results.sort(key=lambda m: (m.get("vote_average", 0) * m.get("vote_count", 0)), reverse=True)
    
    # Save to json
    target_file = os.path.join(os.path.dirname(__file__), "movies_dataset.json")
    with open(target_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully saved {len(results)} verified TMDB movies with real posters to {target_file}")

if __name__ == "__main__":
    main()

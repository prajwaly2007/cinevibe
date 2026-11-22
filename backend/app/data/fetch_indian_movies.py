"""
Script to fetch high-rated and iconic Indian movies from TMDB API
and merge them into CineVibe's dataset.
"""
import os
import json
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = "4e44d9029b1270a757cddc766a1bcb63"
BASE_URL = "https://api.themoviedb.org/3"

# Curated list of iconic Indian cinema titles to ensure complete representation
ICONIC_TITLES = [
    # Hindi / Bollywood
    "3 Idiots", "Dangal", "Dilwale Dulhania Le Jayenge", "Like Stars on Earth", "Sholay",
    "Lagaan: Once Upon a Time in India", "Swades", "Andhadhun", "Tumbbad", "Gangs of Wasseypur",
    "Zindagi Na Milegi Dobara", "Bajrangi Bhaijaan", "PK", "Barfi!", "Chak De! India",
    "Munna Bhai M.B.B.S.", "Queen", "12th Fail", "Jawan", "Pathaan", "Stree", "Stree 2",
    "Om Shanti Om", "Jab We Met", "Kal Ho Naa Ho", "Hera Pheri", "Phir Hera Pheri",
    "Yeh Jawaani Hai Deewani", "Rockstar", "Haider", "Article 15", "Sardar Udham",
    "Super 30", "Chhichhore", "Dil Chahta Hai", "My Name Is Khan", "Devdas",
    "Kabhi Khushi Kabhie Gham", "Padman", "Newton", "Animal",
    
    # Telugu / Tollywood
    "RRR", "Baahubali: The Beginning", "Baahubali 2: The Conclusion", "Kalki 2898 AD",
    "Pushpa: The Rise", "Salaar: Part 1 - Ceasefire", "Eega", "Sita Ramam", "Jersey",
    "Arjun Reddy", "Rangasthalam", "Mahanati", "Mayabazar", "C/o Kancharapalem",
    
    # Tamil / Kollywood
    "Maharaja", "Jai Bhim", "Vikram", "Kaithi", "Leo", "Jailer",
    "Ponniyin Selvan: Part I", "Super Deluxe", "Asuran", "96",
    "Soorarai Pottru", "Enthiran", "Nayakan", "Anbe Sivam", "Vada Chennai",
    "Thani Oruvan", "Master",
    
    # Malayalam / Mollywood
    "Manjummel Boys", "Aavesham", "Drishyam", "Drishyam 2", "Minnal Murali",
    "Premam", "Kumbalangi Nights", "Lucifer", "The Great Indian Kitchen",
    "Bangalore Days", "Bramayugam", "2018",
    
    # Kannada / Sandalwood
    "K.G.F: Chapter 1", "K.G.F: Chapter 2", "Kantara", "777 Charlie",
    "Lucia", "Ulidavaru Kandanthe"
]

def search_movie(title):
    """Searches TMDB for a movie title and returns candidate ID."""
    url = f"{BASE_URL}/search/movie?api_key={API_KEY}&query={requests.utils.quote(title)}&language=en-US"
    try:
        r = requests.get(url, timeout=6)
        if r.status_code == 200:
            results = r.json().get("results", [])
            for res in results:
                # Prefer Indian origin languages or high vote count
                lang = res.get("original_language", "")
                if lang in ["hi", "te", "ta", "ml", "kn", "bn", "mr", "pa"] or res.get("vote_count", 0) > 30:
                    if res.get("poster_path"):
                        return res["id"]
            if results and results[0].get("poster_path"):
                return results[0]["id"]
    except Exception as e:
        print(f"Error searching {title}: {e}")
    return None

def fetch_top_by_languages():
    """Discovers top Indian movies across main Indian languages."""
    movie_ids = set()
    langs = ["hi", "te", "ta", "ml", "kn"]
    for lang in langs:
        for page in [1, 2, 3]:
            url = f"{BASE_URL}/discover/movie?api_key={API_KEY}&with_original_language={lang}&sort_by=vote_count.desc&page={page}"
            try:
                r = requests.get(url, timeout=6)
                if r.status_code == 200:
                    for item in r.json().get("results", []):
                        if item.get("poster_path") and item.get("vote_count", 0) >= 20:
                            movie_ids.add(item["id"])
            except Exception as e:
                pass
                
        # Also by popularity
        for page in [1, 2]:
            url = f"{BASE_URL}/discover/movie?api_key={API_KEY}&with_original_language={lang}&sort_by=popularity.desc&page={page}"
            try:
                r = requests.get(url, timeout=6)
                if r.status_code == 200:
                    for item in r.json().get("results", []):
                        if item.get("poster_path") and item.get("vote_count", 0) >= 20:
                            movie_ids.add(item["id"])
            except Exception as e:
                pass
                
    return movie_ids

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
        if "indian cinema" not in [k.lower() for k in keywords]:
            keywords.append("indian cinema")
        
        # Genres: Keep existing genres and append "Indian Cinema"
        genres = [g["name"] for g in data.get("genres", [])]
        if "Indian Cinema" not in genres:
            genres.append("Indian Cinema")

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
    print("Collecting Indian movie IDs...")
    all_ids = fetch_top_by_languages()
    print(f"Collected {len(all_ids)} IDs from language discovery.")
    
    print("Searching curated iconic Indian titles...")
    for title in ICONIC_TITLES:
        mid = search_movie(title)
        if mid:
            all_ids.add(mid)
            
    print(f"Total candidate Indian movie IDs: {len(all_ids)}")
    
    detailed_movies = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_movie_details, mid): mid for mid in all_ids}
        for future in as_completed(futures):
            res = future.result()
            if res and res.get("title") and res.get("poster_path"):
                detailed_movies.append(res)
                
    print(f"Successfully fetched details for {len(detailed_movies)} Indian movies.")
    
    # Load current dataset
    current_dataset_path = os.path.join(os.path.dirname(__file__), "movies_dataset.json")
    with open(current_dataset_path, "r", encoding="utf-8") as f:
        existing_movies = json.load(f)
        
    existing_ids = {m["id"] for m in existing_movies}
    added_count = 0
    updated_count = 0
    
    # Merge
    merged_movies = list(existing_movies)
    for m in detailed_movies:
        if m["id"] in existing_ids:
            # Update existing with "Indian Cinema" genre if not already there
            for idx, ex in enumerate(merged_movies):
                if ex["id"] == m["id"]:
                    if "Indian Cinema" not in ex.get("genres", []):
                        ex["genres"].append("Indian Cinema")
                    updated_count += 1
                    break
        else:
            merged_movies.append(m)
            existing_ids.add(m["id"])
            added_count += 1
            
    print(f"Added {added_count} new Indian movies, updated {updated_count} existing movies.")
    print(f"New total catalog size: {len(merged_movies)}")
    
    # Save to backend dataset
    with open(current_dataset_path, "w", encoding="utf-8") as f:
        json.dump(merged_movies, f, indent=2, ensure_ascii=False)
        
    # Save to frontend dataset
    frontend_dataset_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
        "frontend", "src", "data", "movies.json"
    )
    with open(frontend_dataset_path, "w", encoding="utf-8") as f:
        json.dump(merged_movies, f, indent=2, ensure_ascii=False)
        
    print(f"Datasets written successfully to backend and frontend!")

if __name__ == "__main__":
    main()

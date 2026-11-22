# CineVibe — AI-Powered Movie Recommendation System

> **A modern, full-stack cinematic discovery and recommendation web application powered by Machine Learning (TF-IDF vectorization & Cosine Similarity), FastAPI, React, and TMDB integration.**

Inspired by the dark, high-end aesthetics of **Netflix** and **Letterboxd**, CineVibe delivers personalized movie recommendations using real content-based filtering rather than random carousels.

---

## 🌟 Key Features

- **🎬 Real Machine Learning Recommendation Engine (`backend/recommender.py`)**:
  - Content-based filtering built with **Scikit-learn**, **Pandas**, and **NumPy**.
  - Weighted metadata soup combining movie overview, genres, director, top cast, and keywords.
  - TF-IDF vectorization with n-gram range `(1, 2)` and sublinear term frequency.
  - Multi-movie user profile representation: calculates the centroid feature vector across multiple selected favorites.
  - Explainable recommendations: reveals *why* a movie was matched (shared director, cast members, common genres, and thematic keywords) alongside calibrated similarity percentages.

- **🔥 Home Page**:
  - Hero spotlight featuring high-definition cinematic backdrops with radial atmospheric darkening.
  - Trending This Week & All-Time Popular rows with smooth horizontal scrolling.
  - "Recommended for You" AI section tailored to watchlist seeds or director signatures.
  - Interactive "Browse by Genre" matrix with dynamic title counts.

- **🔍 Discover Page**:
  - Multi-criteria filtering engine: filter simultaneously by search query, genre chips, minimum rating (e.g., `8.0+ Masterpieces`), and release year.
  - Dynamic sorting by popularity, highest rating, release date, and alphabetical title.
  - Real-time active filter chips and one-click reset.

- **📖 Movie Details Page**:
  - Immersive backdrop hero with high-resolution poster display.
  - Complete synopsis, runtime, release date, director, and key cast members.
  - YouTube trailer modal integration.
  - Content-based "Similar Movies" section ranked by TF-IDF cosine distance.
  - Instant "Find Similar Vibes" one-click button to seed the AI Recommender.

- **💾 Persistent Watchlist Page**:
  - Built with browser LocalStorage for automatic persistence across page reloads.
  - Quick-search inside saved titles and sort by date added, rating, or title.
  - "Generate AI Matches from Watchlist" shortcut to discover new films matching your library.

- **✨ Dedicated AI Vibe Match (Recommendation Page)**:
  - Interactive selection of up to 5 favorite seed movies from a rich candidate catalog.
  - Pre-curated presets: *Nolan Mind-Benders*, *Sci-Fi Masters*, *Dark Neo-Noir*, and *My Watchlist*.
  - Real-time vector calculation returning top 10 personalized recommendations with similarity percentages and explainability badges.

- **📡 Resilient TMDB Integration**:
  - Connects to TMDB API v3 when an API key is provided in `backend/.env`.
  - Includes a curated offline fallback dataset of 83 critically acclaimed movies across all genres with authentic TMDB IDs, high-resolution posters, and backdrops—ensuring the application works out-of-the-box without requiring an API key.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v6, Lucide React Icons |
| **Backend** | Python 3.14+, FastAPI, Uvicorn, Pydantic, HTTPX, python-dotenv |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, TF-IDF Vectorizer, Cosine Similarity |
| **Movie Database** | The Movie Database (TMDB) API + Curated Local Fallback Dataset |
| **Storage** | Browser Local Storage (Watchlist & Preferences) |

---

## 🎨 Color Palette & Design System

- **Main Background**: `#08090D` (Deep cinematic void)
- **Secondary Background**: `#111319` (Glass card surface)
- **Card Background**: `#191C24` (Elevated movie card surface)
- **Card Hover**: `#222631` (Highlighted border & shadow)
- **Accent Red**: `#E50935` (CineVibe signature red)
- **Primary Text**: `#FFFFFF` (High contrast pure white)
- **Secondary Text**: `#A1A1AA` (Muted zinc)

---

## 📁 Project Architecture

```
cinevibe/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entrypoint & CORS config
│   │   ├── config.py               # Pydantic environment configuration
│   │   ├── tmdb_service.py         # TMDB API client with offline fallback catalog
│   │   ├── recommender.py          # Module alias
│   │   ├── data/
│   │   │   ├── generate_dataset.py # Script to rebuild movie catalog
│   │   │   └── movies_dataset.json # Curated catalog of 83+ real TMDB movies
│   │   └── routes/
│   │       ├── movies.py           # Trending, popular, discover, search, details
│   │       └── recommendations.py  # Multi-favorite & single-movie ML endpoints
│   ├── recommender.py              # Core Content-Based ML Recommender Engine
│   ├── test_backend.py             # End-to-end unit test suite
│   ├── run_server.py               # Server startup helper
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # TMDB API key example
│   └── .env                        # Local environment configuration
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # Centralized API service & TMDB image URL builder
│   │   ├── context/
│   │   │   └── WatchlistContext.jsx# Persistent LocalStorage Watchlist provider
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Glassmorphic header with search & badges
│   │   │   ├── Footer.jsx          # Footer with TMDB API attribution notice
│   │   │   ├── MovieCard.jsx       # Card with hover zoom, ratings & similarity %
│   │   │   ├── MovieHero.jsx       # Full cinematic hero banner with atmospheric gradients
│   │   │   ├── MovieRow.jsx        # Horizontal smooth scroller with chevron controls
│   │   │   └── TrailerModal.jsx    # YouTube video embed modal
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Home page with hero, trending & AI rows
│   │   │   ├── DiscoverPage.jsx    # Full search, genre pills & rating filters
│   │   │   ├── MovieDetailsPage.jsx# Backdrop, synopsis, cast, director & similar movies
│   │   │   ├── WatchlistPage.jsx   # Saved movies queue with filter & sorting
│   │   │   └── RecommendationPage.jsx # Interactive multi-seed AI Recommendation center
│   │   ├── App.jsx                 # Routing configuration
│   │   ├── main.jsx                # React DOM render
│   │   └── index.css               # Tailwind CSS & custom scrollbar styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── start_all.bat                   # 1-click launcher for both servers
├── start_backend.bat               # 1-click launcher for FastAPI backend
├── start_frontend.bat              # 1-click launcher for Vite frontend
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

### 2. Running with 1-Click Launchers (Windows)
Double-click `start_all.bat` in the root folder, or launch individually:
- `start_backend.bat` -> Starts FastAPI on `http://localhost:8000`
- `start_frontend.bat` -> Starts Vite React on `http://localhost:5173`

---

### 3. Manual Step-by-Step Setup

#### Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Add your TMDB API Key in .env
# TMDB_API_KEY=your_key_here

# Run the test suite to verify ML recommender
python test_backend.py

# Start the FastAPI server
python run_server.py
```
Backend API will be available at: **`http://localhost:8000`**  
Interactive Swagger documentation: **`http://localhost:8000/docs`**

#### Frontend Setup
```bash
cd frontend

# Install npm packages
npm install

# Start the development server
npm run dev
```
Frontend web application will open at: **`http://localhost:5173`**

---

## 🧠 Machine Learning Engine Architecture

The recommendation engine in `backend/recommender.py` works through the following content-based pipeline:

1. **Metadata Soup Construction**:
   For each movie $i$, a composite textual feature $S_i$ is formed:
   $$S_i = \text{Director} \times 2 + \text{Genres} \times 2 + \text{TopCast}_{1..3} + \text{Keywords} + \text{Overview}$$
   Directors and Genres receive double weighting to ensure aesthetic coherence.

2. **TF-IDF Vectorization**:
   The text soup is converted into high-dimensional sparse vectors using Term Frequency-Inverse Document Frequency:
   $$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$
   - Vocabulary: up to 8,000 unigrams and bigrams.
   - English stop-words removed.
   - Sublinear TF scaling enabled to avoid disproportionately weighting repetitive terms.

3. **Multi-Favorite Profile Vector (Centroid)**:
   When a user selects multiple favorite movies $\{m_1, m_2, \dots, m_k\}$, the user's taste representation $\vec{u}$ is calculated as the centroid:
   $$\vec{u} = \frac{1}{k} \sum_{j=1}^k \vec{v}_{m_j}$$

4. **Cosine Similarity Scoring**:
   The candidate catalog is scored against the user profile using cosine distance:
   $$\text{CosineSimilarity}(\vec{u}, \vec{v}_i) = \frac{\vec{u} \cdot \vec{v}_i}{\|\vec{u}\| \|\vec{v}_i\|}$$
   Movies already in the user's favorites are excluded ($i \notin \{m_1, \dots, m_k\}$), and the top $N$ candidates are returned.

5. **Explainability Inference**:
   The engine cross-references overlapping directors, shared cast members, common genres, and thematic keywords between the recommendations and the user's seed selections to generate natural-language rationale (e.g., *"Directed by Christopher Nolan"*, *"Similar themes: space travel, black hole"*).

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status, catalog size, and recommender health |
| `GET` | `/api/health` | Health check and index metadata |
| `GET` | `/api/movies/trending?page=1` | Weekly trending cinema |
| `GET` | `/api/movies/popular?page=1` | Highest rated popular movies |
| `GET` | `/api/movies/genres` | List of all available movie genres with counts |
| `GET` | `/api/movies/search?q={query}` | Search by title, director, cast, or keyword |
| `GET` | `/api/movies/discover` | Multi-criteria discover with filters and sorting |
| `GET` | `/api/movies/{id}` | Detailed movie information, cast, director, trailer |
| `GET` | `/api/movies/{id}/similar` | Content-based similar movies for a single title |
| `GET` | `/api/recommendations/candidates` | Candidate movies for user favorite selector |
| `POST` | `/api/recommendations` | Generate recommendations for multiple favorites |

---

## 📜 TMDB Attribution
This product uses the TMDB API but is not endorsed or certified by TMDB.
Movie data, synopses, posters, backdrops, and credits are provided courtesy of [The Movie Database](https://www.themoviedb.org/).

---

© 2026 CineVibe. Crafted for film lovers, cinephiles, and machine learning enthusiasts.

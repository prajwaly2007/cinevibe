"""
Convenient entrypoint to run the CineVibe FastAPI Backend Server
"""
import sys
import os
import uvicorn

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    print("=" * 60)
    print("Starting CineVibe FastAPI Backend Server on http://localhost:8000")
    print("Interactive Swagger Documentation at http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

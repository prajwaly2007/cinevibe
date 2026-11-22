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
    port = int(os.getenv("PORT", "5000"))
    print("=" * 60)
    print(f"Starting CineVibe FastAPI Backend Server on http://localhost:{port}")
    print(f"Interactive Swagger Documentation at http://localhost:{port}/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

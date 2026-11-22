"""
Alias import for backend.recommender
"""
import sys
import os

# Ensure backend root is in sys.path
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from recommender import ContentBasedRecommender, recommender

__all__ = ["ContentBasedRecommender", "recommender"]

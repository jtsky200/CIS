#!/usr/bin/env python3
"""
Test script for the advanced troubleshooting system
"""
import requests
import json
from pathlib import Path

def test_api_connection():
    """Test if the API is running"""
    try:
        response = requests.get("http://localhost:8081/")
        print("API is running")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"API connection failed: {e}")
        return False

def test_stats():
    """Get database statistics"""
    try:
        response = requests.get("http://localhost:8081/stats")
        stats = response.json()
        print("Database Statistics:")
        print(f"   Total items: {stats['total_items']}")
        print(f"   Vehicles: {stats['vehicles']}")
        print(f"   Model: {stats['model']}")
        print(f"   Device: {stats['device']}")
        return True
    except Exception as e:
        print(f"Stats request failed: {e}")
        return False

def test_image_search(image_path):
    """Test image search functionality"""
    if not Path(image_path).exists():
        print(f"Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post("http://localhost:8081/search", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("Search Results:")
            print(f"   Page: {result['page']}")
            print(f"   Score: {result['score']:.4f}")
            print(f"   Vehicle: {result['vehicle']}")
            print(f"   Manual: {result['manual']}")
            print(f"   Match Type: {result['match_type']}")
            print(f"   Context: {result['context_text'][:200]}...")
            return True
        else:
            print(f"Search failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Search request failed: {e}")
        return False

def main():
    print("Testing Advanced Troubleshooting System")
    print("=" * 50)
    
    # Test API connection
    if not test_api_connection():
        print("\nPlease start the API server first:")
        print("   cd advanced-troubleshooting-backend")
        print("   python -m venv .venv")
        print("   . .venv/bin/activate  # Windows: .\\.venv\\Scripts\\activate")
        print("   pip install -r requirements.txt")
        print("   python build_index.py")
        print("   uvicorn app:app --reload --port 8080")
        return
    
    print()
    
    # Test stats
    test_stats()
    print()
    
    # Test image search (if you have a test image)
    test_images = [
        "test-warning-icon.jpg",
        "test-dashboard-error.png",
        "test-manual-page.jpg"
    ]
    
    for img_path in test_images:
        if Path(img_path).exists():
            print(f"Testing with image: {img_path}")
            test_image_search(img_path)
            print()
            break
    else:
        print("No test images found. To test image search:")
        print("   1. Place a test image in the current directory")
        print("   2. Update the test_images list in this script")
        print("   3. Run the test again")

if __name__ == "__main__":
    main()

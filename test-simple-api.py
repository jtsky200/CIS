#!/usr/bin/env python3
"""
Simple test for the advanced troubleshooting API
"""
import requests
import json

def test_api():
    """Test the API endpoints"""
    base_url = "http://127.0.0.1:8081"
    
    try:
        # Test root endpoint
        print("Testing root endpoint...")
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Error: {response.text}")
        
        # Test stats endpoint
        print("\nTesting stats endpoint...")
        response = requests.get(f"{base_url}/stats", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            stats = response.json()
            print(f"Total items: {stats.get('total_items', 'N/A')}")
            print(f"Vehicles: {stats.get('vehicles', 'N/A')}")
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Connection failed - server not running")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()

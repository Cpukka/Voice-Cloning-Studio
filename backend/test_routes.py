import requests

BASE_URL = "http://localhost:8000"

def test_routes():
    print("Testing routes...")
    
    # Test health
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health: {response.status_code}")
    
    # Test root
    response = requests.get(f"{BASE_URL}/")
    print(f"Root: {response.status_code}")
    
    # Test voices test endpoint
    response = requests.get(f"{BASE_URL}/api/v1/voices/test")
    print(f"Voices test: {response.status_code}")
    if response.status_code == 200:
        print(f"  Response: {response.json()}")
    
    # Get all routes (requires authentication)
    response = requests.get(f"{BASE_URL}/openapi.json")
    if response.status_code == 200:
        data = response.json()
        print(f"\n📋 Available endpoints:")
        for path, methods in data.get("paths", {}).items():
            print(f"  {path}: {list(methods.keys())}")

if __name__ == "__main__":
    test_routes()
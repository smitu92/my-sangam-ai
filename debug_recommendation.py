import requests
import json

def test_recommendation_logic():
    # Simulate the profile that is getting bad results
    user_profile = {
        "userId": "test-user",
        "occupation": "Student",
        "state": "Gujarat",
        "caste": "General",
        "annualIncome": "200000"
    }
    
    # 1. Test the current vector search via Next.js API
    print("--- Testing Current Next.js Recommendation API ---")
    try:
        # Note: This might fail if auth is required, but let's see
        res = requests.get("http://localhost:3000/api/schemes/recommend")
        if res.ok:
            data = res.json()
            print(f"Found {len(data)} schemes")
            for s in data[:3]:
                print(f"ID: {s['id']} | Title: {s['title'][:50]}... | Reason: {s.get('matchReason')}")
        else:
            print(f"API Error: {res.status_code}")
    except Exception as e:
        print(f"Request failed: {e}")

    # 2. Test the embedding generation manually
    print("\n--- Testing Embedding Result for 'Student' ---")
    try:
        embed_res = requests.post("http://localhost:8000/api/embed-profile", json={"user_profile": user_profile})
        if embed_res.ok:
            vector = embed_res.json()["vector"]
            print(f"Vector Length: {len(vector)}")
            print(f"First 5 elements: {vector[:5]}")
        else:
            print(f"Embed Error: {embed_res.status_code}")
    except Exception as e:
        print(f"Embed Request failed: {e}")

if __name__ == "__main__":
    test_recommendation_logic()

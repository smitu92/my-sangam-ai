import requests
import json

def test_reasons():
    url = "http://127.0.0.1:8000/api/generate-reasons"
    payload = {
        "user_profile": {
            "occupation": "Student",
            "annualIncome": "200000",
            "state": "Maharashtra",
            "caste": "General"
        },
        "schemes": [
            {
                "id": "1",
                "title": "Central Sector Scholarship for University Students",
                "benefits": "providing annual maintenance grants to college students"
            }
        ]
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_id}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_reasons()

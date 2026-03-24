from langchain_google_genai import GoogleGenerativeAI
import os

gemini_llm = GoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("Gemini_API"))

def call_gemini(prompt:str):
    return gemini_llm.invoke(prompt)

import requests

def call_nvidia_llm(prompt: str, model_name: str = "mistralai/mistral-small-3.1-24b-instruct-2503") -> str:
    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    
    # ── Security: Read from .env, do not hardcode the key! ──
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return "Error: NVIDIA_API_KEY is missing from your .env file."

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": False
    }

    response = requests.post(invoke_url, headers=headers, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        # The AI's actual text answer is nested deep in the JSON array
        return data["choices"][0]["message"]["content"]
    else:
        return f"API Error ({response.status_code}): {response.text}"
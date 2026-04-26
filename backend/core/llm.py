import requests
import os
from dotenv import load_dotenv

load_dotenv()

def call_mistral_llm(prompt: str, system_prompt: str | None = None, model_name: str = None) -> str:
    invoke_url = os.getenv("INVOKE_URL")
    api_key = os.getenv("NVIDIA_API_KEY")
    # Fallback to a verified model if not provided
    active_model = model_name or os.getenv("MODEL_NAME") or "mistralai/mistral-large-3-675b-instruct-2512"
    
    if not api_key:
        return "Error: NVIDIA_API_KEY is missing from your .env file."

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": active_model,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": False
    }

    try:
        response = requests.post(invoke_url, headers=headers, json=payload, timeout=30)
        if response.status_code != 200:
            return f"LLM Error {response.status_code}: {response.text}"
        
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"LLM Connection Error: {str(e)}"


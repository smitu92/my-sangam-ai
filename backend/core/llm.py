import os
import requests

def call_mistral_llm(prompt: str, system_prompt: str | None = None, model_name: str = "mistralai/mistral-small-3.1-24b-instruct-2503") -> str:
    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    api_key = os.getenv("NVIDIA_API_KEY")
    
    if not api_key:
        return "Error: NVIDIA_API_KEY is missing from your .env file."

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model_name,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": False
    }

    try:
        response = requests.post(invoke_url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"LLM Error: {str(e)}"

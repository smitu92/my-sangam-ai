import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def get_embedding(text: str) -> list:
    # 🕵️‍♂️ Check for the standard GOOGLE_API_KEY first
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("Gemini_API")
    
    if not api_key:
        raise ValueError("CRITICAL: GOOGLE_API_KEY or Gemini_API key is missing from environment!")
    
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=api_key
    )
    return embeddings.embed_query(text)

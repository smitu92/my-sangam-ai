import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def get_embedding(text: str) -> list:
    api_key = os.getenv("Gemini_API")
    if not api_key:
        raise ValueError("Gemini_API key is missing from .env")
    
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        api_key=api_key
    )
    return embeddings.embed_query(text)

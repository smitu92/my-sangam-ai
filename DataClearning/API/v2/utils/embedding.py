from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
def get_embedding(text:str)->list:
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        api_key=os.getenv("Gemini_API"))
    return embeddings.embed_query(text)

        
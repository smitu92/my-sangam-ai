import faiss
import numpy as np
import pandas as pd
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
import os
from dotenv import load_dotenv

load_dotenv()

# ── Step 1: Load your raw FAISS index (no API calls) ──────────
raw_index = faiss.read_index("../../data/faiss.index")

# ── Step 2: Load CSV to rebuild the text mapping ──────────────
df = pd.read_csv("../../data/schemes_clean.csv").dropna(subset=["full_text"]).reset_index(drop=True)

# ── Step 3: Build docstore (text ↔ index mapping) ─────────────
# docs = {str(i): Document(page_content=row["full_text"]) for i, row in df.iterrows()}  #pandas dataframe to dictionary #_V1
# # ✅ Add metadata with scheme info
docs = {
    str(i): Document(
        page_content=row["full_text"],
        metadata={
            "scheme_id": str(i),
            "scheme_name": row.get("scheme_name", ""),
            "level": row.get("level", ""),
            "category": row.get("schemeCategory", ""),  # ← fixed!
            "tags": row.get("tags", ""),
        }
    )
    for i, row in df.iterrows()
} 
docstore = InMemoryDocstore(docs)
index_to_docstore_id = {i: str(i) for i in range(len(df))}

# ── Step 4: Wrap everything into LangChain FAISS ──────────────
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=os.getenv("Gemini_API")
)

vectorstore = FAISS(
    embedding_function=embeddings,
    index=raw_index,
    docstore=docstore,
    index_to_docstore_id=index_to_docstore_id
)


# ── Step 5: Save in LangChain format (do this ONCE) ───────────
vectorstore.save_local("../../data/langchain_faiss")
print("✅ Saved! Next time just use FAISS.load_local()")
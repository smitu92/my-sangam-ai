import os
import time
import numpy as np
import pandas as pd
import faiss
from google import genai



EMBEDDINGS_FILE = "../data/embeddings.npy"
FAISS_INDEX_FILE = "../data/faiss.index"

# ── 1. Load your API key from .env ──────────────────────────────



# ── 2. Load your CSV  ────────────────────────────
# df = pd.read_csv("../data/schemes_clean.csv")


# ── HELPER: embed a single text ──────────────────────────────────
def embed(text):
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text[:500]
    )
    # print("response of Embedding:",response)

    # print("response.embeddings[0].__dict__:",response.embeddings[0].__dict__)
    vec = np.array(response.embeddings[0].values, dtype="float32")
    # print("vec:",vec)
    # Normalize so that inner product = cosine similarity
    vec = vec / np.linalg.norm(vec)
    # print("normalized vec:",vec)
    return vec

# ── Only embed if not already saved ─────────────────────
if os.path.exists(EMBEDDINGS_FILE) and os.path.exists(FAISS_INDEX_FILE):
    print("✅ Loading saved embeddings (no API calls)...")
    matrix = np.load(EMBEDDINGS_FILE)
    index = faiss.read_index(FAISS_INDEX_FILE)
    # df = pd.read_csv("../data/schemes_clean.csv").head(20)
    # df = df.dropna(subset=["full_text"]).reset_index(drop=True)
    print("matrix:",matrix)
    print("index:",index)
    # return (matrix, index)

else:
    print("⚙️  Embeddings not found. Embedding now (API calls happening)...")
    df = pd.read_csv("../data/schemes_clean.csv")
    df = df.dropna(subset=["full_text"]).reset_index(drop=True)

    all_vectors = []
    for i, row in df.iterrows():
        vec = embed(row["full_text"])   # your existing embed()
        all_vectors.append(vec)
        time.sleep(0.5)                 # rate limit protection
        print(f"  Embedded {i+1}/{len(df)}")

    matrix = np.stack(all_vectors)

    # ── SAVE both to disk ────────────────────────────────
    np.save(EMBEDDINGS_FILE, matrix)           # saves as embeddings.npy

    dimension = matrix.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(matrix)
    faiss.write_index(index, FAISS_INDEX_FILE) # saves as faiss.index

    print("✅ Embeddings saved! Future runs won't call the API.")




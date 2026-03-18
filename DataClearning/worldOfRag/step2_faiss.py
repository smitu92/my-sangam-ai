import os
import numpy as np
import pandas as pd
import faiss
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("Gemini_API")) 

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

# ── STEP A: Load 20 rows from your CSV ──────────────────────────
df = pd.read_csv("../data/schemes_clean.csv").head(2)
df = df.dropna(subset=["full_text"]).reset_index(drop=True)

print(f"Loaded {len(df)} rows")

# ── STEP B: Embed all 20 rows ────────────────────────────────────
print("Embedding 20 rows...")
all_vectors = []
for i, row in df.iterrows():
    vec = embed(row["full_text"])
    all_vectors.append(vec)
    print(f"  Embedded row {i}: {row['full_text'][:60]}...")

# Stack into a 2D numpy array — shape: (20, 768)
matrix = np.stack(all_vectors)           # shape → (20, 768)
print(f"\nMatrix shape: {matrix.shape}") # should print (20, 768)

# ── STEP C: Build the FAISS index ───────────────────────────────
dimension = matrix.shape[1]             # 768
index = faiss.IndexFlatIP(dimension)    # IP = inner product
index.add(matrix)                       # add all 20 vectors
print(f"FAISS index has {index.ntotal} vectors")

# ── STEP D: Query it with a natural language question ───────────
query_text = "schemes for poor farmers in rural India"
query_vec = embed(query_text)

# Reshape to (1, 768) — FAISS expects a 2D array even for 1 query
query_vec = query_vec.reshape(1, -1)

# Search — k=3 means return top 3 closest
k = 3
scores, indices = index.search(query_vec, k)

# ── STEP E: See the results ──────────────────────────────────────
print(f"\n── Top {k} results for: '{query_text}' ──────────────────")
for rank, (score, idx) in enumerate(zip(scores[0], indices[0])):
    print(f"\nRank {rank+1} | Score: {score:.4f} | Row index: {idx}")
    print(f"Scheme: {df.iloc[idx]['full_text'][:150]}...")

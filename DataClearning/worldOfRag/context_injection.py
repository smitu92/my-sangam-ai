#step_3 :context injection

import os
import numpy as np
import pandas as pd
import faiss
from dotenv import load_dotenv
from google import genai

load_dotenv()
key=os.getenv("Gemini_API")


client = genai.Client(
    api_key=key
)

# ── Reuse your embed helper from Step 2 ─────────────────────────
def embed(text):
    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text[:500]
    )
    vec = np.array(response.embeddings[0].values, dtype="float32")
    return vec / np.linalg.norm(vec)   # normalize

# # ── Load CSV + build FAISS index (same as Step 2) ───────────────
df = pd.read_csv("../data/schemes_clean.csv").dropna(subset=["full_text"]).reset_index(drop=True)

# print("Embedding 50 rows...")
# matrix = np.stack([embed(row["full_text"]) for _, row in df.iterrows()])

# index = faiss.IndexFlatIP(matrix.shape[1])
# index.add(matrix)

# ── THE NEW PART: build a prompt with retrieved context ─────────

def ask(user_query, k=3):
    # matrix = np.load("../data/embeddings.npy")
    index = faiss.read_index("../data/faiss.index")
    # dimension = matrix.shape[1]
    # index = faiss.IndexFlatIP(dimension)
    # index.add(matrix)
    
    # STEP 1 — retrieve
    query_vec = embed(user_query).reshape(1, -1)
    scores, indices = index.search(query_vec, k)

    # STEP 2 — collect the matching scheme texts
    retrieved_schemes = []
    for score, idx in zip(scores[0], indices[0]):
        scheme_text = df.iloc[idx]["full_text"]
        retrieved_schemes.append(f"[Score: {score:.2f}]\n{scheme_text[:500]}")

    # STEP 3 — build the prompt by injecting context
    # This is "prompt engineering" — you control exactly what Gemini sees
    context = "\n\n---\n\n".join(retrieved_schemes)

    prompt = f"""
You are Sangam, an AI assistant that helps Indian citizens find government schemes.
Use ONLY the schemes provided below. Do not make up any schemes.
If no scheme is relevant, say "I couldn't find a matching scheme."

RETRIEVED SCHEMES:
{context}

USER QUERY: {user_query}

Answer clearly, listing scheme names and key benefits.
"""

    # STEP 4 — send to Gemini and get answer
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text

# ── Test it ──────────────────────────────────────────────────────
queries = [
    "schemes for small farmers with low income",
    "scholarship for girls in higher education",
    "housing scheme for urban poor"
]

for q in queries:
    print(f"\n{'='*60}")
    print(f"QUERY: {q}")
    print(f"{'='*60}")
    print(ask(q))

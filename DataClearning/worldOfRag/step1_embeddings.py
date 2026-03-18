import os
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from google import genai

# ── 1. Load your API key from .env ──────────────────────────────
load_dotenv()
client = genai.Client(api_key=os.getenv("Gemini_API"))

# ── 2. Load your CSV and pick 3 rows ────────────────────────────
df = pd.read_csv("../data/schemes_clean.csv")

# Pick 2 similar schemes (farming related) and 1 totally different
row_A = df[df["full_text"].str.contains("farmer|agriculture", case=False)].iloc[0]["full_text"]
row_B = df[df["full_text"].str.contains("farmer|agriculture", case=False)].iloc[1]["full_text"]
row_C = df[df["full_text"].str.contains("education|scholarship", case=False)].iloc[0]["full_text"] #pandas syntax and iloc-> ith location due to pandas

print(row_A)

texts = {"Farmer Scheme A": row_A, "Farmer Scheme B": row_B, "Education Scheme C": row_C}

# ── 3. Embed each one (sync call) ────────────────────────────────
vectors = {}
for name, text in texts.items():   #items()-> key value pairs
    response = client.models.embed_content(
      model="gemini-embedding-001",
        contents=text[:500]           # trim to 500 chars to save tokens
    )
    vectors[name] = response.embeddings[0].values
    print(f"\n{name}")
    print(f"Vector length: {len(vectors[name])}")          # how many dimensions?
    print(f"First 5 numbers: {vectors[name][:5]}")         # peek at actual values

# ── 4. Compare similarity between schemes ────────────────────────
# Cosine similarity = are two vectors pointing in the same direction?
# Result: 1.0 = identical meaning, 0.0 = totally different

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

sim_AB = cosine_similarity(vectors["Farmer Scheme A"], vectors["Farmer Scheme B"])
sim_AC = cosine_similarity(vectors["Farmer Scheme A"], vectors["Education Scheme C"])

print("\n── Similarity Scores ──────────────────────────")
print(f"Farmer A vs Farmer B (should be HIGH): {sim_AB:.4f}") #:.4f-> 4 decimal places
print(f"Farmer A vs Education C (should be LOW):  {sim_AC:.4f}")

import os
import time
import numpy as np
import pandas as pd
import faiss
from google import genai




EMBEDDINGS_FILE = "../data/embeddings.npy"
FAISS_INDEX_FILE = "../data/faiss.index"
CHECKPOINT_FILE = "../data/checkpoint.npy"   # ✅ NEW: partial progress
PROGRESS_FILE   = "../data/progress.txt"      # ✅ NEW: tracks last saved row

# ── HELPER: embed with retry ──────────────────────────────────
def embed(text, retries=5):
    for attempt in range(retries):
        try:
            response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=text[:500]
            )
            vec = np.array(response.embeddings[0].values, dtype="float32")
            vec = vec / np.linalg.norm(vec)
            return vec
        except Exception as e:
            wait = 2 ** attempt   # 1s → 2s → 4s → 8s → 16s
            print(f"  ⚠️  Error: {e} | Retrying in {wait}s...")
            time.sleep(wait)
    raise Exception("Failed after retries")

# ── Load saved embeddings OR resume checkpoint ────────────────
if os.path.exists(EMBEDDINGS_FILE) and os.path.exists(FAISS_INDEX_FILE):
    print("✅ Loading saved embeddings (no API calls)...")
    matrix = np.load(EMBEDDINGS_FILE)
    index  = faiss.read_index(FAISS_INDEX_FILE)

else:
    df = pd.read_csv("../data/schemes_clean.csv")
    df = df.dropna(subset=["full_text"]).reset_index(drop=True)

    # ✅ Resume from checkpoint if it exists
    if os.path.exists(CHECKPOINT_FILE) and os.path.exists(PROGRESS_FILE):
        all_vectors = list(np.load(CHECKPOINT_FILE))
        with open(PROGRESS_FILE, "r") as f:
            start_index = int(f.read().strip()) + 1
        print(f"🔁 Resuming from row {start_index} ({len(all_vectors)} already done)...")
    else:
        all_vectors  = []
        start_index  = 0
        print("⚙️  Starting fresh embedding...")

    # ── Main Loop ────────────────────────────────────────────
    for i in range(start_index, len(df)):
        row = df.iloc[i]
        vec = embed(row["full_text"])
        all_vectors.append(vec)
        time.sleep(0.5)

        # ✅ Save checkpoint after EVERY row
        np.save(CHECKPOINT_FILE, np.stack(all_vectors))
        with open(PROGRESS_FILE, "w") as f:
            f.write(str(i))

        print(f"  Embedded {i+1}/{len(df)}")

    # ── Build & save final FAISS index ───────────────────────
    matrix    = np.stack(all_vectors)
    dimension = matrix.shape[1]
    index     = faiss.IndexFlatIP(dimension)
    index.add(matrix)

    np.save(EMBEDDINGS_FILE, matrix)
    faiss.write_index(index, FAISS_INDEX_FILE)

    # ✅ Clean up checkpoint files after full success
    os.remove(CHECKPOINT_FILE)
    os.remove(PROGRESS_FILE)
    print("✅ Embeddings saved! Future runs won't call the API.")

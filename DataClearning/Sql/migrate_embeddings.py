# migrate_embeddings.py
# ─────────────────────────────────────────────────────────────────────
# PURPOSE: One-time migration script to fill the empty `embedding` column
#          in the Supabase `schemes` table with pre-computed vector data.
#
# FLOW:
#   1. Load embeddings.npy  — 3397 vectors of 3072 floats each (numpy binary)
#   2. Load schemes_clean.csv — the original scheme rows in same order
#   3. Sanity check: verify both have exactly the same number of rows
#   4. For each row i → UPDATE schemes SET embedding = matrix[i] WHERE id = df[i].id
#
# IMPORTANT: Row order in the CSV must match row order in the .npy file.
#            The embedding at index 0 belongs to the scheme at CSV row 0.
#            Do NOT shuffle either file before running this script.
# ─────────────────────────────────────────────────────────────────────

from time import sleep
import os
import pandas as pd
import numpy as np
from client import connect

supabase=connect()

# res=supabase.table("schemes").select("*",count="exact").execute()
# print(res.count)

# .npy is a binary numpy file — use np.load, NOT pd.read_csv
matrix = np.load("../data/embeddings.npy")
df     = pd.read_csv("../data/schemes_clean.csv")

print(f"Embeddings shape : {matrix.shape}")   # e.g. (3397, 3072)
print(f"CSV rows         : {len(df)}")         # should also be 3397

# Sanity check — both must match before pushing
if matrix.shape[0] == len(df):
    print("✅ Indexes match! Safe to push embeddings.")
else:
    print("❌ MISMATCH! Do NOT push — rows will be misaligned.")


BATCH_SIZE   = 100          # rows per batch
SLEEP_SEC    = 0.03         # 30ms gap between batches
CHECKPOINT   = "checkpoint.txt"  # file that saves where we stopped

# ── Resume support ───────────────────────────────────────────────────
# If a checkpoint file exists, start from that row index instead of 0
if os.path.exists(CHECKPOINT):
    with open(CHECKPOINT, "r") as f:
        start_from = int(f.read().strip())
    print(f"⏩ Resuming from row {start_from}...")
else:
    start_from = 0
    print("▶️  Starting fresh from row 0...")

# ── Batch loop ───────────────────────────────────────────────────────
# range(start, stop, step) — i jumps by BATCH_SIZE each iteration
# e.g. 0, 100, 200, 300 ... 3300
for i in range(start_from, len(df), BATCH_SIZE):

    batch_end = min(i + BATCH_SIZE, len(df))   # last row of this batch

    # Update each row inside the current batch
    for j in range(i, batch_end):
        # Since CSV has no 'id', we match by the exact scheme_name
        scheme_name = df.loc[j, "scheme_name"]
        embedding   = matrix[j].tolist()         # numpy array → Python list

        supabase.table("schemes").update(
            {"embedding": embedding}
        ).eq("scheme_name", scheme_name).execute()

    # Save checkpoint so we can resume if it crashes
    with open(CHECKPOINT, "w") as f:
        f.write(str(batch_end))

    print(f"✅ Pushed rows {i} → {batch_end - 1}  ({batch_end}/{len(df)})")

    # 30ms sleep between batches to avoid hammering Supabase
    sleep(SLEEP_SEC)

# ── Done ─────────────────────────────────────────────────────────────
os.remove(CHECKPOINT)   # clean up checkpoint file on success
print("🎉 All embeddings pushed successfully!")

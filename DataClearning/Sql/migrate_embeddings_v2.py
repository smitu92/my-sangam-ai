# migrate_embeddings.py — psycopg2 ultra-fast version
# ─────────────────────────────────────────────────────────────────────
# PURPOSE: One-time migration script (using psycopg2 and execute_batch)
#          to fill the empty `embedding` column in the Supabase table.
#
# SPEED:   Using raw psycopg2 bulk execution instead of the REST API
#          reduces time from ~35 minutes to less than 10 seconds.
# ─────────────────────────────────────────────────────────────────────

import os
import time
import psycopg2
import dotenv
import numpy as np
import pandas as pd
from psycopg2.extras import execute_batch
from pgvector.psycopg2 import register_vector

# 1. Load environment variables
dotenv.load_dotenv("../.env")
DB_URL = os.getenv("SUPABASE_DB_LINK")

if not DB_URL:
    print("❌ Error: SUPABASE_DB_LINK not found in .env. Cannot connect to psycopg2.")
    exit(1)

# 2. Load data files
print("Loading CSV and NumPy data...")
matrix = np.load("../../data/embeddings.npy") if os.path.exists("../../data/embeddings.npy") else np.load("../data/embeddings.npy")
df     = pd.read_csv("../../data/schemes_clean.csv") if os.path.exists("../../data/schemes_clean.csv") else pd.read_csv("../data/schemes_clean.csv")

if matrix.shape[0] != len(df):
    print("❌ MISMATCH! CSV and NumPy lengths do not match.")
    exit(1)

# 3. Connect to Postgres
print("Connecting to Supabase PostgreSQL...")
conn = psycopg2.connect(DB_URL)
register_vector(conn)
cur = conn.cursor()

# 4. Prepare batch updates
print("Preparing batch tuples...")
updates = []
for i in range(len(df)):
    scheme_id = i + 1  # Auto-incrementing IDs starting from 1
    embedding = matrix[i].tolist()
    updates.append((embedding, scheme_id))

# 5. Execute Batch
print(f"Submitting {len(updates)} embeddings via psycopg2 bulk execute_batch...")
start_time = time.time()

execute_batch(
    cur,
    "UPDATE schemes SET embedding = %s WHERE id = %s",
    updates,
    page_size=500  # Packs 500 rows per network call
)

conn.commit()
cur.close()
conn.close()

end_time = time.time()
print(f"🎉 Success! Migrated {len(updates)} rows in {end_time - start_time:.2f} seconds.")

# 00000->basic of pgycopg2 driver basic syntax

# The Driver: psycopg2
# Python doesn't come with a Postgres driver. You install one:

# bash
# pip install psycopg2-binary pgvector
# psycopg2-binary = Python ↔ Postgres connection (like Prisma for Node)
# pgvector = teaches psycopg2 how to handle vector type columns

# The Mental Model First
# Every database interaction in Python follows this exact pattern — no exceptions:

# text
# connect → get cursor → execute SQL → commit → close
# A connection = the open line to your database (like opening a phone call).
# A cursor = the object you use to send SQL commands (like your voice on the call).
# A commit = saving your changes permanently (like pressing send).
# Without commit, your changes exist only in the session and disappear.


import dotenv
import psycopg2
from pgvector.psycopg2 import register_vector
import dotenv
import os 
# Load the .env file from the parent directory
dotenv.load_dotenv("../.env")

DB_URL=os.getenv("SUPABASE_DB_LINK")

conn = psycopg2.connect(DB_URL)
register_vector(conn)  # teach psycopg2 about vector type
cur = conn.cursor()


cur.execute("""
    CREATE TABLE IF NOT EXISTS testPythonPG (
        id       SERIAL PRIMARY KEY,
        name     TEXT,
        category TEXT,
        email    TEXT,
        food     TEXT
    )
""")
conn.commit() 


cur.execute(
    "INSERT INTO testPythonPG (name, category,email,food) VALUES (%s, %s,%s,%s)",
    ("PM Kisan", "Agriculture","nobitaOpatel","Pizza")   # tuple of actual values
)
conn.commit()







""" 1 """
# Now the Real Thing: 3400 Updates at Once
# Here's what most people do wrong — and why it's slow:
# ❌ WRONG — 3400 separate round-trips to Supabase
for i in range(3400):
    cur.execute("UPDATE schemes SET embedding = %s WHERE id = %s", (vec, i+1))
    conn.commit()  # 3400 commits = 3400 network calls

# Each commit() inside the loop is a full network round-trip to Supabase. 3400 round-trips × ~50ms each = 170 seconds minimum.

# The fix is to commit once after all updates:


# But even better — use execute_batch which groups multiple statements into one network call:




from psycopg2.extras import execute_batch

# Build list of (vector, id) tuples first
updates = [
    (matrix[i].tolist(), i + 1)   # (embedding, id)
    for i in range(len(matrix))
]

# execute_batch sends 100 updates per network call (page_size=100)
execute_batch(
    cur,
    "UPDATE schemes SET embedding = %s WHERE id = %s",
    updates,
    page_size=100   # sends 100 rows per round trip → 34 total round trips
)

conn.commit()
print("✅ All 3400 rows updated")
# Why page_size=100: Instead of 3400 round-trips or one massive single call, it sends 100 rows per batch — 34 total calls. Balances speed and memory.










# Full Migration Script
""" 2 """
import psycopg2
import numpy as np
import pandas as pd
from psycopg2.extras import execute_batch
from pgvector.psycopg2 import register_vector

DB_URL = "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Load your existing work
df      = pd.read_csv("data/schemes_clean.csv").dropna(subset=["full_text"]).reset_index(drop=True)
matrix  = np.load("data/embeddings.npy")

print(f"CSV rows: {len(df)}, Vectors: {matrix.shape[0]}")
# These MUST match before you continue

conn = psycopg2.connect(DB_URL)
register_vector(conn)
cur = conn.cursor()

# Check how many rows are in Supabase
cur.execute("SELECT COUNT(*) FROM schemes")
print(f"Supabase rows: {cur.fetchone()[0]}")
# This must also match ↑

# Build updates — (vector, id)
# Assumes Supabase ids are 1,2,3... in same order as your cleaned CSV
updates = [
    (matrix[i].tolist(), int(df.loc[i, "id"]))  # use actual id column if exists
    for i in range(len(df))
]

execute_batch(
    cur,
    "UPDATE schemes SET embedding = %s WHERE id = %s",
    updates,
    page_size=100
)

conn.commit()
print("✅ Done — all embeddings pushed to Supabase")

cur.close()
conn.close()

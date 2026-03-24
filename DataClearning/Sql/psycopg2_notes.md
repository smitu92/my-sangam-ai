# 📘 Python ↔ PostgreSQL (Supabase) via `psycopg2`

> A complete guide to using Python's `psycopg2` driver to talk to a Supabase PostgreSQL database, including pgvector for AI embeddings.

---

## 📦 Installation

```bash
pip install psycopg2-binary pgvector python-dotenv numpy pandas
```

| Package             | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `psycopg2-binary`   | Python ↔ PostgreSQL connection driver (like Prisma for Node) |
| `pgvector`          | Teaches psycopg2 how to handle `vector` type columns |
| `python-dotenv`     | Loads `.env` secrets into `os.getenv()`              |
| `numpy`             | Handles your `.npy` embedding matrices               |
| `pandas`            | Reads and manipulates your CSV data                  |

---

## 🧠 The Mental Model

Every database interaction in Python follows this exact lifecycle — no exceptions:

```
connect → get cursor → execute SQL → commit → close
```

| Step        | What it does                                     | Analogy                     |
| ----------- | ------------------------------------------------ | --------------------------- |
| `connect`   | Opens a live connection to the database           | Opening a phone call        |
| `cursor`    | The object that sends SQL commands                | Your voice on the call      |
| `execute`   | Sends actual SQL to the database                  | Speaking a sentence          |
| `commit`    | Saves changes permanently                         | Pressing "Send"             |
| `close`     | Disconnects from the database                     | Hanging up the phone        |

> ⚠️ **Without `commit()`, your changes exist only in the session and disappear when the script ends!**

---

## 🔌 Basic Setup & Connection

```python
import psycopg2
import dotenv
import os
from pgvector.psycopg2 import register_vector

# Load secrets from .env file
dotenv.load_dotenv("../.env")  # path relative to where you run the script

DB_URL = os.getenv("SUPABASE_DB_LINK")

# Step 1: Connect
conn = psycopg2.connect(DB_URL)

# Step 2: Register vector type (REQUIRED for pgvector columns)
register_vector(conn)

# Step 3: Get cursor
cur = conn.cursor()
```

> ⚠️ **`register_vector(conn)` is CRITICAL** — without it, psycopg2 has no idea what a `vector(3072)` column is and will crash when reading/writing embeddings.

---

## 🛠️ CRUD Operations

### CREATE TABLE

```python
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
```

> ⚠️ **Common mistake:** Don't put a trailing comma after the last column (`food TEXT,`). SQL will throw a syntax error.

### INSERT

```python
cur.execute(
    "INSERT INTO testPythonPG (name, category, email, food) VALUES (%s, %s, %s, %s)",
    ("PM Kisan", "Agriculture", "nobitaOpatel", "Pizza")
)
conn.commit()
```

> 💡 Always use `%s` placeholders + tuple — **never** use f-strings or string concatenation. That opens you up to SQL injection attacks.

### SELECT (Read)

```python
cur.execute("SELECT * FROM testPythonPG")
rows = cur.fetchall()       # returns list of tuples
for row in rows:
    print(row)

# Or fetch just one:
cur.execute("SELECT COUNT(*) FROM schemes")
count = cur.fetchone()[0]   # returns a single tuple, [0] gets the value
```

### UPDATE

```python
cur.execute(
    "UPDATE schemes SET embedding = %s WHERE id = %s",
    ([0.1, 0.2, 0.3], 1)   # (vector_as_list, row_id)
)
conn.commit()
```

### DELETE

```python
cur.execute("DELETE FROM testPythonPG WHERE id = %s", (1,))
conn.commit()
```

> ⚠️ Notice the trailing comma in `(1,)` — Python needs this to recognize it as a tuple, not just parentheses around a number.

---

## ⚡ Performance: The Loop Trap vs Batch Updates

When updating thousands of rows (like 3,400 embeddings), **how** you send data is the difference between 3 minutes and 3 seconds.

### 🔴 The WRONG Way — Loop with commit inside

```python
for i in range(3400):
    cur.execute("UPDATE schemes SET embedding = %s WHERE id = %s", (vec, i + 1))
    conn.commit()  # ← 3400 commits = 3400 network round-trips!
```

**Why it's slow:** Each `commit()` is a full network flight to Supabase and back.
- 3,400 round-trips × ~50ms each = **~170 seconds minimum**

### 🟡 Better — Loop with single commit

```python
for i in range(3400):
    cur.execute("UPDATE schemes SET embedding = %s WHERE id = %s", (vec, i + 1))
conn.commit()  # ← only 1 commit, but still 3400 execute calls
```

### 🟢 The RIGHT Way — `execute_batch`

```python
from psycopg2.extras import execute_batch

# 1. Prepare all data as a list of tuples
updates = [
    (matrix[i].tolist(), i + 1)   # (embedding_as_list, row_id)
    for i in range(len(matrix))
]

# 2. Fire them in chunks
execute_batch(
    cur,
    "UPDATE schemes SET embedding = %s WHERE id = %s",
    updates,
    page_size=100   # packs 100 rows per network call → only 34 total calls
)

conn.commit()
```

**Why `page_size=100`:** Instead of 3,400 individual network calls, it groups 100 rows into each call. Result: only **34 round-trips**. Balances speed and memory perfectly.

---

## 🚀 Complete Migration Script: CSV + NumPy → Supabase

This is the real production script to push your cleaned CSV data and `.npy` embeddings into Supabase.

```python
import psycopg2
import numpy as np
import pandas as pd
from psycopg2.extras import execute_batch
from pgvector.psycopg2 import register_vector
import dotenv, os

dotenv.load_dotenv("../.env")
DB_URL = os.getenv("SUPABASE_DB_LINK")

# ── Step 1: Load your local data ────────────────────────
df     = pd.read_csv("data/schemes_clean.csv").dropna(subset=["full_text"]).reset_index(drop=True)
matrix = np.load("data/embeddings.npy")

# ── Step 2: Sanity checks (MUST pass before continuing) ─
print(f"CSV rows: {len(df)}, Vectors: {matrix.shape[0]}")
assert len(df) == matrix.shape[0], "❌ CSV and NumPy lengths don't match!"

# ── Step 3: Connect ─────────────────────────────────────
conn = psycopg2.connect(DB_URL)
register_vector(conn)
cur = conn.cursor()

# ── Step 4: Verify Supabase row count ───────────────────
cur.execute("SELECT COUNT(*) FROM schemes")
db_count = cur.fetchone()[0]
print(f"Supabase rows: {db_count}")
assert db_count == len(df), "❌ Supabase row count doesn't match CSV!"

# ── Step 5: Build update tuples ─────────────────────────
updates = [
    (matrix[i].tolist(), int(df.loc[i, "id"]))
    for i in range(len(df))
]

# ── Step 6: Batch update ────────────────────────────────
execute_batch(
    cur,
    "UPDATE schemes SET embedding = %s WHERE id = %s",
    updates,
    page_size=100
)

conn.commit()
print("✅ Done — all embeddings pushed to Supabase")

# ── Step 7: Always close connections ────────────────────
cur.close()
conn.close()
```

---

## 🔑 Key Takeaways

| Concept                      | Rule                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| Always call `register_vector(conn)` | Before any vector read/write                       |
| Always use `%s` placeholders | Never use f-strings in SQL (SQL injection risk)             |
| Always `commit()`           | Without it, nothing is saved                                 |
| Use `execute_batch`         | For bulk operations (100+ rows), never loop + commit         |
| Always `close()`            | Free up Supabase's connection pool when done                 |
| `.tolist()` on NumPy arrays | Postgres expects Python lists, not NumPy arrays              |
| Sanity check row counts     | Before migrating, verify CSV rows == NumPy rows == DB rows   |

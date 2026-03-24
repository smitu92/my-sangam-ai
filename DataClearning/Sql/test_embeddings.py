import os
import random
import numpy as np
from client import connect

# 1. Connect to Supabase using your existing client
supabase = connect()

# 2. Load the original local vector data
matrix_path = "../../data/embeddings.npy" if os.path.exists("../../data/embeddings.npy") else "../data/embeddings.npy"
matrix = np.load(matrix_path)

# Pick 10 random row IDs to test (IDs in Supabase are 1 to 3397)
random_ids = random.sample(range(1, matrix.shape[0] + 1), 10)
print(f"🎯 Testing 10 random Supabase rows: {random_ids}\n")

all_passed = True

for test_id in random_ids:
    # ── A. Fetch from Supabase
    res = supabase.table("schemes").select("id, embedding").eq("id", test_id).execute()
    
    if len(res.data) == 0:
        print(f"❌ Row ID {test_id} not found in Supabase!")
        all_passed = False
        continue
        
    import json
    db_embedding = res.data[0]["embedding"]
    
    if db_embedding is None:
        print(f"❌ Row ID {test_id} has a NULL embedding in Supabase!")
        all_passed = False
        continue
        
    # Supabase's REST API returns vector columns as formatted strings. Needs parsing.
    if isinstance(db_embedding, str):
        db_embedding = json.loads(db_embedding)

    # ── B. Fetch from local .npy file
    # We used (CSV Index + 1) = row ID. So local matrix index is ID - 1.
    local_index = test_id - 1
    local_embedding = matrix[local_index].tolist()
    
    # ── C. Compare them mathematically
    # We use np.allclose instead of `==` because floating point representation 
    # slightly changes when saving/loading data via JSON. This ensures they are 99.999% identical.
    is_match = np.allclose(db_embedding, local_embedding, atol=1e-5)

    if is_match:
        print(f"✅ Row {test_id:4} | Local Dim: {len(local_embedding)} | DB Dim: {len(db_embedding)} | Match: PERFECT")
    else:
        print(f"❌ Row {test_id:4} | Embeddings DO NOT MATCH!")
        all_passed = False

print("\n─────────────────────────────────────────────")
if all_passed:
    print("🎉 SUCCESS: All 10 random database vectors mathematically match the local .npy file!")
else:
    print("⚠️  FAILURE: Some vectors didn't match. Look at the logs above.")
print("─────────────────────────────────────────────\n")

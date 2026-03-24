

# # ────────────────────────────────────────────
# # 1. SELECT ALL — fetch every row from schemes
# # ────────────────────────────────────────────
# res = supabase.table("schemes").select("*").limit(3).execute()
# print("── SELECT first 3 rows ──")
# for row in res.data:
#     print(row)
# print()


# # ────────────────────────────────────────────
# # 2. SELECT specific columns only
# # ────────────────────────────────────────────
# res = supabase.table("schemes").select("id, scheme_name, level").limit(5).execute()
# print("── SELECT id, scheme_name, level ──")
# for row in res.data:
#     print(row)
# print()


# # ────────────────────────────────────────────
# # 3. FILTER — WHERE level = 'Central'
# # ────────────────────────────────────────────
# res = supabase.table("schemes").select("id, scheme_name").eq("level", "Central").limit(5).execute()
# print("── WHERE level = 'Central' ──")
# for row in res.data:
#     print(row)
# print()


# # ────────────────────────────────────────────
# # 4. COUNT — how many total rows in schemes
# # ────────────────────────────────────────────
# res = supabase.table("schemes").select("*", count="exact").execute()
# print(f"── Total rows in schemes: {res.count} ──\n")


# # ────────────────────────────────────────────
# # 5. INSERT a test row
# # ────────────────────────────────────────────
# res = supabase.table("schemes").insert({
#     "scheme_name": "TestScheme_Python",
#     "level": "Central",
#     "schemeCategory": "Test"
# }).execute()
# print("── INSERT result ──")
# print(res.data)
# print()


# # ────────────────────────────────────────────
# # 6. UPDATE — update the row we just inserted
# # ────────────────────────────────────────────
# inserted_id = res.data[0]["id"]
# res = supabase.table("schemes").update({"level": "State"}).eq("id", inserted_id).execute()
# print(f"── UPDATED row {inserted_id} ──")
# print(res.data)
# print()


# # ────────────────────────────────────────────
# # 7. DELETE — clean up the test row
# # ────────────────────────────────────────────
# res = supabase.table("schemes").delete().eq("id", inserted_id).execute()
# print(f"── DELETED row {inserted_id} ──")
# print(res.data)

res=supabase.table("schemes").select("*",count="exact").execute()
print(f"── Total rows in schemes: {res.count} ──\n")
# res=supabase.table("schemes").select("*").eq("level","Central").limit(1).execute()
# print(res)
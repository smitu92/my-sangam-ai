import pandas as pd

df = pd.read_csv("data/updated_data.csv")

print("=== BASIC INFO ===")
print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
print("Columns:", df.columns.tolist())

print("\n=== NULL COUNTS ===")
print(df.isnull().sum())

print("\n=== DUPLICATES ===")
print(f"Duplicate rows: {df.duplicated().sum()}")

print("\n=== SAMPLE ROW ===")
print(df.iloc[0])

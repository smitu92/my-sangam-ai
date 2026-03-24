import os
import dotenv
from supabase import create_client

# Resolve .env absolute path from DataClearning root (one directory up from Sql)
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.env"))
dotenv.load_dotenv(env_path)

url  = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key  = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # service role = full access

def connect():
    supabase = create_client(url, key)
    print("✅ Connected to Supabase!\n")
    return supabase

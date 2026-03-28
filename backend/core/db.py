import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def connect() -> Client:
    # Check for SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    
    # Check for SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
    return create_client(url, key)

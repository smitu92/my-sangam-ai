from .db import connect
from .embedding import get_embedding

def search_pgvector(query_text: str, filter_state: str | None = None, filter_category: str | None = None, top_k: int = 5, match_threshold: float = 0.3) -> list:
    supabase = connect()
    
    query_vector = get_embedding(query_text)
    
    res = supabase.rpc(
        "search_schemes_2",
        {
            "query_embedding": query_vector,
            "filter_state": filter_state,
            "filter_category": filter_category,
            "match_threshold": match_threshold,
            "top_k": top_k,
        }
    ).execute()
    
    return res.data

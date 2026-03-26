from Sql.client import connect
from API.v2.utils.embedding import get_embedding
# def search_pgvector(query_text: str, filter_state: str | None, filter_category: str | None, top_k: int)->list:
def search_pgvector(query_text: str, filter_state: str | None, filter_category: str | None, top_k: int, match_threshold: float = 0.3)->list:
    supabase=connect()
    
    print(f"DEBUG MISTRAL [PG_VECTOR]: Generating embedding for query: '{query_text}'")
    query_vector = get_embedding(query_text)
    
    print(f"DEBUG MISTRAL [PG_VECTOR]: Calling Supabase search_schemes with filter_state='{filter_state}' and filter_category='{filter_category}'")
    
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
    
    print(f"DEBUG MISTRAL [PG_VECTOR]: Returned {len(res.data)} schemes")
    return res.data

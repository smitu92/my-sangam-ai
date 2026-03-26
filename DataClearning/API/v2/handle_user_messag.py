import json
from API.v2.ROUTER_PROMPT import ROUTER_PROMPT
from API.v2.GENERATION_PROMPT import GENERATION_PROMPT
from Sql.client import connect
from API.v2.utils.embedding import get_embedding
from API.v2.utils.llm import call_gemini, call_nvidia_llm

def search_pgvector(query_text: str, filter_state: str, filter_category: str, top_k: int)->list:
    supabase=connect()
    query_vector=get_embedding(query_text)
     # 2. Call the SQL function via RPC
    res = supabase.rpc(
        "search_schemes",
        {
            "query_embedding": query_vector,
            "filter_state": filter_state,
            "filter_category": filter_category,
            "top_k": top_k,
        }
    ).execute()
    return res.data
    

def handle_user_message(user_message: str, user_profile: dict, chat_history: list):
    
    # ── CALL 1: Route + Extract filters ──────────────────
    router_input = ROUTER_PROMPT.format(
        user_message=user_message,
        user_state=user_profile.get("state", ""),
        user_category=user_profile.get("category", ""),
        user_occupation=user_profile.get("occupation", ""),
        user_income=user_profile.get("income", ""),
        chat_history=format_history(chat_history)
    )
    
    raw = call_nvidia_llm(router_input) #call_gemini(router_input)           # your existing Gemini call
    
    # Clean up markdown formatting (Gemini often wraps JSON in ```json blocks)
    clean_raw = raw.strip()
    if clean_raw.startswith("```json"):
        clean_raw = clean_raw[7:]
    elif clean_raw.startswith("```"):
        clean_raw = clean_raw[3:]
    if clean_raw.endswith("```"):
        clean_raw = clean_raw[:-3]
    clean_raw = clean_raw.strip()
    
    try:
        filters = json.loads(clean_raw)       # parse the JSON output
    except json.JSONDecodeError:
        print(f"Failed to parse JSON. Raw output was:\n{raw}")
        raise
    
    # ── DECISION: retrieve or skip ───────────────────────
    schemes = []
    if filters["type"] == "SCHEME":
        schemes = search_pgvector(           # your pgvector function
            query_text=filters["query"],
            filter_state=filters["state"],
            filter_category=filters["category"],
            top_k=5
        )
    elif filters["type"] == "OFF_TOPIC":
        return "I'm Sangam, I only help with Indian government schemes. Try asking about schemes for farmers, students, women, or any other category."
    
    # ── CALL 2: Generate answer ───────────────────────────
    generation_input = GENERATION_PROMPT.format(
        user_message=user_message,
        user_state=user_profile.get("state", ""),
        user_category=user_profile.get("category", ""),
        user_occupation=user_profile.get("occupation", ""),
        chat_history=format_history(chat_history),
        schemes_block=build_schemes_block(schemes)
    )
    
    answer = call_nvidia_llm(generation_input)
    return answer


def format_history(history: list) -> str:
    # keep last 3 exchanges only — saves tokens
    recent = history[-6:]  # 3 user + 3 AI messages
    lines = []
    for msg in recent:
        role = "User" if msg["role"] == "user" else "Sangam"
        lines.append(f"{role}: {msg['content']}")
    return "\n".join(lines) if lines else "None"

# schemes_block is built dynamically:
def build_schemes_block(schemes: list) -> str:
    if not schemes:
        return ""
    
    block = "RETRIEVED SCHEMES (use ONLY these, do not invent others):\n"
    for i, s in enumerate(schemes, 1):
        block += f"\n{i}. {s['name']}\n"
        block += f"   {s['full_text'][:400]}\n"
        block += f"   Score: {s['score']:.2f}\n"
    return block

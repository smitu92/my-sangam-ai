import json
import re
from API.v2.mistral.ROUTER_PROMPT import ROUTER_PROMPT
from API.v2.mistral.GENERATION_PROMPT import GENERATION_PROMPT
from Sql.client import connect
from API.v2.utils.embedding import get_embedding
from API.v2.mistral.llm import call_mistral_llm
from API.v2.mistral.pg_vector import search_pgvector
from API.v2.mistral.short_memory.session import get_session, update_session, format_buffer


def handle_user_message(user_message: str, user_profile: dict, chat_history: list, session_id: str = ""):
    
    # ── Load memory from Supabase ─────────────────────────
    session = None
    if session_id:
        session = get_session(session_id)
    
    # Build conversation context from memory (preferred) or fallback to chat_history
    if session and (session["buffer"] or session["summary"]):
        memory_context = ""
        if session["summary"]:
            memory_context += f"Summary: {session['summary']}\n"
        memory_context += format_buffer(session["buffer"])
    else:
        memory_context = format_history(chat_history)
    
    # ── CALL 1: Route + Extract filters ──────────────────
    router_input = ROUTER_PROMPT.format(
        user_message=user_message,
        user_state=user_profile.get("state", ""),
        user_category=user_profile.get("category", ""),
        user_occupation=user_profile.get("occupation", ""),
        user_income=user_profile.get("annual income", user_profile.get("income", "")),
        chat_history=memory_context
    )
    
    raw = call_mistral_llm(
        prompt="Analyze the user message and extract filters as instructed above.",
        system_prompt=router_input
    )
    
    # Flexible JSON extraction (finds anything looking like JSON object)
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        clean_raw = match.group(0)
    else:
        # Fallback to the original logic
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
        print(f"DEBUG MISTRAL [Router]: {filters}")
    except json.JSONDecodeError:
        print(f"Failed to parse JSON. Raw output was:\n{raw}")
        raise
    
    # ── Handle GENERAL type (greetings, follow-ups) ──────
    schemes = []
    if filters["type"] == "SCHEME":
        schemes = search_pgvector(           # your pgvector function
            query_text=filters["query"],
            filter_state=filters["state"],
            filter_category=filters["category"],
            top_k=5
        )
        # Fallback search if strict profile filters yield nothing
        if not schemes and (filters["state"] or filters["category"]):
            print("DEBUG MISTRAL [Retrieval]: 0 schemes found with filters, retrying without constraints.")
            schemes = search_pgvector(
                query_text=filters["query"],
                filter_state=None,
                filter_category=None,
                top_k=5
            )
    elif filters["type"] == "OFF_TOPIC":
        answer = "I'm Sangam, I only help with Indian government schemes. Try asking about schemes for farmers, students, women, or any other category."
        # Save to memory even for off-topic
        if session_id and session:
            update_session(session_id, user_message, answer, session)
        return answer
    
    print(f"DEBUG MISTRAL [Retrieval]: Found {len(schemes)} schemes")
    
    # ── Build memory-aware context for Generation ─────────
    conversation_summary = ""
    conversation_buffer = "No recent conversation."
    
    if session:
        conversation_summary = session.get("summary", "") or "This is the start of the conversation."
        conversation_buffer = format_buffer(session.get("buffer", []))
    else:
        conversation_summary = "This is the start of the conversation."
        conversation_buffer = format_history(chat_history)
    
    # ── CALL 2: Generate answer ───────────────────────────
    generation_input = GENERATION_PROMPT.format(
        user_message=user_message,
        user_state=user_profile.get("state", ""),
        user_category=user_profile.get("category", ""),
        user_occupation=user_profile.get("occupation", ""),
        user_income=user_profile.get("annual income", user_profile.get("income", "")),
        conversation_summary=conversation_summary,
        conversation_buffer=conversation_buffer,
        schemes_block=build_schemes_block(schemes)
    )
    
    answer = call_mistral_llm(
        prompt="Provide the final answer to the user query based strictly on the retrieved schemes.",
        system_prompt=generation_input
    )
    
    # ── Persist memory after response ─────────────────────
    if session_id and session:
        update_session(session_id, user_message, answer, session)
    
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
        return "RETRIEVED SCHEMES:\n[None retrieved. Do not suggest any.]"
    
    block = "RETRIEVED SCHEMES (use ONLY these, do not invent others):\n"
    for i, s in enumerate(schemes, 1):
        block += f"\n{i}. {s['name']}\n"
        block += f"   {s['full_text'][:400]}\n"
        block += f"   Score: {s['score']:.2f}\n"
    return block

"""
Sangam AI v3 — Structured Output Handler

Returns structured dict with typed response blocks instead of raw strings.
Frontend uses this to conditionally render scheme cards vs plain text.
"""

import json
import re
from API.v3.ROUTER_PROMPT import ROUTER_PROMPT
from API.v2.mistral.GENERATION_PROMPT import GENERATION_PROMPT
from API.v2.utils.embedding import get_embedding
from API.v2.mistral.llm import call_mistral_llm
from API.v2.mistral.pg_vector import search_pgvector
from API.v2.mistral.short_memory.session import get_session, update_session, format_buffer

def handle_user_message(user_message: str, user_profile: dict, chat_history: list, session_id: str = "") -> dict:
    """
    v3 handler — returns structured output:
    {
        "answer": str,
        "type": "SCHEME" | "GENERAL" | "OFF_TOPIC",
        "schemes_found": [{ id, name, level, category, description, score, application_url }]
    }
    """
    
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
        memory_context = _format_history(chat_history)
    
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
    
    # Flexible JSON extraction
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        clean_raw = match.group(0)
    else:
        clean_raw = raw.strip()
        if clean_raw.startswith("```json"):
            clean_raw = clean_raw[7:]
        elif clean_raw.startswith("```"):
            clean_raw = clean_raw[3:]
        if clean_raw.endswith("```"):
            clean_raw = clean_raw[:-3]
        clean_raw = clean_raw.strip()
    
    try:
        filters = json.loads(clean_raw)
        print(f"DEBUG V3 [Router]: {filters}")
    except json.JSONDecodeError:
        print(f"DEBUG V3 [Router]: Failed to parse JSON. Raw output was:\n{raw}")
        raise
    
    response_type = filters.get("type", "GENERAL")
    
    # ── Handle OFF_TOPIC ─────────────────────────────────
    if response_type == "OFF_TOPIC":
        answer = "I'm Sangam, I only help with Indian government schemes. Try asking about schemes for farmers, students, women, or any other category."
        if session_id and session:
            update_session(session_id, user_message, answer, session)
        return {
            "answer": answer,
            "type": "OFF_TOPIC",
            "schemes_found": []
        }
    
    # ── Retrieve schemes for SCHEME type ─────────────────
    raw_schemes = []
    structured_schemes = []
    
    if response_type == "SCHEME":
        raw_schemes = search_pgvector(
            query_text=filters["query"],
            filter_state=filters.get("state"),
            filter_category=filters.get("category"),
            top_k=5
        )
        
        # Fallback: retry without filters if nothing found
        if not raw_schemes and (filters.get("state") or filters.get("category")):
            print("DEBUG V3 [Retrieval]: 0 schemes with filters, retrying without constraints.")
            raw_schemes = search_pgvector(
                query_text=filters["query"],
                filter_state=None,
                filter_category=None,
                top_k=5
            )
        
        print(f"DEBUG V3 [Retrieval]: Found {len(raw_schemes)} schemes")
        
        # ── Build structured scheme data for frontend ────
        for s in raw_schemes:
            structured_schemes.append({
                "scheme_id": s.get("id", ""),
                "scheme_name": s.get("name", "Unknown Scheme"),
                "level": s.get("level", s.get("state", "Central")),
                "category": s.get("category", ""),
                "description": (s.get("full_text", "") or "")[:200],
                "score": round(s.get("score", 0), 2),
                "application_url": s.get("application_url", None),
            })
    
    # ── Build memory-aware context for Generation ────────
    conversation_summary = ""
    conversation_buffer = "No recent conversation."
    
    if session:
        conversation_summary = session.get("summary", "") or "This is the start of the conversation."
        session_buffer = format_buffer(session.get("buffer", []))
        # Always fall back to passed chat_history if session buffer is empty.
        # Critical for GENERAL follow-ups where session memory may not exist yet.
        conversation_buffer = session_buffer if session_buffer.strip() else _format_history(chat_history)
    else:
        conversation_summary = "This is the start of the conversation."
        conversation_buffer = _format_history(chat_history)
    
    # ── CALL 2: Generate answer ──────────────────────────
    # For GENERAL type: explicitly instruct the LLM to use conversation context
    if response_type == "GENERAL":
        user_prompt = "Answer the user's follow-up question using the RECENT CONVERSATION context above. Do NOT say you couldn't find schemes — the user is asking about something already discussed."
    else:
        user_prompt = "Provide the final answer to the user query based strictly on the retrieved schemes."

    generation_input = GENERATION_PROMPT.format(
        user_message=user_message,
        user_state=user_profile.get("state", ""),
        user_category=user_profile.get("category", ""),
        user_occupation=user_profile.get("occupation", ""),
        user_income=user_profile.get("annual income", user_profile.get("income", "")),
        conversation_summary=conversation_summary,
        conversation_buffer=conversation_buffer,
        schemes_block=_build_schemes_block(raw_schemes)
    )
    
    answer = call_mistral_llm(
        prompt=user_prompt,
        system_prompt=generation_input
    )

    
    # ── Persist memory ───────────────────────────────────
    if session_id and session:
        update_session(session_id, user_message, answer, session)
    
    # ── Return structured response ───────────────────────
    return {
        "answer": answer,
        "type": response_type,
        "schemes_found": structured_schemes
    }


def _format_history(history: list) -> str:
    """Format last 3 exchanges for prompt context."""
    recent = history[-6:]
    lines = []
    for msg in recent:
        role = "User" if msg["role"] == "user" else "Sangam"
        lines.append(f"{role}: {msg['content']}")
    return "\n".join(lines) if lines else "None"


def _build_schemes_block(schemes: list) -> str:
    """Build the schemes context block for the generation prompt."""
    if not schemes:
        return "RETRIEVED SCHEMES:\n[None retrieved. Do not suggest any.]"
    
    block = "RETRIEVED SCHEMES (use ONLY these, do not invent others):\n"
    for i, s in enumerate(schemes, 1):
        block += f"\n{i}. {s['name']}\n"
        block += f"   {s['full_text'][:400]}\n"
        block += f"   Score: {s['score']:.2f}\n"
    return block

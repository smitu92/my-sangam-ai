import json
import re
from .prompts import ROUTER_PROMPT, GENERATION_PROMPT
from .llm import call_mistral_llm
from .vector_search import search_pgvector
from .memory import get_session, update_session, format_buffer

def handle_user_message(user_message: str, user_profile: dict, chat_history: list, session_id: str = "") -> dict:
    session = get_session(session_id) if session_id else None
    
    memory_context = ""
    if session and (session["buffer"] or session["summary"]):
        if session["summary"]: memory_context += f"Summary: {session['summary']}\n"
        memory_context += format_buffer(session["buffer"])
    else:
        memory_context = "\n".join([f"{m['role'].title()}: {m['content']}" for m in chat_history[-6:]])

    # 1. ROUTE
    router_input = ROUTER_PROMPT.format(
        user_message=user_message,
        user_state=user_profile.get("state", ""),
        user_category=user_profile.get("category", ""),
        user_occupation=user_profile.get("occupation", ""),
        user_income=user_profile.get("income", ""),
        chat_history=memory_context
    )
    
    try:
        raw_route = call_mistral_llm(prompt="Classify query.", system_prompt=router_input)
        
        # Clean up potential Markdown blocks
        content = re.sub(r'```(?:json)?', '', raw_route)
        content = re.sub(r'```', '', content).strip()
        
        if content.startswith("LLM "):
            raise ValueError(f"LLM failure: {content}")
            
        # Extract JSON using standard greedy matching from first '{' to last '}'
        start = content.find('{')
        end = content.rfind('}')
        if start != -1 and end != -1:
            json_str = content[start:end+1]
            filters = json.loads(json_str)
        else:
            filters = json.loads(content)
            
    except Exception as e:
        print(f"ERROR: Router parse failed: {str(e)} | Raw: {raw_route}")
        filters = {"type": "GENERAL"}

    response_type = filters.get("type", "GENERAL")

    
    if response_type == "OFF_TOPIC":
        # Relaxed check for greetings
        greetings = ["hi", "hello", "hey", "hola", "namaste"]
        if any(g.lower() in user_message.lower() for g in greetings):
            response_type = "GENERAL"
        else:
            return {"answer": "I only help with Indian government schemes. How can I assist you with your eligibility today?", "type": "OFF_TOPIC", "schemes_found": []}

    # 2. RETRIEVE
    raw_schemes = []
    # 🕵️‍♂️ Logic: If it's a GENERAL query, we still want to keep the 'current' context 
    # of schemes visible to the LLM so it can answer follow-up questions.
    if response_type in ["SCHEME", "GENERAL"]:
        search_query = filters.get("query") or user_message
        raw_schemes = search_pgvector(search_query, filters.get("state"), filters.get("category"))
        if not raw_schemes and (filters.get("state") or filters.get("category")):
            raw_schemes = search_pgvector(filters["query"])

    # 3. GENERATE
    schemes_block = "RETRIEVED SCHEMES:\n" + "\n".join([f"- {s['name']}: {s['full_text'][:200]}" for s in raw_schemes]) if raw_schemes else "No schemes found."
    
    gen_input = GENERATION_PROMPT.format(
        user_message=user_message,
        user_state=user_profile.get("state", ""),
        user_category=user_profile.get("category", ""),
        user_occupation=user_profile.get("occupation", ""),
        conversation_summary=session.get("summary", "") if session else "",
        conversation_buffer=format_buffer(session["buffer"]) if session else "",
        schemes_block=schemes_block
    )
    
    answer = call_mistral_llm(prompt="Answer user.", system_prompt=gen_input)

    if session_id and session:
        update_session(session_id, user_message, answer, session)
    
    return {
        "answer": answer,
        "type": response_type,
        "schemes_found": [{
            "scheme_id": s.get("id"),
            "scheme_name": s.get("name"),
            "level": s.get("level", "Central"),
            "category": s.get("category", ""),
            "description": s.get("full_text", "")[:200],
            "score": s.get("score", 0)
        } for s in raw_schemes]
    }

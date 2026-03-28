from .db import connect
from .llm import call_mistral_llm

def get_session(session_id: str) -> dict:
    supabase = connect()
    try:
        res = supabase.table("chat_sessions").select("id, buffer, summary, msg_count").eq("id", session_id).maybe_single().execute()
        if res.data:
            return res.data
    except Exception:
        pass
    
    return {"id": session_id, "buffer": [], "summary": "", "msg_count": 0}

def update_session(session_id: str, user_msg: str, assistant_reply: str, old_session: dict) -> None:
    supabase = connect()
    
    new_pair = {"user": user_msg, "assistant": assistant_reply}
    buffer = old_session.get("buffer", []) + [new_pair]
    buffer = buffer[-3:]
    
    count = old_session.get("msg_count", 0) + 1
    summary = old_session.get("summary", "")
    
    if count % 5 == 0 and old_session.get("buffer"):
        summary = _compress_to_summary(old_session["buffer"], summary)
    
    supabase.table("chat_sessions").update({
        "buffer": buffer,
        "summary": summary,
        "msg_count": count
    }).eq("id", session_id).execute()

def _compress_to_summary(buffer: list, existing_summary: str) -> str:
    convo_text = "\n".join([f"User: {p['user']}\nSangam: {p['assistant']}" for p in buffer])
    prompt = f"Summarize this conversation in exactly 3 sentences focusing on schemes discussed.\n\nPrevious summary: {existing_summary}\n\nRecent:\n{convo_text}"
    return call_mistral_llm(prompt=prompt).strip()

def format_buffer(buffer: list) -> str:
    if not buffer: return "No recent conversation."
    return "\n".join([f"User: {p['user']}\nSangam: {p['assistant']}" for p in buffer])

"""
Short-term memory session manager for Sangam Mistral pipeline.

Manages a rolling buffer of the last 3 Q&A pairs and a compressed
summary of older conversation history, stored in the chat_sessions table.
"""

from Sql.client import connect
from API.v2.mistral.llm import call_mistral_llm


def get_session(session_id: str) -> dict:
    """Load memory state (buffer, summary, msg_count) for a given session."""
    supabase = connect()
    
    try:
        res = supabase.table("chat_sessions") \
            .select("id, buffer, summary, msg_count") \
            .eq("id", session_id) \
            .maybe_single() \
            .execute()
        data = res.data if res else None
    except Exception:
        data = None
    
    if data:
        print(f"DEBUG MEMORY [Load]: session={session_id}, msg_count={data['msg_count']}, buffer_len={len(data['buffer'])}")
        return data
    
    # Session not found — return safe defaults
    print(f"DEBUG MEMORY [Load]: session={session_id} NOT FOUND, using defaults")
    return {
        "id": session_id,
        "buffer": [],
        "summary": "",
        "msg_count": 0
    }


def update_session(session_id: str, user_msg: str, assistant_reply: str, old_session: dict) -> None:
    """
    Persist memory after every exchange:
    1. Append new Q&A pair to buffer (keep last 3 only)
    2. Increment msg_count
    3. If msg_count hits every 5th message, compress old buffer into summary
    """
    supabase = connect()
    
    new_pair = {"user": user_msg, "assistant": assistant_reply}
    buffer = old_session.get("buffer", []) + [new_pair]
    buffer = buffer[-3:]  # keep only last 3 pairs
    
    count = old_session.get("msg_count", 0) + 1
    summary = old_session.get("summary", "")
    
    # Trigger summary compression every 5th message
    if count % 5 == 0 and len(old_session.get("buffer", [])) > 0:
        print(f"DEBUG MEMORY [Summary]: Compressing at msg_count={count}")
        summary = _compress_to_summary(old_session["buffer"], old_session.get("summary", ""))
    
    # Write back to Supabase
    supabase.table("chat_sessions").update({
        "buffer": buffer,
        "summary": summary,
        "msg_count": count
    }).eq("id", session_id).execute()
    
    print(f"DEBUG MEMORY [Save]: session={session_id}, msg_count={count}, buffer_len={len(buffer)}, summary_len={len(summary)}")


def _compress_to_summary(buffer: list, existing_summary: str) -> str:
    """Use a cheap Mistral call to compress old conversation into 3 sentences."""
    
    # Format the buffer into readable text
    convo_text = ""
    for pair in buffer:
        convo_text += f"User: {pair['user']}\nSangam: {pair['assistant']}\n\n"
    
    prompt = f"""Summarize this conversation in exactly 3 sentences.
Focus on: which schemes were discussed, what the user asked about,
what was confirmed about eligibility or documents.

{f'Previous summary: {existing_summary}' if existing_summary else ''}

Recent conversation:
{convo_text}"""
    
    summary = call_mistral_llm(prompt=prompt)
    return summary.strip()


def format_buffer(buffer: list) -> str:
    """Format the buffer into a readable string for prompt injection."""
    if not buffer:
        return "No recent conversation."
    
    lines = []
    for pair in buffer:
        lines.append(f"User: {pair['user']}")
        lines.append(f"Sangam: {pair['assistant']}")
    return "\n".join(lines)

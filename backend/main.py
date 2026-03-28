import uvicorn
import json
import re
from dotenv import load_dotenv
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

load_dotenv()
from core.logic import handle_user_message
from core.embedding import get_embedding
from core.llm import call_mistral_llm


app = FastAPI(title="Sangam AI Backend")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),         # e.g. https://sangam.vercel.app
    os.getenv("FRONTEND_URL_CUSTOM", ""),  # e.g. https://yourdomain.com
]
# Remove empty strings (unset env vars)
ALLOWED_ORIGINS = [o for o in ALLOWED_ORIGINS if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Secret Middleware
INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET")

@app.middleware("http")
async def verify_internal_secret(request: Request, call_next):
    # Allow root/health check and CORS preflight
    if request.url.path == "/" or request.method == "OPTIONS":
        return await call_next(request)
        
    client_secret = request.headers.get("X-Internal-Secret")
    if not client_secret or client_secret != INTERNAL_API_SECRET:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=401, 
            content={"detail": "Unauthorized: Invalid Internal Secret"}
        )
        
    return await call_next(request)

@app.get("/")
async def home():
    return {"status": "Sangam V2 API is running", "version": "2.1.0"}

class QueryRequest(BaseModel):
    question: str
    user_profile: Any = ""
    chat_history: list = []
    session_id: str = ""

@app.post("/query")
async def ask(body: QueryRequest):
    profile = body.user_profile
    if isinstance(profile, str) and profile:
        profile = {k.strip().lower(): v.strip() for k, v in (p.split(":") for p in profile.split(",") if ":" in p)}
    
    result = handle_user_message(
        user_message=body.question,
        user_profile=profile if isinstance(profile, dict) else {},
        chat_history=body.chat_history,
        session_id=body.session_id
    )
    return result

class EmbedRequest(BaseModel):
    user_profile: Dict[str, Any]

@app.post("/api/embed-profile")
async def embed_profile(body: EmbedRequest):
    profile = body.user_profile
    profile_text = f"Age: {profile.get('age', 'N/A')}, State: {profile.get('state', 'N/A')}, Category: {profile.get('caste', 'N/A')}, Occupation: {profile.get('occupation', 'N/A')}"
    return {"vector": get_embedding(profile_text)}

@app.post("/api/eligibility")
async def check_eligibility(body: Dict[str, Any]):
    p, s = body.get("user_profile", {}), body.get("scheme", {})
    prompt = f"Determine eligibility for {s.get('title')} based on {p}. Respond ONLY with JSON: {{'chance': 'High'|'Medium'|'Low', 'criteria': [{{'label': '...', 'match': bool}}]}}"
    raw = call_mistral_llm(prompt=prompt, system_prompt="You are a strict JSON API.")
    try:
        match = re.search(r'\{.*\}', raw, re.DOTALL)

        return {"result": json.loads(match.group(0)) if match else json.loads(raw)}
    except:
        return {"error": "Failed to parse result", "raw": raw}

@app.post("/api/generate-reasons")
async def generate_reasons(body: Dict[str, Any]):
    profile = body.get("user_profile", {})
    schemes = body.get("schemes", [])
    prompt = f"User: {profile}\nSchemes: {schemes}\nWrite one supportive sentence (max 15 words) for each scheme explaining how it helps this user. Format as JSON: {{'scheme_id': 'reason'}}."
    raw = call_mistral_llm(prompt=prompt, system_prompt="You are a strict JSON-only API. Be supportive.")
    try:
        match = re.search(r'\{.*\}', raw, re.DOTALL)

        return json.loads(match.group(0)) if match else json.loads(raw)
    except:
        return {s.get("id"): "Relevant for your profile." for s in schemes}

@app.post("/api/recommend-intent")
async def recommend_intent(body: Dict[str, Any]):
    profile = body.get("user_profile", {})
    prompt = f"User Profile: {profile}\nExtract search keywords and category (Agriculture, Education, etc.). Format as JSON: {{'keywords': [], 'category': '', 'search_query': ''}}."
    raw = call_mistral_llm(prompt=prompt, system_prompt="You are a strict JSON-only API.")
    try:
        match = re.search(r'\{.*\}', raw, re.DOTALL)

        return json.loads(match.group(0)) if match else json.loads(raw)
    except:
        return {"keywords": ["schemes"], "category": "All", "search_query": "government schemes"}

@app.post("/api/embed-interests")
async def embed_interests(body: Dict[str, Any]):
    profile = body.get("user_profile", {})
    interest_text = ", ".join([p for p in [profile.get("occupation"), profile.get("educationLevel"), profile.get("courseName")] if p])
    return {"vector": get_embedding(interest_text), "text": interest_text}

@app.post("/api/embed-query")

async def embed_query(body: Dict[str, Any]):
    return {"vector": get_embedding(body.get("query", ""))}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

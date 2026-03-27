import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json


MODEL = "mistral"  # Options: "gemini" or "mistral"
VERSION = "v3"      # Options: "v2" or "v3" (v3 = structured output)

if VERSION == "v3":
    from API.v3.handle_user_message import handle_user_message
    from API.v2.mistral.llm import call_mistral_llm
elif MODEL == "mistral":
    from API.v2.mistral.handle_user_messag import handle_user_message
    from API.v2.mistral.llm import call_mistral_llm
else:
    from API.v2.handle_user_messag import handle_user_message
    from API.v2.llm import call_llm as call_mistral_llm


from API.v2.utils.embedding import get_embedding
from fastapi.encoders import jsonable_encoder
from typing import Optional, Dict, Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Sangam API v2 is running"}

class QueryRequest(BaseModel):
    question: str
    user_profile: str | dict = ""
    chat_history: list = []
    session_id: str = ""

@app.post("/query")
def ask(body: QueryRequest):
    # Build user_profile dict for v2 handler
    if isinstance(body.user_profile, str):
        # Parse profile string into dict for v2 compatibility
        profile_dict = {}
        if body.user_profile:
            for part in body.user_profile.split(","):
                part = part.strip()
                if ":" in part:
                    key, val = part.split(":", 1)
                    profile_dict[key.strip().lower()] = val.strip()
    else:
        profile_dict = body.user_profile

    result = handle_user_message(
        user_message=body.question,
        user_profile=profile_dict,
        chat_history=body.chat_history,
        session_id=body.session_id
    )
    
    # v2 handler returns a string answer
    if isinstance(result, str):
        return {"answer": result, "schemes_found": []}
    
    return jsonable_encoder(result)

class EmbedRequest(BaseModel):
    user_profile: Dict[str, Any]

@app.post("/api/embed-profile")
def embed_profile(body: EmbedRequest):
    profile = body.user_profile
    profile_text = f"Age: {profile.get('age', 'N/A')}, Gender: {profile.get('gender', 'N/A')}, State: {profile.get('state', 'N/A')}, Category: {profile.get('caste', 'N/A')}, Occupation: {profile.get('occupation', 'N/A')}, Income: {profile.get('annualIncome', 'N/A')}"
    vector = get_embedding(profile_text)
    return {"vector": vector}

class EligibilityRequest(BaseModel):
    user_profile: Dict[str, Any]
    scheme: Dict[str, Any]

@app.post("/api/eligibility")
def check_eligibility(body: EligibilityRequest):
    profile = body.user_profile
    scheme = body.scheme
    
    prompt = f"""
You are an AI Eligibility Analyzer for Indian Government Schemes.
Review the User Profile and the Scheme Details below.

USER PROFILE:
Age: {profile.get('age', 'N/A')}
Gender: {profile.get('gender', 'N/A')}
State: {profile.get('state', 'N/A')}
Income: {profile.get('annualIncome', 'N/A')}
Occupation: {profile.get('occupation', 'N/A')}
Social Category: {profile.get('caste', 'N/A')}

SCHEME DETAILS:
Title: {scheme.get('title', '')}
Description: {scheme.get('description', '')}
Benefits: {scheme.get('benefits', '')}
Eligibility Details: {scheme.get('eligibility', '')}

TASK: Determine if the user is eligible.
Respond ONLY with a valid JSON document (no markdown formatting, no backticks, just raw JSON).
The JSON must match this structure exactly:
{{
    "chance": "High" | "Medium" | "Low",
    "criteria": [
        {{ "label": "Criteria description (e.g., 'Annual Income < 2.5L')", "match": true | false }},
        {{ "label": "Criteria description", "match": true | false }},
        {{ "label": "Criteria description", "match": true | false }}
    ]
}}
"""
    
    result_text = call_mistral_llm(prompt=prompt, system_prompt="You are a strict JSON-only API. Do not wrap output in ```json")
    
    try:
        clean_text = result_text.strip().removeprefix('```json').removeprefix('```').removesuffix('```').strip()
        data = json.loads(clean_text)
        return {"result": data}
    except Exception as e:
        print(f"Failed to parse JSON from Mistral: {result_text}")
        return {"error": "Failed to parse LLM response", "raw": result_text}

class ReasonRequest(BaseModel):
    user_profile: Dict[str, Any]
    schemes: list[Dict[str, Any]]

@app.post("/api/generate-reasons")
def generate_reasons(body: ReasonRequest):
    profile = body.user_profile
    schemes = body.schemes
    
    # Include full profile context for better reasons
    schemes_data = [{"id": s.get("id"), "title": s.get("title"), "benefits": (s.get("benefits") or "")[:150]} for s in schemes]
    
    profile_summary = f"""Occupation: {profile.get('occupation', 'Citizen')}
State: {profile.get('state', 'India')}
Education: {profile.get('educationLevel', 'N/A')} ({profile.get('courseName', '')})
Caste: {profile.get('caste', 'General')}
Income: ₹{profile.get('annualIncome', 'N/A')}/year
Gender: {profile.get('gender', 'N/A')}"""
    
    prompt = f"""
USER PROFILE:
{profile_summary}

SCHEMES (already filtered for this user's state and occupation):
{json.dumps(schemes_data)}

TASK: These schemes have been PRE-FILTERED to match this user. For each scheme, write ONE supportive sentence (max 15 words) explaining HOW it helps this specific user.
- Always be POSITIVE and SUPPORTIVE. Never say "Not applicable".
- Reference the user's specific details (state, education, occupation).
- Example: "Offers ₹50,000 scholarship for B.Tech students in Gujarat."

OUTPUT: Respond ONLY with a valid JSON object mapping scheme IDs to their reasons. No markdown.
"""
    
    result_text = call_mistral_llm(prompt=prompt, system_prompt="You are a strict JSON-only API. Do not wrap output in ```json. Always be supportive.")
    
    try:
        clean_text = result_text.strip().removeprefix('```json').removeprefix('```').removesuffix('```').strip()
        data = json.loads(clean_text)
        return data
    except Exception as e:
        print(f"Failed to parse reasons JSON: {result_text}")
        return {s.get("id"): f"Relevant for {profile.get('occupation', 'your profile')} in {profile.get('state', 'India')}." for s in schemes}

class RecommendIntentRequest(BaseModel):
    user_profile: Dict[str, Any]

@app.post("/api/recommend-intent")
def recommend_intent(body: RecommendIntentRequest):
    profile = body.user_profile
    
    prompt = f"""
USER PROFILE: 
Occupation: {profile.get('occupation', 'N/A')}
Annual Income: {profile.get('annualIncome', 'N/A')}
State: {profile.get('state', 'N/A')}
Social Category: {profile.get('caste', 'N/A')}

TASK: Extract strict search keywords and the most relevant scheme category.
Keywords should be specific to their occupation or life stage (e.g., "scholarship" for students, "fertilizer" for farmers).
Category must be one of: Agriculture, Education, Healthcare, Business, Housing, Finance, Social Welfare, or All.

OUTPUT: Respond ONLY with a valid JSON document:
{{
    "keywords": ["keyword1", "keyword2"],
    "category": "CategoryName",
    "search_query": "A short semantic query for vector search"
}}
"""

    result_text = call_mistral_llm(prompt=prompt, system_prompt="You are a strict JSON-only API. Do not wrap output in ```json")
    
    try:
        clean_text = result_text.strip().removeprefix('```json').removeprefix('```').removesuffix('```').strip()
        data = json.loads(clean_text)
        return data
    except Exception as e:
        print(f"Failed to parse intent JSON: {result_text}")
@app.post("/api/embed-interests")
def embed_interests(body: Dict[str, Any]):
    profile = body.get("user_profile", {})
    
    # Build a "Clean Interest String" excluding State and Caste
    # This prevents the vector from wasting math space on data already filtered in SQL
    interest_parts = [
        profile.get("occupation", ""),
        profile.get("educationLevel", ""),
        profile.get("courseName", ""),
        profile.get("businessType", ""),
        profile.get("cropType", "")
    ]
    interest_text = ", ".join([p for p in interest_parts if p])
    
    # Use the existing embedding logic
    vector = get_embedding(interest_text)
    return {"vector": vector, "text": interest_text}

@app.post("/api/embed-query")
def embed_query(body: Dict[str, Any]):
    query = body.get("query", "")
    if not query:
        return {"vector": [], "error": "Empty query"}
    
    vector = get_embedding(query)
    return {"vector": vector}

if __name__ == "__main__":
    uvicorn.run("API.Main:app", host="0.0.0.0", port=8000, reload=True)
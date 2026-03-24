
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from API.v2.handle_user_messag import handle_user_message
from fastapi.encoders import jsonable_encoder
from typing import Optional

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
        chat_history=body.chat_history
    )
    
    # v2 handler returns a string answer
    # Wrap in expected response format
    if isinstance(result, str):
        return {"answer": result, "schemes_found": []}
    
    return jsonable_encoder(result)


if __name__ == "__main__":
    uvicorn.run("Main:app", host="0.0.0.0", port=8000, reload=True)
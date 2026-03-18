

from streamlit import json
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from business_logic import llmask
from fastapi.encoders import jsonable_encoder

app=FastAPI()
@app.get("/")
def home():
    return {"message":"Sangam API is running"}

@app.post("/name")
def name(name:str):
    return {"message":f"Hello {name}"}   

class QueryRequest(BaseModel):
    question: str
    user_profile: str


@app.post("/query")
def ask(body:QueryRequest):
    result= llmask(body.question,body.user_profile)
    compatible_data = jsonable_encoder(result)
    print(compatible_data)
    return compatible_data


if __name__=="__main__":
    uvicorn.run("Main:app",host="0.0.0.0",port=8000,reload=True) 
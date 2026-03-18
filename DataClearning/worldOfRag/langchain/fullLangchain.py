
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("Gemini_API")
)
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=os.getenv("Gemini_API")
)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are Sangam, an AI assistant for Indian government schemes.
Use ONLY the context below. Do not make up schemes.
Context: {context}"""),
    ("human", "{input}"),
])
vectorstore=FAISS.load_local("../../data/langchain_faiss", embeddings,allow_dangerous_deserialization=True)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
question_answer_chain = create_stuff_documents_chain(llm, prompt)
chain = create_retrieval_chain(retriever, question_answer_chain)

# ── Query ─────────────────────────────────────────────────────
result = chain.invoke({"input": "schemes for small farmers with low income"})
print(result["answer"])
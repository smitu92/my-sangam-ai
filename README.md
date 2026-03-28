# 🌊 Sangam — AI-Powered Indian Government Schemes Finder

> Find the right government scheme for you — powered by RAG, pgvector, Mistral & hybrid search.

Sangam is a full-stack semantic search + AI recommendation engine built on top of 3,400+ Indian government schemes sourced from MyScheme.gov.in. Users describe their situation in natural language and get relevant scheme recommendations with key benefits — no keyword guessing, pure meaning-based retrieval backed by a two-call LLM architecture.

---

## 🏗️ Architecture (v3)

### Two-Call LLM Workflow
We use a **Router-Generator** pattern to ensure high precision and cost-efficiency.

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER SENDS A MESSAGE                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  CALL 1 — ROUTER  (Mistral · ~100 tokens)                       │
│                                                                 │
│  Input:  user message + profile + chat history                  │
│  Output: { "type": "SCHEME" | "GENERAL" | "OFF_TOPIC",          │
│            "query": "...", "state": "...", "category": "..." }  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
      SCHEME            GENERAL          OFF_TOPIC
          │                │                │
          ▼                │                ▼
  search_pgvector()        │        return hardcoded
  filter → cosine          │        decline message
  top 5 schemes            │        (no Call 2 at all)
          │                │
          └────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  CALL 2 — GENERATOR  (Mistral · ~800 tokens)                    │
│                                                                 │
│  Input:  user message + schemes + memory + profile              │
│  Output: final natural language answer + structured metadata    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
     { answer, type: SCHEME|GENERAL|OFF_TOPIC, schemes_found[] }
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   SchemeCards +       TextBubble       OrangeWarning
   TextBubble          (grey)           Bubble 🚫
   (blue border)
```

### Hybrid Search Engine
Our retrieval pipeline fuses three distinct search techniques for maximum accuracy:
- **Vector Search**: `pgvector` & cosine similarity for deep semantic meaning.
- **Full-Text Search**: `tsvector` + `tsquery` for exact keyword matching and stemming.
- **Fuzzy Search**: `pg_trgm` for typo tolerance and partial matches.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router) · TypeScript · Tailwind CSS |
| **Auth** | Supabase Auth (with admin-bypass for testing) |
| **Database** | Supabase (PostgreSQL) · Prisma ORM |
| **Vector Engine** | `pgvector` (3072-dim) · IVFFlat indexing |
| **Embeddings** | Gemini Embedding API (`text-embedding-004`) |
| **LLM** | Mistral Small 3.1 (24B) via NVIDIA NIM API |
| **AI Backend** | FastAPI · Uvicorn · Pydantic |
| **Memory** | Short-term session memory (Buffer + LLM Summary) |

---

## 🗂️ Project Evolution

### Phase 1: Legacy Structure (v1/v2)
```bash
sangam/
├── app/
│   ├── api/             # Proxy routes to FastAPI
│   ├── chatbot/         # Immersive chat interface
│   ├── schemes/         # Hybrid search dashboard
│   ├── profile/         # User profile & data management
│   └── components/      # Premium UI components (Tailwind)
├── prisma/
│   └── schema.prisma    # pgvector-ready DB schema
├── integration-tests/   # Playwright (E2E) & Vitest (API)
└── DataClearning/      # 🧠 Legacy Python Backend (Misspelled)
    ├── data/            # Schemes dataset + pre-computed vectors
    ├── worldOfRag/      # Educational RAG modules (v1 FAISS archived)
    └── API/             # FastAPI v3 (Mistral Handlers)
```


---

### Phase 2: Refined & Unified (`main-v2-clean`)

> **Major Changes from the Past**:
> - **Directory Refactor**: Renamed misspelled `DataClearning` to `backend/`.
> - **Logic Consolidation**: Merged fragmented `API/v2/v3` handlers into a single `backend/core/` package.
> - **Data Optimization**: Purged 200MB+ of obsolete legacy vector data and CSV files.

```bash
sangam/
├── app/                 # Next.js Frontend
├── backend/             # 🧠 Unified AI Backend (FastAPI) [NEW]
│   ├── main.py          # Unified entry point
│   └── core/            # Unified logic (db, llm, search, memory)
├── prisma/              # DB Schema (Preserved)
└── integration-tests/   # Automated Suites (Preserved)
```

---

## 🚀 Setup & Run

### 1. Frontend (Next.js)
```bash
npm install
cp .env.local.example .env.local   # add Supabase URL + auth keys
npx prisma migrate dev
npm run dev                         # localhost:3000
```

### 2. AI Backend (FastAPI)
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Set GOOGLE_API_KEY, NVIDIA_API_KEY, DATABASE_URL in .env
python main.py
```

---

## 📡 API Reference

### `POST /query`
**Request:**
```json
{
  "message": "show me farmer schemes in Gujarat",
  "profile": { "state": "Gujarat", "occupation": "Farmer", "income": 50000 },
  "session_id": "abc123"
}
```

**Response:**
```json
{
  "answer": "Here are relevant schemes for farmers in Gujarat...",
  "type": "SCHEME",
  "schemes_found": [{ "scheme_id": "42", "scheme_name": "PM-KISAN", "score": 0.91, ... }]
}
```

---

## 🧭 Build Journey

Built step-by-step from raw data to a production-grade AI platform:
1. **Data Cleaning**: Unified `full_text` column for semantic search.
2. **Vectorization**: Pre-computing 3072-dim embeddings for 3,400 schemes.
3. **Core RAG**: Transitioned from FAISS to `pgvector` for native SQL integration.
4. **Router-Generator**: Implemented two-call LLM logic to optimize cost and relevance.
5. **Memory**: Built a Buffer + Summary pattern for persistent conversation context.
6. **Testing**: Automated E2E verification with Playwright & Vitest.

---

## 🗺️ Build Roadmap & Refactor Journey

### Phase 1: Development
- [x] Data cleaning + `full_text` column
- [x] Manual embedding + FAISS exploration (archived in `core-v1`)
- [x] Full LangChain RAG pipeline (archived in `core-v1`)
- [x] FastAPI `/query` endpoint
- [x] pgvector migration
- [x] Two-call LLM architecture (Router + Generator)
- [x] Short-term session memory (Buffer + Summary)
- [x] Hybrid search bar (FTS + Vector + Fuzzy)
- [x] Recommendation endpoint (Profile-aware)
- [x] Automated Integration Testing (Playwright + Vitest)

---

### Phase 2: Latest Refactor (`v2-clean` Update)

> **What Changed & Why**:
> To achieve a production-ready, professional state, we consolidated all AI logic, renamed the misspelled backend folders, and purged 200MB+ of legacy vector data.

- [x] **Unified Backend**: Consolidated `DataClearning` → `backend/`.
- [x] **Logic Consolidation**: Merged v2/v3 routers and handlers into `backend/core/`.
- [x] **Repository Cleanup**: Purged 200MB+ of legacy FAISS/CSV files for a clean repository.
- [ ] Deploy Unified Backend on Railway
- [ ] Final Vercel Deployment

---

## 📦 Dataset

- **Source:** [Kaggle — Indian Government Schemes](https://www.kaggle.com)
- **Original:** 3,400 rows · 11 columns
- **Cleaned:** 3,397 rows · 10 columns
- **Origin:** MyScheme.gov.in

---

## 🙏 Acknowledgements

Built as part of the **6th Semester Project**.
Powered by **Mistral AI** · **Google Gemini** · **pgvector** · **Supabase** · **NVIDIA NIM**

# Sangam - Product Vision & Feature Upgrades

## The Current Gimmick vs. The Goal
Telling a user the name of a scheme is only doing 10% of the work. The real friction for a citizen isn't just knowing the scheme exists; it's the nightmare of actually applying for it. 
To turn Sangam from a "generic AI chatbot" into a genuinely hyper-valuable product, we must focus on **End-to-End Application Guidance**.

## 1. Upgrade the Dataset Structure (The "How-To")
Your dataset right now probably just has the Scheme Name and Eligibility. You need to structure your data (or system prompt) so that your RAG pipeline is **forced** to extract and return these specific keys for every single scheme:
* **The Required Documents**: (e.g., Aadhar Card, Income Certificate, Domicile Certificate).
* **The Action Plan (Where to go)**: Exactly *where* do they get these documents? (e.g., "Go to your local Tehsildar office or use the e-District portal to generate an Income Certificate").
* **The Costs**: Are there application fees? 
* **The Timeline**: How many days does it take to process?

## 2. Guided Step-by-Step UI
Instead of a generic chatbot window that dumps text, change the Frontend MVP to generate a **Checklist UI** when a user matches with a scheme:
- [ ] Check Eligibility
- [ ] Gather Documents (Click to see how to get an Income Certificate)
- [ ] Direct link to the Official Application Portal
- [ ] Display step-by-step application timeline and associated costs.

## 3. Fixing the "Dull RAG/Unreliable Schemes" (Metadata Filtering)
If the RAG is returning bad or generic results when searching for a specific branch/state, the **Embedding and Chunking strategy** needs improvement.
* **The Fix**: Implement **Metadata Filtering** in the Vector Database (e.g. `vectorGenerator.py`).
* Before asking the AI, the backend should add a hard filter (e.g., `{"state": "Gujarat", "occupation": "Student"}`) to the vector query. This guarantees the AI only pulls context from exactly relevant schemes, preventing hallucinations (like suggesting a Punjab scheme to a Gujarat user).

## Next Steps to Build This
Shift focus from "AI chat" to "End-to-End Application Guidance". 
- [] Refactor Python `vectorGenerator.py` to support Metadata Filtering.
- [] Rewrite the AI system prompt to enforce the "Document Checklist & Timeline" output structure.

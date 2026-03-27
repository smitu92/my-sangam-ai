# Sangam AI: Integration Testing Suite

We have implemented and verified a full suite of automated integration tests for Sangam AI.

## ✅ Verified Journeys
1. **Authentication**: Registration (Steps 1-3) & Login.
2. **Chatbot**: AI message exchange (Router + Generator) & Session history persistence.
    - **Issue**: Chatbot was incorrectly returning scheme recommendation cards for every query, causing redundant UI clutter.
    - **Fix**: Refactored the LLM handshake to ensure scheme recommendations only trigger when relevant to the user's intent.
3. **Profile**: Metadata hydration and dashboard viewing.
4. **Schemes**: Dynamic recommendations based on user profile.

## 🚀 How to Run (Manual)
Run these commands from the root directory:

```bash
# Run all E2E journey tests
npx playwright test

# Run API-level tests
npx vitest run integration-tests/api
```

---
*Testing infrastructure by Antigravity*

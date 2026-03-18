# import requests
# import streamlit as st 

# st.title("Sangam")




# st.sidebar.selectbox("Choose a model", ["GPT-4", "Claude", "Gemini"])
# st.sidebar.slider("Temperature", 0.0, 1.0, 0.7)







# # Input box
# user_profile = st.text_input("User Profile",placeholder="Enter your details")
# question = st.text_input("Ask a question:",placeholder="Enter your question")

# # Button
# if st.button("Ask"):
#     if question and user_profile:
#         response=requests.post("http://localhost:8000/query",json={"question":question,"user_profile":user_profile})
#         st.write(response.json()["answer"])
#         st.write(response.json()["schemes_found"])

#     else:
#         st.warning("Please enter both user profile and question")


# import streamlit as st

# # Pretend this is the data you got back from your FastAPI backend
# user_data = {
#   "personalDetails": {"name": "Aarav Patel", "age": 21, "category": "General"},
#   "professionalDetails": {"profession": "Student - B.Tech CSE", "sector": "IT"}
# }

# # Create the "Card"
# with st.container(border=True):
#     # Everything inside this 'with' block goes inside the card
#     st.subheader(f"👤 {user_data['personalDetails']['name']}")
    
#     # You can use columns inside the card for a neat layout
#     col1, col2 = st.columns(2)
    
#     with col1:
#         st.write(f"**Age:** {user_data['personalDetails']['age']}")
#         st.write(f"**Category:** {user_data['personalDetails']['category']}")
        
#     with col2:
#         st.write(f"**Profession:** {user_data['professionalDetails']['profession']}")
#         st.write(f"**Sector:** {user_data['professionalDetails']['sector']}")
    
#     # Add a button at the bottom of the card
#     st.button("View Full Profile", key="btn_aarav")

import streamlit as st
import requests

st.set_page_config(page_title="Sangam", page_icon="🪷", layout="wide")


# Input box
user_profile = st.text_input("User Profile",placeholder="Enter your details")
question = st.text_input("Ask a question:",placeholder="Enter your question")

schemes=[]

if st.button("Ask"):
    if question and user_profile:
        response=requests.post("http://localhost:8000/query",json={"question":question,"user_profile":user_profile})
        st.write(response.json()["answer"])
        schemes=response.json()["schemes_found"]

    else:
        st.warning("Please enter both user profile and question")


st.markdown("""
<style>
.scheme-card {
    background: #f8faff;
    border-left: 4px solid #4f46e5;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.scheme-card h4 { margin: 0 0 8px 0; color: #1e1b4b; font-size: 1rem; }
.scheme-card p  { margin: 3px 0; font-size: 0.83rem; color: #4b5563; }
.badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    margin-right: 6px;
}
.badge-Central { background:#dbeafe; color:#1d4ed8; }
.badge-State   { background:#dcfce7; color:#15803d; }
.badge-Other   { background:#fef9c3; color:#92400e; }
</style>
""", unsafe_allow_html=True)

st.title("🪷 Sangam — Scheme Results")
st.divider()

# ── Paste your LLM answer here ───────────────────────────────
answer = """YOUR LLM ANSWER GOES HERE"""

st.markdown("### 💬 Answer")
st.info(answer)

st.markdown("### 📋 Matching Schemes")

# ── Paste your schemes list here ─────────────────────────────
# schemes = [
#     {
#         "scheme_name": "PM Kisan Samman Nidhi",
#         "scheme_id": "SCH001",
#         "level": "Central",
#         "category": "Agriculture",
#     },
#     {
#         "scheme_name": "Beti Bachao Beti Padhao",
#         "scheme_id": "SCH002",
#         "level": "Central",
#         "category": "Women & Child",
#     },
#     {
#         "scheme_name": "Mukhyamantri Kisan Sahay Yojana",
#         "scheme_id": "SCH003",
#         "level": "State",
#         "category": "Agriculture",
#     },
# ]

# ── Render cards ─────────────────────────────────────────────
for s in schemes:
    level       = s.get("level", "Other")
    badge_class = f"badge-{level}" if level in ["Central", "State"] else "badge-Other"

    st.markdown(f"""
    <div class="scheme-card">
        <h4>{s.get("scheme_name", "—")}</h4>
        <p>
            <span class="badge {badge_class}">{level}</span>
            <span class="badge" style="background:#f3e8ff;color:#7e22ce;">{s.get("category", "—")}</span>
        </p>
        <p>🆔 <b>ID:</b> {s.get("scheme_id", "—")}</p>
    </div>
    """, unsafe_allow_html=True)
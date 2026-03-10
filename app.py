import streamlit as st
from google import genai
from google.genai import types
from openai import OpenAI
import tempfile
import os
import pandas as pd
import datetime

# ==========================================
# 1. PAGE SETUP
# ==========================================
st.set_page_config(page_title="Unit Study Assistant", page_icon="🎓", layout="centered")

# ==========================================
# 2. SECURITY & LOGIN
# ==========================================
def check_password():
    """Returns True if the user has the correct password."""
    if st.session_state.get("password_correct", False):
        return True

    st.title("🔒 Login Required")
    password_input = st.text_input("Enter the password to access your assistant:", type="password")

    if password_input:
        if password_input == st.secrets["APP_PASSWORD"]:
            st.session_state["password_correct"] = True
            st.rerun()
        else:
            st.error("Incorrect password. Please try again.")
    return False

# ==========================================
# 3. AI TOOLS (FUNCTION CALLING)
# ==========================================
def add_task(task_name: str, days_from_now: int) -> str:
    """Adds a new task or assignment to the user's daily planner."""
    due_date = datetime.date.today() + datetime.timedelta(days=days_from_now)
    new_task = pd.DataFrame([{"Task": task_name, "Date": due_date, "Done": False}])
    st.session_state.schedule = pd.concat([st.session_state.schedule, new_task], ignore_index=True)
    return f"Successfully added '{task_name}' due on {due_date}."

def generate_image_tool(prompt_description: str) -> str:
    """Generates an image based on a detailed prompt description."""
    openai_client = OpenAI(api_key=st.secrets["OPENAI_API_KEY"])
    
    with st.spinner("Drawing image..."):
        response = openai_client.images.generate(
            model="dall-e-3",
            prompt=prompt_description,
            n=1,
            size="1024x1024",
            quality="standard",
        )
        
    # THE SECRET BYPASS: Save the pristine URL directly to memory
    st.session_state.latest_generated_image = response.data[0].url
    
    # Tell the AI to proceed normally
    return "Success! The image is saved. Politely tell the user you have drawn it."

# ==========================================
# 4. THE MAIN APPLICATION
# ==========================================
if check_password():
    
    st.title("🎓 Unit Study Assistant")
    client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])

    # --- THE SIDEBAR ---
    with st.sidebar:
        st.header("📄 Upload Course Materials")
        uploaded_files = st.file_uploader("Upload your PDFs here", type=['pdf'], accept_multiple_files=True)
        
        if "

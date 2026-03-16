import streamlit as st
from google import genai
from google.genai import types
from duckduckgo_search import DDGS
import yfinance as yf
from youtube_transcript_api import YouTubeTranscriptApi
import tempfile
import os
import pandas as pd
import datetime
import sqlite3

# ==========================================
# 1. PAGE SETUP & DATABASE INIT
# ==========================================
st.set_page_config(page_title="Unit Study Assistant", page_icon="🎓", layout="centered")

def init_db():
    """Initializes the SQLite database for permanent task storage."""
    conn = sqlite3.connect('planner.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS tasks (Task TEXT, Date TEXT, Done BOOLEAN)''')
    conn.commit()
    conn.close()

init_db()

# ==========================================
# 2. AI TOOLS (FUNCTION CALLING)
# ==========================================
def add_task(task_name: str, days_from_now: int) -> str:
    due_date = datetime.date.today() + datetime.timedelta(days=days_from_now)
    conn = sqlite3.connect('planner.db')
    c = conn.cursor()
    c.execute("INSERT INTO tasks (Task, Date, Done) VALUES (?, ?, ?)", (task_name, str(due_date), False))
    conn.commit()
    conn.close()
    return f"Successfully added '{task_name}' due on {due_date}."

def generate_image_tool(prompt_description: str) -> str:
    genai_client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])
    with st.spinner("Drawing image with Google Imagen 3..."):
        response = genai_client.models.generate_images(
            model='imagen-3.0-generate-002',
            prompt=prompt_description,
            config=types.GenerateImagesConfig(number_of_images=1, aspect_ratio="1:1", output_mime_type="image/jpeg")
        )
    st.session_state.latest_generated_image = response.generated_images[0].image
    return "Success! The image is saved."

def web_search_tool(search_query: str) -> str:
    with st.spinner(f"Searching web for: {search_query}..."):
        try:
            results = DDGS().text(search_query, max_results=3)
            return "\n\n".join([f"Title: {r['title']}\nSnippet: {r['body']}\nLink: {r['href']}" for r in results]) if results else "No results found."
        except Exception as e:
            return f"Search error: {e}"

def get_market_data(ticker_symbol: str) -> str:
    with st.spinner(f"Fetching market data for {ticker_symbol}..."):
        try:
            stock = yf.Ticker(ticker_symbol)
            info = stock.info
            price = info.get('currentPrice', info.get('regularMarketPrice', 'N/A'))
            high = info.get('dayHigh', 'N/A')
            low = info.get('dayLow', 'N/A')
            return f"Data for {ticker_symbol}: Current Price: ₹{price}, Day High: ₹{high}, Day Low: ₹{low}"
        except Exception as e:
            return f"Could not fetch data for {ticker_symbol}. Error: {e}"

def get_youtube_transcript(video_url: str) -> str:
    with st.spinner("Extracting YouTube transcript..."):
        try:
            video_id = video_url.split("v=")[1].split("&")[0] if "v=" in video_url else video_url.split("youtu.be/")[1].split("?")[0]
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            transcript_text = " ".join([t['text'] for t in transcript_list])
            return transcript_text[:5000] + "... [Transcript truncated for memory]"
        except Exception as e:
            return f"Could not fetch transcript. Make sure the video has closed captions. Error: {e}"

# ==========================================
# 3. SIDEBAR AUTHENTICATION & NAVIGATION
# ==========================================
with st.sidebar:
    st.header("🔐 Account Setup")
    
    # Show Login Form if NOT logged in
    if not st.session_state.get("password_correct", False):
        with st.form("sidebar_login_form"):
            username_input = st.text_input("Username").strip()
            password_input = st.text_input("Password", type="password")
            submit_button = st.form_submit_button("Login")

        if submit_button:
            if username_input in st.secrets["passwords"] and password_input == st.secrets["passwords"][username_input]:
                st.session_state["password_correct"] = True
                st.session_state["current_user"] = username_input 
                
                # Log the entry
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                log_entry = f"{timestamp},{username_input}\n"
                with open("login_logs.csv", "a") as file:
                    file.write(log_entry)
                st.rerun()
            else:
                st.error("Incorrect username or password.")
                
    # Show Logout and Tools if LOGGED IN
    else:
        st.success(f"Welcome back, **{st.session_state.current_user}**!")
        if st.button("🚪 Logout", use_container_width=True):
            st.session_state["password_correct"] = False
            st.session_state["current_user"] = None
            st.rerun()
            
        st.divider()
        st.header("📄 Upload Course Materials")
        uploaded_files = st.file_uploader("Upload PDFs", type=['pdf'], accept_multiple_files=True)
        
        if "ai_files" not in st.session_state: st.session_state.ai_files = []

        if uploaded_files and st.button("Process Files"):
            client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])
            with st.spinner("Uploading..."):
                for uploaded_file in uploaded_files:
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                        temp_file.write(uploaded_file.read())
                        temp_file_path = temp_file.name
                    st.session_state.ai_files.append(client.files.upload(file=temp_file_path))
                    os.remove(temp_file_path)
                st.success("Files ready!")

        st.divider()
        if st.button("🗑️ Clear Chat & Memory"):
            st.session_state.messages = []
            st.session_state.ai_files = []
            if "chat_session" in st.session_state: del st.session_state.chat_session
            if "latest_generated_image" in st.session_state: del st.session_state.latest_generated_image
            st.rerun()
            
        st.divider()
        creativity_level = st.slider("Creativity Level (Temperature)", 0.0, 1.0, 0.3, 0.1)

        # ADMIN LOGS
        if st.session_state.current_user == "admin":
            st.divider()
            if st.button("📂 View Login Logs", use_container_width=True):
                st.header("Security Logs")
                try:
                    st.dataframe(pd.read_csv("login_logs.csv", names=["Timestamp", "Username"]), use_container_width=True)
                except FileNotFoundError:
                    st.info("No logins recorded yet!")

# ==========================================
# 4. THE MAIN APPLICATION (GATED)
# ==========================================
st.title("🎓 Unit Study Assistant (Pro)")

# Stop rendering the rest of the page if not logged in
if not st.session_state.get("password_correct", False):
    st.info("👈 Please log in using the sidebar to access your study assistant.")
    st.stop()

# --- Everything below this line only runs if logged in ---
client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])

tab1, tab2 = st.tabs(["💬 Chat & Tools", "📅 Permanent Planner"])

# --- TAB 2: SQLITE SCHEDULER ---
with tab2:
    st.header("Upcoming Tasks & Assignments")
    conn = sqlite3.connect('planner.db')
    df = pd.read_sql_query("SELECT * FROM tasks", conn)
    if not df.empty:
        df['Done'] = df['Done'].astype(bool) 
    
    edited_df = st.data_editor(
        df,
        column_config={"Done": st.column_config.CheckboxColumn("Completed?", default=False), "Date": st.column_config.DateColumn("Due Date")},
        hide_index=True, use_container_width=True, num_rows="dynamic"
    )
    
    if not edited_df.equals(df):
        edited_df.to_sql('tasks', conn, if_exists='replace', index=False)
    conn.close()

# --- TAB 1: CHAT INTERFACE ---
with tab1:
    conn = sqlite3.connect('planner.db')
    current_schedule_text = pd.read_sql_query("SELECT * FROM tasks", conn).to_string()
    conn.close()

    if "chat_session" not in st.session_state:
        st.session_state.chat_session = client.chats.create(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=f"""
                    You are a highly advanced college study assistant and personal dashboard.
                    Here is the user's current schedule:\n{current_schedule_text}
                    
                    CRITICAL OVERRIDES & TOOLS:
                    1. FILE READING: You MUST read uploaded PDFs. NEVER claim you cannot see files.
                    2. IMAGE GENERATION: Use `generate_image_tool` for any visual requests.
                    3. WEB SEARCH: Use `web_search_tool` for current events or unknown facts.
                    4. MARKET DATA: Use `get_market_data` for stock queries. Remember to append '.NS' for Indian stocks.
                    5. YOUTUBE: Use `get_youtube_transcript` if the user provides a YouTube link.
                    6. FLASHCARDS: If the user asks for flashcards, output pure CSV format (Term,Definition) so they can save it cleanly.
                """,
                tools=[add_task, generate_image_tool, web_search_tool, get_market_data, get_youtube_transcript]
            )
        )

    if "messages" not in st.session_state: st.session_state.messages = []
    chat_container = st.container()

    with chat_container:
        for msg in st.session_state.messages:
            with st.chat_message(msg["role"], avatar="🧑‍💻" if msg["role"] == "user" else "🦉"):
                if msg.get("is_image"): st.image(msg["content"])
                else: st.markdown(msg["content"])

    audio_value = st.audio_input("Record a voice command")
    user_text_input = st.chat_input("E.g., Summarize this YouTube link, or check Nifty 50...")
    user_input = audio_value if audio_value else user_text_input
    is_audio = bool(audio_value)
        
    if user_input:
        with chat_container:
            with st.chat_message("user", avatar="🧑‍💻"):
                st.markdown("🎤 *Sent an audio message*" if is_audio else user_input)
                st.session_state.messages.append({"role": "user", "content": "🎤 *Sent an audio message*" if is_audio else user_input, "is_image": False})
            
            with st.chat_message("assistant", avatar="🦉"):
                message_bundle = st.session_state.ai_files.copy()
                st.session_state.ai_files = [] 
                
                if is_audio:
                    with st.spinner("Listening..."):
                        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
                            temp_audio.write(user_input.read())
                            temp_audio_path = temp_audio.name
                        message_bundle.append(client.files.upload(file=temp_audio_path))
                else:
                    message_bundle.append(user_input)
                
                with st.spinner("Processing..."):
                    try:
                        response = st.session_state.chat_session.send_message(message_bundle, config=types.GenerateContentConfig(temperature=creativity_level))
                    except Exception as e:
                        st.error("🚨 Error!")
                        st.json(getattr(e, 'response_json', str(e)))
                        st.stop()
                
                st.markdown(response.text)
                st.session_state.messages.append({"role": "assistant", "content": response.text, "is_image": False})
                
                is_csv = "," in response.text and "Term" in response.text
                st.download_button(
                    label="💾 Download as Flashcards (CSV)" if is_csv else "💾 Download Notes",
                    data=response.text,
                    file_name="flashcards.csv" if is_csv else "study_notes.txt",
                    mime="text/csv" if is_csv else "text/plain",
                    key=f"dl_{len(st.session_state.messages)}" 
                )

                if "latest_generated_image" in st.session_state:
                    st.image(st.session_state.latest_generated_image, caption="Generated by Google Imagen 3")
                    st.session_state.messages.append({"role": "assistant", "content": st.session_state.latest_generated_image, "is_image": True})
                    del st.session_state.latest_generated_image
            
            if is_audio: os.remove(temp_audio_path)

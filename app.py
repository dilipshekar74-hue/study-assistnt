import streamlit as st
from google import genai
from google.genai import types
from duckduckgo_search import DDGS
import yfinance as yf
from youtube_transcript_api import YouTubeTranscriptApi
from PIL import Image
from gtts import gTTS
from supabase import create_client, Client
import tempfile
import os
import pandas as pd
import datetime
import random 
import hashlib # <-- NEW: For encrypting user passwords!

# ==========================================
# 1. PAGE SETUP & UI THEME
# ==========================================
st.set_page_config(page_title="Ved.ai", page_icon="🕉️", layout="centered")

def apply_indian_theme():
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Rozha+One&display=swap');

        .stApp {
            background-color: #FDFBF7;
            background-image: url("https://www.transparenttextures.com/patterns/arabesque.png");
            background-attachment: fixed;
        }

        p, li, span, label, div[data-testid="stMarkdownContainer"] {
            color: #2D1A11 !important;
        }

        input, textarea, [data-baseweb="input"] {
            color: #2D1A11 !important;
            background-color: #FFFFFF !important;
            -webkit-text-fill-color: #2D1A11 !important;
        }

        [data-testid="stSidebar"] {
            background-color: #F4EFE6 !important;
            background-image: url("https://www.transparenttextures.com/patterns/arabesque.png");
            border-right: 2px solid #E37D00;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: 'Rozha One', serif !important;
            color: #8B0000 !important; 
        }

        .stApp h1:first-child {
            text-align: center;
            border-bottom: 2px solid #D4AF37; 
            padding-bottom: 10px;
            margin-bottom: 30px;
        }

        [data-testid="stChatMessage"]:nth-child(even) {
            background-color: rgba(254, 249, 240, 0.95); 
            border-left: 4px solid #E37D00; 
            border-radius: 5px;
            padding: 15px;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.05);
        }

        [data-testid="stChatMessage"]:nth-child(odd) {
            background-color: rgba(255, 255, 255, 0.95);
            border-right: 4px solid #D4AF37; 
            border-radius: 5px;
            padding: 15px;
        }

        .stButton>button {
            border-radius: 20px;
            border: 1px solid #E37D00;
            background-color: #FEF9F0 !important;
            color: #8B0000 !important;
            transition: all 0.3s ease;
        }
        .stButton>button:hover {
            box-shadow: 0px 4px 10px rgba(227, 125, 0, 0.4);
            transform: translateY(-2px);
            border: 1px solid #8B0000 !important;
            color: #E37D00 !important;
        }
        </style>
    """, unsafe_allow_html=True)

apply_indian_theme()

# ==========================================
# 2. CLOUD DATABASE INIT & SECURITY
# ==========================================
@st.cache_resource
def init_connection():
    url = st.secrets["SUPABASE_URL"]
    key = st.secrets["SUPABASE_KEY"]
    return create_client(url, key)

supabase: Client = init_connection()

def hash_password(password):
    """Encrypts the password before saving it to the database."""
    return hashlib.sha256(password.encode()).hexdigest()

# ==========================================
# 3. AI TOOLS (FUNCTION CALLING)
# ==========================================
def add_task(task_name: str, days_from_now: int) -> str:
    due_date = datetime.date.today() + datetime.timedelta(days=days_from_now)
    current_user = st.session_state.get("current_user", "unknown")
    supabase.table("tasks").insert({"task": task_name, "date": str(due_date), "done": False, "username": current_user}).execute()
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
# 4. SIDEBAR LOGO, DYNAMIC AUTH & NAVIGATION
# ==========================================
with st.sidebar:
    st.image("https://images.unsplash.com/photo-1599566219269-40b0f763cb35?q=80&w=800&auto=format&fit=crop", use_column_width=True)
    st.title("🕉️ Ved.ai")
    st.divider()
    
    # --- NEW DYNAMIC LOGIN/SIGNUP SYSTEM ---
    if not st.session_state.get("password_correct", False):
        st.header("🔐 Access Ved.ai")
        tab_login, tab_signup = st.tabs(["Login", "Sign Up"])
        
        # --- LOGIN TAB ---
        with tab_login:
            with st.form("login_form"):
                log_user = st.text_input("Username").strip()
                log_pass = st.text_input("Password", type="password")
                log_submit = st.form_submit_button("Login")
                
                if log_submit:
                    hashed_pass = hash_password(log_pass)
                    # Query Supabase to see if user/pass match exists
                    response = supabase.table("users").select("*").eq("username", log_user).eq("password", hashed_pass).execute()
                    
                    if response.data:
                        st.session_state["password_correct"] = True
                        st.session_state["current_user"] = log_user
                        
                        # Save to admin logs
                        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        with open("login_logs.csv", "a") as file:
                            file.write(f"{timestamp},{log_user}\n")
                        st.rerun()
                    else:
                        st.error("Incorrect username or password.")
                        
        # --- SIGN UP TAB ---
        with tab_signup:
            with st.form("signup_form"):
                new_user = st.text_input("Choose a Username").strip()
                new_pass = st.text_input("Choose a Password", type="password")
                sign_submit = st.form_submit_button("Create Account")
                
                if sign_submit:
                    if len(new_user) < 3 or len(new_pass) < 4:
                        st.error("Username must be 3+ chars, Password must be 4+ chars.")
                    else:
                        # Check if username is already taken in the database
                        check_user = supabase.table("users").select("*").eq("username", new_user).execute()
                        if check_user.data:
                            st.warning("That username is already taken! Try another.")
                        else:
                            # Encrypt password and save to database!
                            hashed_new_pass = hash_password(new_pass)
                            supabase.table("users").insert({"username": new_user, "password": hashed_new_pass}).execute()
                            st.success("Account created successfully! You can now log in.")
                            
    # --- THE REST OF THE SIDEBAR (ONLY SHOWS IF LOGGED IN) ---
    else:
        st.success(f"Welcome back, **{st.session_state.current_user}**!")
        if st.button("🚪 Logout", width="stretch"):
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
        st.header("🎛️ AI Settings")
        creativity_level = st.slider("Creativity Level", 0.0, 1.0, 0.3, 0.1)
        
        enable_voice = st.toggle("🔊 Enable AI Voice Response", value=False)

        # The first person to create the account 'admin' gets access to the logs!
        if st.session_state.current_user == "admin":
            st.divider()
            if st.button("📂 View Login Logs", width="stretch"):
                st.header("Security Logs")
                try:
                    st.dataframe(pd.read_csv("login_logs.csv", names=["Timestamp", "Username"]), width="stretch")
                except FileNotFoundError:
                    st.info("No logins recorded yet!")

# ==========================================
# 5. THE MAIN APPLICATION (GATED)
# ==========================================
st.title("✨ Ved.ai")

if not st.session_state.get("password_correct", False):
    st.info("👈 Please log in or create an account using the sidebar to access Ved.ai.")
    st.stop()

current_username = st.session_state.current_user
client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])

tab1, tab2 = st.tabs(["💬 Chat & Tools", "📅 Cloud Planner"])

with tab2:
    st.header("Upcoming Tasks & Assignments")
    
    response = supabase.table("tasks").select("*").eq("username", current_username).execute()
    df = pd.DataFrame(response.data)
    
    if df.empty:
        df = pd.DataFrame(columns=["id", "task", "date", "done", "username"])
    else:
        df['done'] = df['done'].astype(bool) 
        df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.date
    
    edited_df = st.data_editor(
        df,
        column_config={
            "id": None, 
            "username": None,
            "done": st.column_config.CheckboxColumn("Completed?", default=False), 
            "date": st.column_config.DateColumn("Due Date")
        },
        hide_index=True, 
        width="stretch", 
        num_rows="dynamic"
    )
    
    if not edited_df.equals(df):
        for index, row in edited_df.iterrows():
            if pd.notna(row.get("task")) and str(row.get("task")).strip() != "":
                if pd.notna(row.get('id')): 
                    supabase.table("tasks").update({"task": str(row["task"]), "date": str(row["date"]), "done": bool(row["done"])}).eq("id", row["id"]).execute()
                else:
                    supabase.table("tasks").insert({"task": str(row["task"]), "date": str(row["date"]), "done": bool(row["done"]), "username": current_username}).execute()
        st.rerun()

with tab1:
    db_response = supabase.table("tasks").select("*").eq("username", current_username).execute()
    clean_df = pd.DataFrame(db_response.data).drop(columns=['id', 'username'], errors='ignore') if db_response.data else pd.DataFrame()
    current_schedule_text = clean_df.to_string(index=False) if not clean_df.empty else "No tasks currently scheduled."

    if "chat_session" not in st.session_state:
        st.session_state.chat_session = client.chats.create(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=f"""
                    You are Ved.ai, a highly advanced college study assistant and personal dashboard.
                    Here is the user's current schedule:\n{current_schedule_text}
                    
                    CRITICAL OVERRIDES & TOOLS:
                    1. FILE READING: You MUST read uploaded PDFs. NEVER claim you cannot see files.
                    2. IMAGE GENERATION: Use `generate_image_tool` for any visual requests.
                    3. WEB SEARCH: Use `web_search_tool` for current events or unknown facts.
                    4. MARKET DATA: Use `get_market_data` for stock queries. Remember to append '.NS' for Indian stocks.
                    5. YOUTUBE: Use `get_youtube_transcript` if the user provides a YouTube link.
                    6. FLASHCARDS: If the user asks for flashcards, output pure CSV format (Term,Definition).
                    7. VISION: You can see images uploaded by the user. Analyze them carefully.
                """,
                tools=[add_task, generate_image_tool, web_search_tool, get_market_data, get_youtube_transcript]
            )
        )

    if "messages" not in st.session_state: st.session_state.messages = []
    chat_container = st.container()

    with chat_container:
        for msg in st.session_state.messages:
            with st.chat_message(msg["role"], avatar="🧑‍💻" if msg["role"] == "user" else "🕉️"):
                if msg.get("is_image"): st.image(msg["content"], width=300)
                else: st.markdown(msg["content"])
                
                if msg.get("audio_file"):
                    st.audio(msg["audio_file"], format="audio/mp3")

    with st.expander("📸 Take a Picture (Notes, Whiteboards, Math Problems)"):
        camera_photo = st.camera_input("Snap a photo to send to Ved.ai")

    audio_value = st.audio_input("Record a voice command")
    
    prompt_ideas = [
        "E.g., Summarize this YouTube link...",
        "E.g., Check the Nifty 50 performance today...",
        "E.g., Search the web for recent AI news...",
        "E.g., Solve the math problem in the photo...",
        "E.g., Draw a diagram of a CPU architecture...",
        "E.g., Create 5 flashcards from my PDF notes...",
        "E.g., Add 'Review Asymptotic Notation' to my planner..."
    ]
    
    if "current_placeholder" not in st.session_state:
        st.session_state.current_placeholder = random.choice(prompt_ideas)
    
    user_text_input = st.chat_input(st.session_state.current_placeholder)
    user_input = audio_value if audio_value else user_text_input
    is_audio = bool(audio_value)
        
    if user_input:
        with chat_container:
            with st.chat_message("user", avatar="🧑‍💻"):
                message_bundle = st.session_state.ai_files.copy()
                st.session_state.ai_files = [] 
                
                if camera_photo:
                    img = Image.open(camera_photo)
                    st.image(img, caption="Camera Upload", width=300)
                    st.session_state.messages.append({"role": "user", "content": img, "is_image": True})
                    message_bundle.append(img)
                
                st.markdown("🎤 *Sent an audio message*" if is_audio else user_input)
                st.session_state.messages.append({"role": "user", "content": "🎤 *Sent an audio message*" if is_audio else user_input, "is_image": False})
            
            with st.chat_message("assistant", avatar="🕉️"):
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
                
                audio_path_to_save = None
                if enable_voice:
                    with st.spinner("Generating voice..."):
                        tts = gTTS(text=response.text.replace('*', ''), lang='en', tld='co.in')
                        temp_tts_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
                        tts.save(temp_tts_file.name)
                        audio_path_to_save = temp_tts_file.name
                        st.audio(temp_tts_file.name, format="audio/mp3", autoplay=True)
                
                st.session_state.messages.append({
                    "role": "assistant", 
                    "content": response.text, 
                    "is_image": False,
                    "audio_file": audio_path_to_save
                })
                
                is_csv = "," in response.text and "Term" in response.text
                st.download_button(
                    label="💾 Download as Flashcards (CSV)" if is_csv else "💾 Download Notes",
                    data=response.text,
                    file_name="flashcards.csv" if is_csv else "study_notes.txt",
                    mime="text/csv" if is_csv else "text/plain",
                    key=f"dl_{len(st.session_state.messages)}" 
                )

                if "latest_generated_image" in st.session_state:
                    st.image(st.session_state.latest_generated_image, caption="Generated by Google Imagen 3", width=300)
                    st.session_state.messages.append({"role": "assistant", "content": st.session_state.latest_generated_image, "is_image": True})
                    del st.session_state.latest_generated_image
            
            if is_audio: os.remove(temp_audio_path)
            
            st.session_state.current_placeholder = random.choice(prompt_ideas)
            st.rerun()

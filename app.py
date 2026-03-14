import streamlit as st
from google import genai
from google.genai import types
from duckduckgo_search import DDGS
import tempfile
import os
import pandas as pd
import datetime

# ==========================================
# 1. PAGE SETUP
# ==========================================
st.set_page_config(page_title="Unit Study Assistant", page_icon="🎓", layout="centered")

# ==========================================
# 2. SECURITY, LOGIN & TRACKING
# ==========================================
def check_password():
    """Returns True if the user has the correct password and logs the entry."""
    if st.session_state.get("password_correct", False):
        return True

    st.title("🔒 Login Required")
    
    with st.form("login_form"):
        username_input = st.text_input("Username").strip()
        password_input = st.text_input("Password", type="password")
        submit_button = st.form_submit_button("Login")

    if submit_button:
        # Check if username exists and password matches
        if username_input in st.secrets["passwords"] and password_input == st.secrets["passwords"][username_input]:
            st.session_state["password_correct"] = True
            st.session_state["current_user"] = username_input 
            
            # --- The Tracker ---
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_entry = f"{timestamp},{username_input}\n"
            with open("login_logs.csv", "a") as file:
                file.write(log_entry)
                
            st.rerun()
        else:
            st.error("Incorrect username or password. Please try again.")
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
    genai_client = genai.Client(api_key=st.secrets["GEMINI_API_KEY"])
    with st.spinner("Drawing image with Google Imagen 3..."):
        response = genai_client.models.generate_images(
            model='imagen-3.0-generate-002',
            prompt=prompt_description,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
                output_mime_type="image/jpeg"
            )
        )
    st.session_state.latest_generated_image = response.generated_images[0].image
    return "Success! The image is saved. Politely tell the user you have drawn it."

def web_search_tool(search_query: str) -> str:
    """Searches the live web for real-time information, news, or facts."""
    with st.spinner(f"Searching the web for: {search_query}..."):
        try:
            results = DDGS().text(search_query, max_results=3)
            if not results:
                return "No search results found."
            
            search_summary = ""
            for res in results:
                search_summary += f"Title: {res['title']}\nSnippet: {res['body']}\nSource: {res['href']}\n\n"
            return search_summary
        except Exception as e:
            return f"An error occurred while searching: {e}"

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
        
        if "ai_files" not in st.session_state:
            st.session_state.ai_files = []

        if uploaded_files and st.button("Process Files"):
            with st.spinner("Uploading to your assistant..."):
                for uploaded_file in uploaded_files:
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                        temp_file.write(uploaded_file.read())
                        temp_file_path = temp_file.name
                    
                    g_file = client.files.upload(file=temp_file_path)
                    st.session_state.ai_files.append(g_file)
                    os.remove(temp_file_path)
                st.success("Files read and ready for analysis!")

        st.divider()
        if st.button("🗑️ Clear Chat & Memory"):
            st.session_state.messages = []
            st.session_state.ai_files = []
            if "chat_session" in st.session_state:
                del st.session_state.chat_session
            if "latest_generated_image" in st.session_state:
                del st.session_state.latest_generated_image
            st.session_state.schedule = pd.DataFrame(columns=["Task", "Date", "Done"])
            st.rerun()
            
        st.divider()
        st.header("🎛️ AI Settings")
        creativity_level = st.slider("Creativity Level (Temperature)", 0.0, 1.0, 0.3, 0.1)

        # --- ADMIN DASHBOARD ---
        st.divider()
        st.write(f"👤 Logged in as: **{st.session_state.current_user}**")
        
        if st.session_state.current_user == "admin":
            if st.button("📂 View Login Logs"):
                st.header("Security Logs")
                try:
                    logs_df = pd.read_csv("login_logs.csv", names=["Timestamp", "Username"])
                    st.dataframe(logs_df, use_container_width=True)
                except FileNotFoundError:
                    st.info("No logins recorded yet!")

    # --- THE TAB LAYOUT ---
    tab1, tab2 = st.tabs(["💬 Chat & Study", "📅 Daily Planner"])

    # --- TAB 2: THE SCHEDULER ---
    with tab2:
        st.header("Upcoming Tasks & Assignments")
        
        if "schedule" not in st.session_state:
            st.session_state.schedule = pd.DataFrame(columns=["Task", "Date", "Done"])

        st.session_state.schedule = st.data_editor(
            st.session_state.schedule,
            column_config={
                "Done": st.column_config.CheckboxColumn("Completed?", default=False),
                "Date": st.column_config.DateColumn("Due Date")
            },
            hide_index=True,
            use_container_width=True,
            num_rows="dynamic" 
        )

    # --- TAB 1: THE CHAT INTERFACE ---
    with tab1:
        current_schedule_text = st.session_state.schedule.to_string()

        # 1. Initialize Memory and Brain
        if "chat_session" not in st.session_state:
            st.session_state.chat_session = client.chats.create(
                model="gemini-2.5-flash",
                config=types.GenerateContentConfig(
                    system_instruction=f"""
                        You are a helpful college study assistant. Analyze documents to answer questions. 
                        
                        Here is the user's current schedule:\n{current_schedule_text}
                        
                        CRITICAL OVERRIDES & TOOLS:
                        1. FILE READING: You CAN and MUST read any uploaded documents and PDFs provided in the chat history. NEVER claim you cannot read or see files.
                        2. IMAGE GENERATION: You DO NOT have the ability to generate images natively. If the user asks for a picture, drawing, diagram, or visual, YOU MUST NOT REFUSE. You must immediately execute the `generate_image_tool`.
                        3. LIVE WEB SEARCH: If the user asks about current events, live data, or something you do not know, you MUST use the `web_search_tool` to find the answer. Always cite your sources using the links provided by the tool.
                    """,
                    tools=[add_task, generate_image_tool, web_search_tool]
                )
            )

        if "messages" not in st.session_state:
            st.session_state.messages = []

        chat_container = st.container()

        # 2. Display Chat History INSIDE the safe container
        with chat_container:
            for msg in st.session_state.messages:
                avatar_icon = "🧑‍💻" if msg["role"] == "user" else "🦉"
                with st.chat_message(msg["role"], avatar=avatar_icon):
                    if msg.get("is_image"):
                        st.image(msg["content"], caption="Generated by Google Imagen 3")
                    else:
                        st.markdown(msg["content"])

        # 3. The Input Widgets 
        audio_value = st.audio_input("Record a voice command")
        user_text_input = st.chat_input("E.g., What is the latest news on...")
        
        user_input = None
        is_audio = False
        
        if audio_value:
            user_input = audio_value
            is_audio = True
        elif user_text_input:
            user_input = user_text_input
            
        # 4. Process the Input
        if user_input:
            with chat_container:
                with st.chat_message("user", avatar="🧑‍💻"):
                    if is_audio:
                        st.markdown("🎤 *Sent an audio message*")
                        st.session_state.messages.append({"role": "user", "content": "🎤 *Sent an audio message*", "is_image": False})
                    else:
                        st.markdown(user_input)
                        st.session_state.messages.append({"role": "user", "content": user_input, "is_image": False})
                
                with st.chat_message("assistant", avatar="🦉"):
                    message_bundle = st.session_state.ai_files.copy()
                    st.session_state.ai_files = [] 
                    
                    if is_audio:
                        with st.spinner("Listening..."):
                            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
                                temp_audio.write(user_input.read())
                                temp_audio_path = temp_audio.name
                            
                            g_audio_file = client.files.upload(file=temp_audio_path)
                            message_bundle.append(g_audio_file)
                    else:
                        message_bundle.append(user_input)
                    
                    with st.spinner("Thinking..."):
                        try:
                            response = st.session_state.chat_session.send_message(
                                message_bundle,
                                config=types.GenerateContentConfig(temperature=creativity_level)
                            )
                        except Exception as e:
                            st.error("🚨 Google API Error!")
                            st.write("Streamlit hid the real error, but here are the exact details from Google:")
                            if hasattr(e, 'response_json'):
                                st.json(e.response_json)
                            else:
                                st.write(str(e))
                            st.stop()
                    
                    st.markdown(response.text)
                    st.session_state.messages.append({
                        "role": "assistant", 
                        "content": response.text,
                        "is_image": False
                    })
                    
                    st.download_button(
                        label="💾 Download this response",
                        data=response.text,
                        file_name="study_notes.txt",
                        mime="text/plain",
                        key=f"download_{len(st.session_state.messages)}" 
                    )

                    if "latest_generated_image" in st.session_state:
                        image_data = st.session_state.latest_generated_image
                        
                        st.image(image_data, caption="Generated by Google Imagen 3")
                        
                        st.session_state.messages.append({
                            "role": "assistant", 
                            "content": image_data,
                            "is_image": True
                        })
                        
                        del st.session_state.latest_generated_image
                
                if is_audio:
                    os.remove(temp_audio_path)

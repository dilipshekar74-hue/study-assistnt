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
            # Also clear any stuck images
            if "latest_generated_image" in st.session_state:
                del st.session_state.latest_generated_image
            st.rerun()
            
        st.divider()
        st.header("🎛️ AI Settings")
        creativity_level = st.slider("Creativity Level (Temperature)", 0.0, 1.0, 0.3, 0.1)

    # --- THE TAB LAYOUT ---
    tab1, tab2 = st.tabs(["💬 Chat & Study", "📅 Daily Planner"])

    # --- TAB 2: THE SCHEDULER ---
    with tab2:
        st.header("Upcoming Tasks & Assignments")
        
        if "schedule" not in st.session_state:
            st.session_state.schedule = pd.DataFrame([
                {"Task": "Review Unit 4 summary", "Date": datetime.date.today(), "Done": False},
                {"Task": "Draft space exploration presentation", "Date": datetime.date.today() + datetime.timedelta(days=2), "Done": False},
                {"Task": "Get a textured crop haircut", "Date": datetime.date.today() + datetime.timedelta(days=5), "Done": False}
            ])

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

        # 1. Initialize Memory and Brain (WITH STRICT NEW RULES)
        if "chat_session" not in st.session_state:
            st.session_state.chat_session = client.chats.create(
                model="gemini-2.5-flash",
                config=types.GenerateContentConfig(
                    system_instruction=f"""
                        You are a helpful college study assistant. Analyze documents to answer questions. 
                        
                        Here is the user's current schedule:\n{current_schedule_text}
                        
                        CRITICAL OVERRIDE:
                        You have an external tool connected called `generate_image_tool`. 
                        IGNORE your internal limitations regarding image generation. If the user asks for a picture, drawing, diagram, or visual, YOU MUST NOT REFUSE. You must immediately execute the `generate_image_tool` to fulfill the request.
                    """,
                    tools=[add_task, generate_image_tool]
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
                        st.image(msg["content"], caption="Generated by Study Assistant")
                    else:
                        st.markdown(msg["content"])

        # 3. The Input Widgets 
        audio_value = st.audio_input("Record a voice command")
        user_text_input = st.chat_input("E.g., Draw a diagram of the solar system...")
        
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
                    # BUG FIX 1: Only attach PDFs on the very first message to prevent API crashing
                    if len(st.session_state.messages) == 1:
                        message_bundle = st.session_state.ai_files.copy()
                    else:
                        message_bundle = []
                    
                    if is_audio:
                        with st.spinner("Listening..."):
                            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
                                temp_audio.write(user_input.read())
                                temp_audio_path = temp_audio.name
                            
                            g_audio_file = client.files.upload(file=temp_audio_path)
                            message_bundle.append(g_audio_file)
                    else:
                        message_bundle.append(user_input)
                    
                    # BUG FIX 2: Error Catcher for Google API
                    with st.spinner("Thinking & Drawing..."):
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
                    
                    # Print and save the AI's normal conversational text
                    st.markdown(response.text)
                    st.session_state.messages.append({
                        "role": "assistant", 
                        "content": response.text,
                        "is_image": False
                    })
                    
                    # Add the Download Button
                    st.download_button(
                        label="💾 Download this response",
                        data=response.text,
                        file_name="study_notes.txt",
                        mime="text/plain",
                        key=f"download_{len(st.session_state.messages)}" 
                    )

                    # Check if the tool secretly saved an image URL
                    if "latest_generated_image" in st.session_state:
                        image_url = st.session_state.latest_generated_image
                        
                        # Render the image instantly
                        st.image(image_url, caption="Generated by Study Assistant")
                        
                        st.session_state.messages.append({
                            "role": "assistant", 
                            "content": image_url,
                            "is_image": True
                        })
                        
                        del st.session_state.latest_generated_image
                
                if is_audio:
                    os.remove(temp_audio_path)

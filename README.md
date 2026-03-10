# 🎓 Unit Study Assistant (AI Agent)

An intelligent, full-stack college study assistant built with Python and Streamlit. 

This isn't just a standard chatbot. This application utilizes **Retrieval-Augmented Generation (RAG)** to read custom lecture PDFs, **Function Calling** to manage an interactive daily planner, and **Multimodal capabilities** to process direct voice commands.

[Image of Streamlit app screenshot in GitHub README]
*(Note: Replace the line above with an actual screenshot or GIF of your app!)*

## ✨ Key Features

* **📄 Document Analysis (RAG):** Upload multiple course PDFs simultaneously. The AI reads the documents in real-time to summarize units, extract practice questions, and explain complex concepts based *only* on the provided materials.
* **📅 AI Task Scheduler:** Features an interactive daily planner built with Pandas. Using Google's Gemini API function calling, the AI can securely trigger Python backend functions to automatically add assignments and due dates to the schedule based on natural language requests.
* **🎙️ Voice Commands:** Integrated with Streamlit's audio input and Gemini's multimodal audio processing. You can speak directly to the assistant without needing to type.
* **🧠 Long-Term Memory:** Maintains a continuous chat session state, allowing for complex, multi-turn conversations and follow-up questions.
* **🔒 Secure Access:** Built-in password authentication to protect API quotas and keep study materials private.

## 🛠️ Tech Stack

* **Frontend & UI:** Streamlit
* **AI Model & SDK:** Google Gemini 2.5 Flash (`google-genai` SDK)
* **Data Management:** Pandas (for the interactive planner)

## 🚀 How to Run Locally

If you want to clone this repository and run it on your own machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git](https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git)
   cd YOUR-REPO-NAME

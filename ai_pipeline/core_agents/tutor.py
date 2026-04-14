import os
from langchain_core.prompts import PromptTemplate  # <-- THE MODERN IMPORT FIX
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

# Initialize the core LLM - using a fast model for chat routing
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", # Swap to GPT-4o or Gemini Pro for complex evaluation
    temperature=0.3,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# The Socratic Moat
SOCRATIC_PROMPT = """
You are an elite AI Tutor. Your goal is to help the student learn, NOT to just give them the answers.
Student Query: {query}
Context from Vector DB: {context}
Student Weaknesses from Knowledge Graph: {weaknesses}

Instructions:
1. Do not provide the direct answer immediately.
2. Ask a guiding question based on the student's known weaknesses.
3. Use the Socratic method.
"""

prompt = PromptTemplate(
    input_variables=["query", "context", "weaknesses"],
    template=SOCRATIC_PROMPT
)

def generate_tutor_response(query: str, context: str = "None", weaknesses: str = "None") -> str:
    """
    Drafts the AI response using the Socratic prompt.
    """
    # Hackathon fix: Format the string manually to bypass the LangChain tuple bug
    formatted_prompt = prompt.format(
        query=query, 
        context=context, 
        weaknesses=weaknesses
    )
    
    # Pass the raw formatted string directly to Gemini
    response = llm.invoke(formatted_prompt)
    
    return response.content
import os
import json
from pinecone import Pinecone
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.services.chat_service import get_student_context, get_textbook_context
from dotenv import load_dotenv

load_dotenv()

# Initialize AI Components
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

def generate_personalized_quiz(student_id: str):
    """
    The Master Quiz Logic: Weaknesses + Textbook Context = Personalized MCQ
    """
    # 1. Identify what the student is struggling with (Knowledge Graph)
    weakness_context = get_student_context(student_id)
    
    # 2. Pull textbook content related to those weaknesses (Vector DB)
    textbook_data = get_textbook_context(weakness_context)
    
    # 3. Engineer the Quiz Prompt
    quiz_prompt = f"""
    You are an expert educator. Based on the following textbook material and student weaknesses, 
    generate a 3-question Multiple Choice Quiz (MCQ) in strict JSON format.
    
    Student Weaknesses: {weakness_context}
    Textbook Material: {textbook_data}
    
    JSON structure must be:
    [
      {{
        "question": "string",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "string",
        "explanation": "Socratic explanation of why this is correct"
      }}
    ]
    """
    
    try:
        response = llm.invoke(quiz_prompt)
        # Clean the response to ensure it's pure JSON
        raw_content = response.content.replace('```json', '').replace('```', '').strip()
        return json.loads(raw_content)
    except Exception as e:
        print(f"Quiz Generation Error: {e}")
        return {"error": "Failed to generate quiz"}
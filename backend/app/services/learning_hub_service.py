import os
from langchain_google_genai import ChatGoogleGenerativeAI
from app.services.chat_service import get_student_context, get_textbook_context
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.5)

def generate_study_plan(student_id: str):
    """
    Creates a personalized learning path and summary notes.
    """
    # 1. Fetch student context and relevant textbook data
    weaknesses = get_student_context(student_id)
    content = get_textbook_context(weaknesses)
    
    prompt = f"""
    Based on the following student weaknesses and textbook material, create:
    1. A 3-step Personalized Learning Path.
    2. Condensed 'Cheat Sheet' style Study Notes for the most difficult concept.
    
    Student Weaknesses: {weaknesses}
    Material: {content}
    
    Format the response in clear Markdown.
    """
    
    try:
        response = llm.invoke(prompt)
        return {"content": response.content}
    except Exception as e:
        return {"error": str(e)}
    

def calculate_time_allocation(concepts):
    """
    concepts = [
        {"name": "Thermodynamics", "mastery": 20, "importance": 10},
        {"name": "Cellular Respiration", "mastery": 50, "importance": 8}
    ]
    """
    total_priority = 0
    allocations = []

    # 1. Calculate Raw Priorities
    for c in concepts:
        deficit = 100 - c["mastery"]
        raw_priority = deficit * c["importance"]
        c["raw_priority"] = raw_priority
        total_priority += raw_priority

    # 2. Convert to Percentages
    for c in concepts:
        if total_priority == 0:
            percentage = 0
        else:
            percentage = round((c["raw_priority"] / total_priority) * 100)
        
        allocations.append({
            "topic": c["name"],
            "allocation_percent": percentage
        })

    # Sort so the highest priority is first
    allocations.sort(key=lambda x: x["allocation_percent"], reverse=True)
    return allocations
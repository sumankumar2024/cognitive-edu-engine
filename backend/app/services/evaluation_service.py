# FILE: backend/app/services/evaluation_service.py

import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

# We use temperature=0.2 for evaluation to make the AI more analytical and less creative
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)

def evaluate_assignment(student_id: str, topic: str, submission: str):
    """
    Grades the assignment, provides feedback, and extracts weaknesses 
    to update the Knowledge Graph.
    """
    prompt = f"""
    You are a strict but encouraging AI university professor.
    
    Assignment Topic: {topic}
    Student Submission: {submission}
    
    Evaluate this submission. Return the evaluation STRICTLY as a JSON object with the following keys:
    - "score": An integer from 0 to 10 representing the grade.
    - "feedback": A short, Socratic paragraph explaining the grade and offering constructive feedback.
    - "new_weaknesses": A list of up to 3 specific concepts the student struggled with or misunderstood in this submission. (If the answer is perfect, return an empty list).
    
    Output ONLY valid JSON. No markdown formatting, no extra text.
    """
    
    try:
        response = llm.invoke(prompt)
        
        # Clean the response to ensure it's pure JSON
        raw_content = response.content.replace('```json', '').replace('```', '').strip()
        evaluation_data = json.loads(raw_content)
        
        # ---------------------------------------------------------
        # HACKATHON MOCK: KNOWLEDGE GRAPH UPDATE
        # ---------------------------------------------------------
        # In production, we run this Cypher query to update the student's brain map:
        # MATCH (s:Student {id: $student_id})
        # UNWIND $weaknesses AS weakness
        # MERGE (c:Concept {name: weakness})
        # MERGE (s)-[:STRUGGLES_WITH]->(c)
        
        print(f"Graph DB Update: Added {evaluation_data.get('new_weaknesses')} to {student_id}'s profile.")
        
        return evaluation_data
        
    except Exception as e:
        print(f"Evaluation Error: {e}")
        return {"error": "Failed to evaluate assignment."}
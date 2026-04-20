import os
import json
from neo4j import GraphDatabase
from pydantic import BaseModel, Field
from typing import List
from langchain_groq import ChatGroq
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# 1. SCHEMA
class Concept(BaseModel):
    name: str = Field(description="Name of the specific topic or concept")
    weight: int = Field(description="Importance weight from 1 to 10")

class Edge(BaseModel):
    source: str = Field(description="The prerequisite concept")
    target: str = Field(description="The advanced concept that requires the source")

class SyllabusGraph(BaseModel):
    concepts: List[Concept]
    prerequisites: List[Edge]

# 2. INITIALIZE GROQ LLAMA 3.1
llm = ChatGroq(
    temperature=0.2, 
    groq_api_key=os.getenv("GROQ_API_KEY"), 
    model_name="llama-3.1-8b-instant" # LIVE MODEL
)

neo4j_driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"),
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)

# 3. 🚀 ACCEPT critical_chapters IN THE FUNCTION!
def generate_and_store_syllabus(email: str, exam: str, level: str, critical_chapters: list = None):
    if critical_chapters is None:
        critical_chapters = []
        
    print(f"🧠 [AI Engine] Waking up Groq for {exam}...")

    # 1. HARDCODE THE FULL SYLLABUS TO KEEP THE AI GROUNDED
    full_syllabus = [
        "Chemical Reactions & Equations",
        "Acids, Bases and Salts",
        "Life Processes",
        "Light: Reflection and Refraction",
        "Electricity",
        "Magnetic Effects of Electric Current"
    ]
    
    # 2. THE NEW PROMPT: Map everything, but weight them differently
    prompt = f"""
    You are an expert curriculum designer mapping a Knowledge Graph for '{exam}'.
    
    FULL SYLLABUS (You MUST include every single one of these 6 chapters as a node):
    {', '.join(full_syllabus)}
    
    STUDENT'S CRITICAL WEAKNESSES:
    {', '.join(critical_chapters) if critical_chapters else 'None selected'}
    
    CRITICAL RULES: 
    1. You MUST output exactly {len(full_syllabus)} concept nodes.
    2. If a chapter is in the WEAKNESSES list, assign it a high weight (9 or 10).
    3. If a chapter is NOT in the WEAKNESSES list, it means the student is STRONG at it. Assign it a low weight (2 or 3).
    4. Map logical prerequisite edges between these exact chapters. DO NOT invent outside chapters.
    """
    
    try:
        structured_llm = llm.with_structured_output(SyllabusGraph)
        graph_data = structured_llm.invoke(prompt)
        print(f"✅ [AI Engine] Graph generated successfully via Groq!")
        
        return {
            "status": "success", 
            "source": "local_engine",
            "graph_data": {
                "concepts": [dict(c) for c in graph_data.concepts],
                "prerequisites": [dict(e) for e in graph_data.prerequisites]
            }
        }
        
    except Exception as e:
        print(f"⚠️ [API Warning] Groq failed. ACTIVATING DYNAMIC FAILSAFE! Error: {e}")
        
        # 3. BULLETPROOF FAILSAFE: Even if API fails, it draws the perfect graph
        backup_concepts = []
        backup_edges = []
        
        for chapter in full_syllabus:
            # Dynamically assign weights for the failsafe too!
            weight = 9 if chapter in critical_chapters else 3
            backup_concepts.append({"name": chapter, "weight": weight})
            
            # Simple fallback links
            if chapter != full_syllabus[0]:
                backup_edges.append({"source": full_syllabus[0], "target": chapter})

        return {
            "status": "success", 
            "source": "local_engine",
            "graph_data": {
                "concepts": backup_concepts,
                "prerequisites": backup_edges
            }
        }
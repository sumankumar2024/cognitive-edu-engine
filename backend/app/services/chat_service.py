from neo4j import GraphDatabase
import os
import sys

# --- HACKATHON MONOREPO PATH FIX ---
# This MUST come before we import from ai_pipeline!
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, "../../../"))
sys.path.append(root_dir)
# -----------------------------------

from pinecone import Pinecone
from neo4j import GraphDatabase
from ai_pipeline.core_agents.tutor import generate_tutor_response
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

# Initialize Embeddings for searching the Vector DB
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# Initialize Pinecone Client
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
vector_index = pc.Index("edu-engine-vectors")

# Initialize Neo4j Client
neo4j_driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"), 
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)

def get_student_context(student_id: str = "student_123"):
    """
    Production: Queries the live Neo4j Knowledge Graph to find 
    concepts the student specifically struggles with.
    """
    query = """
    MATCH (s:Student {id: $student_id})-[:STRUGGLES_WITH]->(c:Concept)
    RETURN c.name AS weak_concept
    """
    
    try:
        with neo4j_driver.session() as session:
            result = session.run(query, student_id=student_id)
            weaknesses = [record["weak_concept"] for record in result]
            
            if not weaknesses:
                return {"weaknesses": ["General Science"], "note": "No specific weaknesses recorded yet."}
                
            return {"weaknesses": weaknesses}
    except Exception as e:
        print(f"Graph DB Error: {e}")
        return {"weaknesses": [], "error": "Could not connect to Knowledge Graph"}

# def get_student_context(student_id: str) -> str:
#     """
#     HACKATHON MOCK: Temporarily faking Neo4j to speed up UI development.
#     We will connect the real Graph DB later.
#     """
#     return "The student struggles with: Cellular Respiration and advanced Thermodynamics."

def get_textbook_context(query: str) -> str:
    """
    Queries Pinecone (Vector DB) to find the relevant course material.
    """
    try:
        # Convert the student's question into a vector
        query_vector = embeddings.embed_query(query)
        
        # Search Pinecone for the top 2 most relevant chunks
        results = vector_index.query(
            vector=query_vector,
            top_k=2,
            include_metadata=True
        )
        
        # Extract the text chunks
        contexts = [match['metadata']['text'] for match in results['matches'] if 'text' in match['metadata']]
        return " ".join(contexts) if contexts else "No specific textbook context found."
    except Exception as e:
        print(f"Vector DB Error: {e}")
        return "Standard foundational knowledge."

def process_student_message(student_id: str, message: str) -> str:
    """
    The orchestrator. Pulls from both databases and feeds the LangChain Agent.
    """
    # 1. Get the textbook data (Vector DB)
    course_context = get_textbook_context(message)
    
    # 2. Get the student's memory profile (Knowledge Graph)
    student_weaknesses = get_student_context(student_id)
    
    # 3. Generate the Socratic response
    final_response = generate_tutor_response(
        query=message,
        context=course_context,
        weaknesses=student_weaknesses
    )
    
    return final_response
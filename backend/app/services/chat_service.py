import os
from langchain_groq import ChatGroq
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

# 1. INITIALIZE EMBEDDINGS (Keep Google for Vector Search)
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

try:
    from pinecone import Pinecone
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    vector_index = pc.Index("edu-engine-vectors")
except Exception as e:
    print(f"⚠️ Pinecone bypassed: {e}")
    vector_index = None

# 2. 🚀 THE UPGRADE: Swap to the new live Groq model!
llm = ChatGroq(
    temperature=0.4, # Lower temperature for better structure
    groq_api_key=os.getenv("GROQ_API_KEY"), 
    model_name="llama-3.1-8b-instant" # The correct, live model!
)

def get_student_context(student_id: str = "student_123"):
    return "Struggles with Calculus Integration and Physics Edge Cases."

def get_textbook_context(query: str) -> str:
    try:
        if not vector_index: return ""
        query_vector = embeddings.embed_query(query)
        results = vector_index.query(vector=query_vector, top_k=2, include_metadata=True)
        contexts = [match['metadata']['text'] for match in results['matches'] if 'text' in match['metadata']]
        return " ".join(contexts) if contexts else ""
    except Exception: return ""

def process_student_message(student_id: str, message: str) -> str:
    course_context = get_textbook_context(message)
    student_weaknesses = get_student_context(student_id)
    
    # 🧠 THE NEW PROMPT: Forcing beautiful structure
    prompt = f"""
    You are StudyPilot, an elite AI tutor. 
    Student Message: "{message}"
    
    CRITICAL INSTRUCTIONS FOR FORMATTING:
    1. NEVER write a single block of text.
    2. ALWAYS use Markdown. 
    3. Break your answer into short paragraphs.
    4. Use **bold text** for key terms.
    5. Use bullet points or numbered lists for explanations.
    """
    
    try:
        response = llm.invoke(prompt)
        return response.content
    except Exception as e:
        print(f"🔥 Groq API Error: {e}")
        return "My neural pathways are temporarily recalibrating! Please check the backend terminal."
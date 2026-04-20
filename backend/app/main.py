from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from neo4j import GraphDatabase

# Import our backend services
from app.services.chat_service import process_student_message
from app.services.evaluation_service import evaluate_assignment
from app.services.graph_generator import generate_and_store_syllabus
from app.services.grader_service import grade_submission
from app.services.notes_generator import generate_study_notes

# Load Environment Variables
load_dotenv()

# Initialize FastAPI App
app = FastAPI(title="Cognitive Edu Engine API")

# 🛡️ CORS Middleware: Whitelist the Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---

class ChatRequest(BaseModel):
    user_id: str
    message: str
    session_id: str

class EvaluationRequest(BaseModel):
    user_id: str
    topic: str
    submission: str

class OnboardingPayload(BaseModel):
    email: str
    exam: str
    level: str

class GraphRequest(BaseModel):
    email: str

# Add this near your other class definitions at the top
class NotesRequest(BaseModel):
    topic: str
    exam: str
    level: str = "Intermediate"

# Inside backend/main.py

class OnboardingPayload(BaseModel):
    email: str
    exam: str
    level: str
    critical_chapters: list[str] = [] # NEW: Captures the weaknesses from Step 3 of our UI

class PathwayRequest(BaseModel):
    weaknesses: list[str]
    hours: float


# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Cognitive Engine API is Live"}


@app.post("/api/v1/generate-pathway")
async def generate_pathway_api(request: PathwayRequest):
    import json
    from langchain_groq import ChatGroq
    
    allocator_llm = ChatGroq(
        temperature=0.2, 
        groq_api_key=os.getenv("GROQ_API_KEY"), 
        model_name="llama-3.1-8b-instant" 
    )
    
    total_minutes = int(request.hours * 60)
    
    # 🧠 PROMPT ENGINEERING: Force percentages based on complexity!
    prompt = f"""
    You are an elite AI Study Scheduler. 
    A student needs to study the following weak chapters: {', '.join(request.weaknesses)}.
    
    Step 1: Analyze the relative academic complexity and volume of these specific chapters.
    Step 2: Assign a precise study 'weightage_percentage' to each chapter based on its difficulty. The percentages MUST sum to exactly 100. Do NOT just split them equally (e.g., 50/50) unless they are exactly identical in scope.
    Step 3: Determine the best study 'type' for each (e.g., CORE CONCEPT, ACTIVE RECALL, EXAM PRACTICE).
    
    Respond STRICTLY with a valid JSON array of objects. No markdown blocks.
    Format:
    [
      {{"topic": "Chapter Name", "weightage_percentage": 65, "type": "CORE CONCEPT"}},
      {{"topic": "Chapter Name", "weightage_percentage": 35, "type": "EXAM PRACTICE"}}
    ]
    """
    
    try:
        response = allocator_llm.invoke(prompt)
        raw_json = response.content.replace('```json', '').replace('```', '').strip()
        pathway_data = json.loads(raw_json)
        
        # 🧮 DO THE MATH IN PYTHON
        final_pathway = []
        for item in pathway_data:
            # Calculate exact minutes based on the LLM's percentage
            allocated_minutes = int((item["weightage_percentage"] / 100) * total_minutes)
            
            final_pathway.append({
                "topic": item["topic"],
                "duration_minutes": allocated_minutes,
                "type": item["type"],
                "weightage_percentage": item["weightage_percentage"] # Send to frontend for UI flex!
            })
            
        return {"status": "success", "pathway": final_pathway}
        
    except Exception as e:
        print(f"Allocator Error: {e}")
        # FAILSAFE
        fallback = []
        if not request.weaknesses:
            return {"status": "success", "pathway": []}
            
        time_per_topic = total_minutes // len(request.weaknesses)
        percent_per_topic = 100 // len(request.weaknesses)
        
        for w in request.weaknesses:
            fallback.append({
                "topic": w, 
                "duration_minutes": time_per_topic, 
                "type": "REVIEW",
                "weightage_percentage": percent_per_topic
            })
        return {"status": "success", "pathway": fallback}


@app.post("/api/v1/graph")
async def get_knowledge_graph(request: GraphRequest):
    """Fetches the personalized Neo4j graph (up to 2 hops deep) for the logged-in student."""
    uri = os.getenv("NEO4J_URI")
    user = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")
    
    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        
        # 🚀 THE FIX: Expand the search radius to 2 hops [*1..2]
        # This handles BOTH the old Kumarialka schema and the new Suman schema simultaneously
        # 🚀 THE FIX: We added a WHERE clause to banish other users from the web!
        query = """
        MATCH path = (u:User {email: $email})-[*1..2]-(connected_node)
        WHERE NOT 'User' IN labels(connected_node)
        UNWIND relationships(path) AS r
        WITH DISTINCT r
        WITH startNode(r) AS n1, endNode(r) AS n2
        RETURN id(n1) AS source_id, coalesce(n1.name, n1.email, "Node") AS source_name, labels(n1)[0] AS source_label,
               id(n2) AS target_id, coalesce(n2.name, n2.email, "Node") AS target_name, labels(n2)[0] AS target_label
        """
        
        nodes = []
        links = []
        node_ids = set()
        
        with driver.session() as session:
            results = session.run(query, email=request.email)
            for record in results:
                s_id = str(record["source_id"])
                t_id = str(record["target_id"])
                
                # Dynamically color the nodes based on their type
                if s_id not in node_ids:
                    group = 1 if record["source_label"] == "User" else (2 if record["source_label"] == "Goal" else 3)
                    nodes.append({"id": s_id, "label": record["source_name"], "group": group})
                    node_ids.add(s_id)
                    
                if t_id not in node_ids:
                    group = 1 if record["target_label"] == "User" else (2 if record["target_label"] == "Goal" else 3)
                    nodes.append({"id": t_id, "label": record["target_name"], "group": group})
                    node_ids.add(t_id)
                
                # Link them together
                links.append({"source": s_id, "target": t_id})
                
        return {"nodes": nodes, "links": links}
        
    except Exception as e:
        print(f"Graph Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch Knowledge Graph")
    
    
@app.post("/api/v1/generate-notes")
async def generate_notes_api(request: NotesRequest):
    try:
        notes = generate_study_notes(request.topic, request.exam, request.level)
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# 🚀 INITIALIZE KNOWLEDGE GRAPH
@app.post("/api/build-brain")
async def build_brain(payload: OnboardingPayload):
    # 🧹 THE ERASER: Wipe the user's old graph connections before building the new one
    uri = os.getenv("NEO4J_URI")
    db_user = os.getenv("NEO4J_USERNAME")
    db_password = os.getenv("NEO4J_PASSWORD")
    
    try:
        driver = GraphDatabase.driver(uri, auth=(db_user, db_password))
        with driver.session() as session:
            # This Cypher query finds the user, grabs all their old subjects/goals, and severs the links
            session.run("""
                MATCH (u:User {email: $email})-[r]-(connected)
                WHERE NOT 'User' IN labels(connected)
                DELETE r
            """, email=payload.email)
    except Exception as e:
        print(f"Graph Eraser Warning: {e}")

    # 🧠 THE FIX: We are now passing payload.critical_chapters to the generator!
    result = generate_and_store_syllabus(
        payload.email, 
        payload.exam, 
        payload.level, 
        payload.critical_chapters 
    )
    return result


# 💬 CHATBOT ENDPOINT
@app.post("/api/v1/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        reply = process_student_message(request.user_id, request.message)
        return {
            "reply": reply,
            "status": "success"
        }
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal AI Engine Error")

# 📝 RAG GRADER ENDPOINT
@app.post("/api/grade-submission")
async def grade_submission_api(
    file: UploadFile = File(...),
    exam: str = Form("General"),
    level: str = Form("Beginner")
):
    contents = await file.read()
    result = grade_submission(contents, file.filename, exam, level)
    return result

# 🧠 ASSIGNMENT EVALUATION ENDPOINT
@app.post("/api/v1/evaluate")
async def evaluate_endpoint(request: EvaluationRequest):
    """
    Receives a student assignment, grades it, and updates their Knowledge Graph.
    """
    try:
        result = evaluate_assignment(request.user_id, request.topic, request.submission)
        if "error" in result:
             raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
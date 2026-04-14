# FILE: backend/app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.graph_generator import generate_and_store_syllabus
from app.services.grader_service import grade_submission # <-- ADD THIS IMPORT

# Import our backend services
from app.services.chat_service import process_student_message
from app.services.evaluation_service import evaluate_assignment # <-- NEW IMPORT
# Import your new AI Service
from app.services.graph_generator import generate_and_store_syllabus

load_dotenv()

app = FastAPI(title="Cognitive Edu Engine API")

# 🛡️ THE FIX: Explicitly whitelist the Next.js frontend
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

# Define the payload structure we expect from Next.js
class OnboardingPayload(BaseModel):
    email: str
    exam: str
    level: str

# --- API ENDPOINTS ---

# 🚀 THE NEW RAG ENDPOINT
@app.post("/api/build-brain")
async def build_brain(payload: OnboardingPayload):
    # This triggers the LLM and the Database injection
    result = generate_and_store_syllabus(payload.email, payload.exam, payload.level)
    return result

@app.get("/")
def read_root():
    return {"message": "Cognitive Engine API is Live"}

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


# 🚀 THE NEW RAG GRADER ENDPOINT
@app.post("/api/grade-submission")
async def grade_submission_api(
    file: UploadFile = File(...),
    exam: str = Form("General"),
    level: str = Form("Beginner")
):
    contents = await file.read()
    result = grade_submission(contents, file.filename, exam, level)
    return result


# <-- NEW: Add the Evaluation Route at the bottom of the endpoints
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
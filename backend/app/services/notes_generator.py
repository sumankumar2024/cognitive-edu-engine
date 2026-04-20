import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

# Initialize the ultra-fast Groq model
llm = ChatGroq(
    temperature=0.7, 
    groq_api_key=os.getenv("GROQ_API_KEY"), 
    model_name="llama-3.1-8b-instant"
)

def generate_study_notes(topic: str, exam: str, level: str = "Intermediate") -> str:
    """Generates hyper-personalized study notes using Groq."""
    try:
        print(f"🚀 AI Engine automatically locked onto Groq Llama 3 for {topic}")
        
        prompt = f"""
        Act as an elite, world-class tutor for a student preparing for the '{exam}' exam at an '{level}' level.
        Generate concise, high-yield study notes for the topic: '{topic}'.
        
        Format the response in Markdown with:
        1. A brief overview of the concept.
        2. 3-4 Key Bullet Points to remember.
        3. 1 common mistake students make on this topic.
        4. 1 quick practice question.
        
        Keep it under 300 words. Make it punchy and easy to read.
        """
        
        response = llm.invoke(prompt)
        return response.content
    except Exception as e:
        print(f"Notes Generation Error: {e}")
        return f"⚠️ Failed to generate notes. Error: {str(e)}"
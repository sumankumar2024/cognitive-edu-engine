import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generate_study_notes(topic: str, exam: str, level: str = "Intermediate") -> str:
    """Generates hyper-personalized study notes using dynamic model discovery."""
    try:
        # 🚀 THE ULTIMATE FAILSAFE: Dynamically fetch an allowed model
        working_model = None
        
        # Ask Google exactly what models this API key is allowed to use
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                if 'flash' in m.name:
                    working_model = m.name
                    break  # Flash is the fastest, take it immediately
                elif 'pro' in m.name and not working_model:
                    working_model = m.name # Fallback to Pro
        
        # If the API returns nothing, force the modern standard
        if not working_model:
            working_model = "models/gemini-1.5-flash"
            
        print(f"🚀 AI Engine automatically locked onto: {working_model}")
        model = genai.GenerativeModel(working_model)
        
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
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Notes Generation Error: {e}")
        return f"⚠️ Failed to generate notes. Error: {str(e)}"
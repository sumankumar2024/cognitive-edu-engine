import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load secrets
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Connect to DB
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("edu-engine-vectors")

# Ask a question based on your Class 10 Science PDF
question = "What is the difference between aerobic and anaerobic respiration?"

# Convert the question to a vector using the exact same model
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")
query_vector = embeddings.embed_query(question)

# Search Pinecone for the top 2 closest textbook paragraphs
results = index.query(
    vector=query_vector,
    top_k=2,
    include_metadata=True
)

print("\n🧠 AI Found the Following Textbook Knowledge:\n")
for match in results['matches']:
    print(f"Confidence Score: {match['score']:.2f}")
    print(f"Source Book: {match['metadata']['source']}")
    print(f"Text: {match['metadata']['text']}\n")
    print("-" * 50)
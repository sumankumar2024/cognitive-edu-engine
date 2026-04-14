import os
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

# Connect to Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "edu-engine-vectors"

print(f"Checking if '{index_name}' exists...")

if index_name not in pc.list_indexes().names():
    print(f"Creating '{index_name}'... (This takes about 30 seconds)")
    pc.create_index(
        name=index_name,
        dimension=3072, # The exact mathematical dimension for Gemini's embedding model
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
    print("Database successfully created!")
else:
    print("Database already exists!")
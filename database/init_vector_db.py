import os
import time
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# 1. Load your .env secrets
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

print("📚 Initializing the Cognitive Vector Database...")

# 2. Connect to Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = "edu-engine-vectors"
index = pc.Index(index_name)

# 3. Load the Google Embedding Model
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")

# 4. Load all PDFs from the /books folder
pdf_folder = os.path.join(os.path.dirname(__file__), 'books')
loader = PyPDFDirectoryLoader(pdf_folder)
docs = loader.load()

print(f"📄 Found {len(docs)} pages of raw textbook data. Chunking now...")

# 5. Split the books into small, digestible paragraphs
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(docs)

print(f"✂️ Sliced into {len(chunks)} chunks. Pushing to Pinecone...")

# 6. Upload to Pinecone in batches
batch_size = 50
for i in range(0, len(chunks), batch_size):
    batch = chunks[i:i+batch_size]
    
    # Generate unique IDs and extract text
    ids = [f"chunk_{i+j}" for j in range(len(batch))]
    texts = [doc.page_content for doc in batch]
    
    # Extract the filename to use as an "exam tag" (e.g., class10_science.pdf)
    metadatas = [{"text": doc.page_content, "source": doc.metadata["source"]} for doc in batch]
    
    # Get vector math from Google
    embeds = embeddings.embed_documents(texts)
    
    # Package and upload to Pinecone
    records = zip(ids, embeds, metadatas)
    index.upsert(vectors=list(records))
    print(f"⬆️ Uploaded batch {i // batch_size + 1}...")
    time.sleep(1) # Prevent API rate limits

print("✅ Bookshelf successfully loaded into Pinecone!")
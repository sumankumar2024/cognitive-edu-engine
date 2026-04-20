from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

# override=True ensures we don't use old cached variables
load_dotenv(override=True)

uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USERNAME")
pwd = os.getenv("NEO4J_PASSWORD")

print(f"Attempting to connect...")
print(f"URI: {uri}")
print(f"USER: {user}")

try:
    # Standard V5 connection - Aura handles all SSL automatically via the +s in the URI
    driver = GraphDatabase.driver(uri, auth=(user, pwd))
    driver.verify_connectivity()
    print("✅ SUCCESS! Neo4j is fully connected and routing is working.")
except Exception as e:
    print(f"❌ FAILED: {e}")
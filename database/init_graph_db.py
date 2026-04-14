import os
import sys
import logging
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Explicitly point to the .env file
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
load_dotenv(dotenv_path=env_path)

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

# Initialize the Neo4j Driver
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))

def seed_knowledge_graph():
    print("🚀 Connecting to live Neo4j Cloud Instance...")
    
    # STATEMENT 1: Clear the database
    query_delete = "MATCH (n) DETACH DELETE n;"
    
    # STATEMENT 2: Build the Brain Map
    query_create = """
    CREATE (s:Student {id: "student_123", name: "Suman Kumar", email: "suman@startup.com"})
    CREATE (c1:Concept {name: "General Science", weight: 8})
    CREATE (c2:Concept {name: "Biology", weight: 9})
    CREATE (c3:Concept {name: "Cellular Respiration", weight: 10})
    CREATE (c4:Concept {name: "Photosynthesis", weight: 10})
    CREATE (c5:Concept {name: "Thermodynamics", weight: 10})
    CREATE (c6:Concept {name: "Energy Transfer", weight: 9})
    
    CREATE (c1)-[:PREREQUISITE_FOR]->(c2)
    CREATE (c2)-[:PREREQUISITE_FOR]->(c3)
    CREATE (c2)-[:PREREQUISITE_FOR]->(c4)
    CREATE (c5)-[:PREREQUISITE_FOR]->(c6)
    CREATE (c6)-[:PREREQUISITE_FOR]->(c3)
    
    CREATE (s)-[:UNDERSTANDS {mastery: 95, last_tested: "2026-04-10"}]->(c1)
    CREATE (s)-[:UNDERSTANDS {mastery: 85, last_tested: "2026-04-11"}]->(c2)
    CREATE (s)-[:STRUGGLES_WITH {mastery: 30, last_tested: "2026-04-13"}]->(c3)
    CREATE (s)-[:STRUGGLES_WITH {mastery: 20, last_tested: "2026-04-13"}]->(c5)
    """
    
    try:
        with driver.session() as session:
            print("🧹 Clearing existing data...")
            session.run(query_delete)
            
            print("🌱 Injecting new Knowledge Graph...")
            session.run(query_create)
            
        print("✅ Billion-Dollar Brain Map injected successfully!")
    except Exception as e:
        print(f"❌ Error executing query: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    # Remove the diagnostic logging since we know the connection works now
    seed_knowledge_graph()
from neo4j import GraphDatabase
import os
from contextlib import contextmanager

# Hardcoded for now based on your input (MOVE TO .env IN PRODUCTION)
NEO4J_URI = "neo4j+s://c7d3d6d0.databases.neo4j.io"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "ziekceog8tkGtqeyyYTliGy4ot88sRC8lwFm8C3SP7U" 

class Neo4jConnection:
    def __init__(self):
        self.driver = None

    def connect(self):
        try:
            # AuraDB requires secure connection (neo4j+s)
            self.driver = GraphDatabase.driver(
                NEO4J_URI, 
                auth=(NEO4J_USER, NEO4J_PASSWORD)
            )
            # Verify connectivity
            self.driver.verify_connectivity()
            print("✅ Connected to Neo4j AuraDB Cloud")
        except Exception as e:
            print(f"❌ Failed to connect to AuraDB: {e}")
            raise e

    def close(self):
        if self.driver:
            self.driver.close()
            print("🛑 Disconnected from Neo4j")

    def get_session(self):
        if not self.driver:
            self.connect()
        return self.driver.session()

db = Neo4jConnection()

# Dependency for FastAPI routes
def get_db_session():
    session = db.get_session()
    try:
        yield session
    finally:
        session.close()
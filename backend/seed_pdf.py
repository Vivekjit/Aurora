# backend/seed_pdf.py
from app.core.database import db
import os

def seed_pdf_post():
    print("📄 Seeding PDF Post...")
    
    # 1. SETUP PATHS
    # Note: You must ensure this file actually exists on your disk!
    pdf_filename = "uploads/pdfs/test.pdf" 
    
    # Ensure directory exists
    os.makedirs("uploads/pdfs", exist_ok=True)

    if not os.path.exists(pdf_filename):
        print(f"❌ Error: File {pdf_filename} not found.")
        print("   Please put a PDF file named 'test.pdf' in 'backend/uploads/pdfs/'")
        return

    # 2. SAVE TO DB
    query = """
    MERGE (u:User {username: 'TestUser'})
    MERGE (p:Post {id: 'post_pdf_test_1'})
    SET p.title = 'Project Synapse Architecture',
        p.media_type = 'pdf',  // Corrected to match Feed Schema
        p.media_url = $url,    // Corrected to match Feed Schema
        p.realm = 'Tech',
        p.created_at = datetime()
    
    MERGE (u)-[:POSTED]->(p)
    """
    
    try:
        with db.get_session() as session:
            # Clean up old version
            session.run("MATCH (p:Post {id: 'post_pdf_test_1'}) DETACH DELETE p")
            
            # Save new node
            session.run(query, {"url": pdf_filename})
        print("✅ SUCCESS: PDF Post Created in Database!")
    except Exception as e:
        print(f"❌ Database Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_pdf_post()

# backend/clean_fake_data.py
from app.core.database import db

def clean_fake_data():
    print("🧹 Starting the Great Purge...")
    
    # Query to find and delete only the fake simulation posts
    query = """
    MATCH (p:Post)
    WHERE p.url CONTAINS 'fake-s3'
    DETACH DELETE p
    """
    
    try:
        with db.get_session() as session:
            session.run(query)
            
        print("✅ SUCCESS: All fake simulation posts have been deleted.")
        print("   Only your real uploads remain!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clean_fake_data()

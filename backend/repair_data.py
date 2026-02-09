# backend/repair_data.py
from app.core.database import db

def repair_post_metadata():
    print("🔧 STARTING METADATA REPAIR...")
    
    # We are fixing "post_video_test_1" specifically
    # forcing the type to 'video' and url to the correct path
    query = """
    MATCH (p:Post {id: 'post_video_test_1'})
    SET p.media_type = 'video',  // Corrected to match Feed Schema (was p.type)
        p.media_url = 'uploads/videos/test_vid.mp4', // Corrected to match Feed Schema (was p.url)
        p.thumbnail_url = 'uploads/profiles/aurora_cover.png'
    RETURN p.title, p.media_type, p.media_url
    """
    
    try:
        with db.get_session() as session:
            result = session.run(query)
            record = result.single()
            
            if record:
                print(f"✅ REPAIR SUCCESSFUL!")
                print(f"   - Title: {record['p.title']}")
                print(f"   - Type:  {record['p.media_type']} (Fixed!)")
                print(f"   - URL:   {record['p.media_url']} (Fixed!)")
            else:
                print("❌ Error: Could not find the post to repair. Did you wipe the DB?")
                
    except Exception as e:
        print(f"❌ DATABASE ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    repair_post_metadata()

# backend/finalize_video.py
from app.core.database import db

def finalize_video_post():
    print("🔧 APPLYING FINAL METADATA PATCH...")
    
    # We lock onto the ID and force the missing tags
    # CORRECTING SCHEMA: Using media_type/media_url to match feed.py requirements
    query = """
    MATCH (p:Post {id: 'post_video_test_1'})
    SET p.media_type = 'video', 
        p.media_url = 'uploads/videos/test_vid.mp4',
        p.thumbnail_url = 'uploads/profiles/aurora_cover.png'
    RETURN p.title, p.media_type, p.media_url, substring(p.timeline, 0, 50) as timeline_preview
    """
    
    try:
        with db.get_session() as session:
            result = session.run(query)
            record = result.single()
            
            if record:
                print("✅ PATCH SUCCESSFUL!")
                print(f"   - Title:    {record['p.title']}")
                print(f"   - Type:     {record['p.media_type']} (Must be 'video')") 
                print(f"   - URL:      {record['p.media_url']} (Must not be None)")
                print(f"   - Timeline: {record['timeline_preview']}... (Preserved!)")
            else:
                print("❌ Error: Post not found. Did you delete it?")
                
    except Exception as e:
        print(f"❌ DATABASE ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    finalize_video_post()

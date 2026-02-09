# backend/seed_video.py
from app.core.database import db
from app.utils.video_processor import process_video_upload
import os
import json

def seed_real_video_data():
    print("🎬 STARTING REAL DATA SEED...")
    
    # 1. VERIFY FILE
    video_path = "uploads/videos/test_vid.mp4"
    if not os.path.exists(video_path):
        print(f"❌ ERROR: File not found at {video_path}")
        return

    # 2. RUN FULL PROCESSING (Every 5 Seconds)
    print("   - 🧠 Analyzing video frames (scanning every 5s)...")
    try:
        result = process_video_upload(video_path)
        timeline_data = result["timeline"]
        
        # PROOF: Print the count so you know it's the full video
        print(f"   - ✅ EXTRACTED: {len(timeline_data)} distinct color segments.")
        print(f"   - 🔍 SAMPLE (Frame 1): {timeline_data[0]}")
    except Exception as e:
        print(f"❌ PROCESSING ERROR: {e}")
        return

    # 3. CONVERT TO STRING 
    timeline_string = json.dumps(timeline_data)

    # 4. SAVE TO DATABASE
    print("   - 💾 Saving to Neo4j...")
    query = """
    MERGE (u:User {username: 'TestUser'})
    MERGE (p:Post {id: 'post_video_test_1'})
    SET p.title = 'Cyberpunk City',
        p.type = 'video',
        p.url = $url,
        p.thumbnail_url = 'uploads/profiles/aurora_cover.png',
        p.timeline = $timeline_str, 
        p.created_at = datetime()
    MERGE (u)-[:POSTED]->(p)
    RETURN p.id as id
    """
    
    try:
        with db.get_session() as session:
            # Wipe old test post first to ensure clean slate
            session.run("MATCH (p:Post {id: 'post_video_test_1'}) DETACH DELETE p")
            
            # Save new post
            result = session.run(query, {
                "url": video_path,
                "timeline_str": timeline_string
            })
            
            # 5. SELF-VERIFICATION (Read it back immediately)
            print("   - 🕵️ Verifying data persistence...")
            check = session.run("MATCH (p:Post {id: 'post_video_test_1'}) RETURN p.timeline as t")
            record = check.single()
            
            if record and record["t"]:
                print("   - ✅ VERIFIED: Data is in the DB and readable!")
                print(f"   - 📄 DB Content Length: {len(record['t'])} characters.")
            else:
                print("   - ❌ CRITICAL FAILURE: Save reported success, but data is missing.")

    except Exception as e:
        print(f"❌ DATABASE ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_real_video_data()
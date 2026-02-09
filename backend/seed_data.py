from app.core.database import db
from app.utils.colors import extract_aurora_colors
import os

def seed_data():
    print("🌱 Seeding Graph Data...")
    
    try:
        # --- PART 1: Existing Seed Logic (Simulation Data) ---
        # (Assuming you had logic here to create 20 posts)
        # We will just ensure the User exists first
        query_user = """
        MERGE (u:User {username: 'TestUser'})
        SET u.synapse_cred = 100
        """
        with db.get_session() as session:
            session.run(query_user)
            
        print("✅ Base Data Seeded.")

        # --- PART 2: The Aurora Test Post ---
        print("🎨 Seeding Aurora Test Post...")
        
        # Define paths (Relative to backend root)
        image_filename = "uploads/profiles/aurora_cover.png"
        audio_filename = "uploads/profiles/test_audio.mp3"
        
        # Calculate Colors
        colors = ["#0ea5e9", "#8b5cf6"] # Default
        if os.path.exists(image_filename):
            print(f"   - Extracting colors from {image_filename}...")
            try:
                colors = extract_aurora_colors(image_filename)
                print(f"   - Colors found: {colors}")
            except Exception as e:
                print(f"   - Color extraction skipped: {e}")
        else:
            print(f"   - ⚠️ Warning: Image file not found at {image_filename}")
    
        # Create the Post Node
        query_aurora = """
        MATCH (u:User {username: 'TestUser'})
        MERGE (p:Post {id: 'post_aurora_1'})
        SET p.title = 'Aurora Dreams',
            p.type = 'audio',
            p.url = $audio_url,
            p.thumbnail_url = $image_url,
            p.colors = $colors,
            p.realm = 'Music',
            p.topic = 'Chill',
            p.created_at = datetime()
        
        MERGE (u)-[:POSTED]->(p)
        """
        
        with db.get_session() as session:
            session.run(query_aurora, {
                "audio_url": audio_filename,
                "image_url": image_filename,
                "colors": colors
            })
        
        print("✨ Aurora Post Created Successfully!")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
    finally:
        # ONLY CLOSE HERE, AT THE VERY END
        db.close()
        print("🔌 Disconnected from Neo4j")

if __name__ == "__main__":
    seed_data()
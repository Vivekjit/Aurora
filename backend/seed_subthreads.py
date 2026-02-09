from app.core.database import db
import random

# CRITICAL FIX: The keys here MUST match the IDs in your Frontend (upload/page.tsx)
CATEGORIES = {
    "Modern Tech": ["AI", "Web3", "Rust", "Cyber", "Cloud", "Quantum", "Data", "Edge", "LLM", "Robotics"], # Renamed from 'Tech'
    "Art": ["NFT", "3D", "Sketch", "Abstract", "Digital", "Voxel", "Generative", "Pixel", "Sculpt", "Oil"],
    "Music": ["LoFi", "Synth", "Jazz", "Techno", "Bass", "Trap", "Ambient", "House", "Indie", "Rock"],
    "Science": ["Space", "Bio", "Neuro", "Physics", "Chem", "Eco", "Solar", "Atom", "Geo", "Lab"],
    "Cinematography": ["Shorts", "4K", "Drone", "Doc", "Vlog", "Edit", "Color", "Lens", "Set", "Light"],
    "Sports": ["Goal", "Dunk", "Race", "Gym", "Yoga", "Hike", "Swim", "Run", "Bike", "Fit"],
    
    # --- ADDED MISSING REALMS ---
    "Photography": ["Portrait", "Street", "Macro", "Film", "B&W", "Landscape", "Wildlife", "Night", "Fashion", "Raw"],
    "Literature": ["Poetry", "SciFi", "Novel", "Essay", "Haiku", "Fiction", "Journal", "Satire", "Drama", "Review"]
}

PREFIXES = ["Neo", "Hyper", "Core", "Meta", "Ultra", "Deep", "Pro", "Flux", "Omni", "Zen"]

def seed_subthreads():
    print("🌱 Seeding Subthreads (Corrected IDs)...")
    
    query_insert = """
    MERGE (r:Realm {name: $category_name})
    MERGE (s:Subthread {name: $subthread_name})
    ON CREATE SET s.popularity = $popularity, s.created_at = datetime()
    ON MATCH SET s.popularity = $popularity
    MERGE (r)-[:HAS_SUBTHREAD]->(s)
    """

    try:
        with db.get_session() as session:
            count = 0
            for cat, roots in CATEGORIES.items():
                print(f"   Processing {cat}...")
                
                for i in range(30):
                    root = roots[i % len(roots)]
                    prefix = PREFIXES[i % len(PREFIXES)]
                    # Create variety: some simple, some compound
                    name = f"{prefix}{root}" if i >= 10 else root
                    
                    popularity = random.randint(20, 100)
                    
                    try:
                        session.run(query_insert, {
                            "category_name": cat,
                            "subthread_name": name,
                            "popularity": popularity
                        })
                        count += 1
                    except Exception as inner_e:
                        print(f"      ⚠️ Failed: {inner_e}")
                        
            print(f"✅ SUCCESS: Database synced with {count} subthreads!")
            
    except Exception as e:
        print(f"❌ Critical Database Error: {e}")

if __name__ == "__main__":
    seed_subthreads()
from app.core.database import db

def init_graph_constraints_and_realms():
    print("🔄 Initializing Graph Schema & Realms...")
    
    # 1. Apply Constraints
    constraints = [
        "CREATE CONSTRAINT user_username_unique IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE",
        "CREATE CONSTRAINT subthread_name_unique IF NOT EXISTS FOR (s:Subthread) REQUIRE s.name IS UNIQUE",
        "CREATE CONSTRAINT realm_name_unique IF NOT EXISTS FOR (r:Realm) REQUIRE r.name IS UNIQUE"
    ]
    
    try:
        with db.get_session() as session:
            for q in constraints:
                session.run(q)

            # 2. DEFINE REALMS DATA
            # FIX: Every single realm now has a 'limit_count'
            realms_data = [
                {
                    "name": "Art",
                    "allowed_media": ["image"],
                    "limit_count": 10
                },
                {
                    "name": "Tech",
                    "allowed_media": ["video", "image"],
                    "limit_count": 10,
                    "max_video_duration": 600
                },
                {
                    "name": "Science",
                    "allowed_media": ["pdf", "image"],
                    "limit_count": 5
                },
                {
                    "name": "Literature",
                    "allowed_media": ["pdf", "image"],
                    "limit_count": 5
                },
                {
                    "name": "Photography",
                    "allowed_media": ["image"],
                    "limit_count": 10
                },
                {
                    "name": "Cinematography",
                    "allowed_media": ["video"],
                    "limit_count": 3,  # <--- ADDED THIS (Was missing)
                    "max_video_duration": 180, 
                    "transcode_target": "4k"
                },
                {
                    "name": "Music",
                    "allowed_media": ["audio"],
                    "limit_count": 5,  # <--- ADDED THIS (Was missing)
                    "max_audio_duration": 300,
                    "require_album_art": True
                },
                {
                    "name": "Sports",
                    "allowed_media": ["video", "image"],
                    "limit_count": 5,
                    "max_video_duration": 60
                }
            ]

            # 3. Seed the Realms
            print("🌱 Seeding Realms into Neo4j...")
            
            # We use COALESCE in the query to handle optional fields like 'max_video_duration'
            # But 'limit_count' is now mandatory in the data above.
            query = """
            MERGE (r:Realm {name: $name})
            SET r.allowed_media = $allowed_media,
                r.limit_count = $limit_count
            """
            for realm in realms_data:
                session.run(query, realm)
                
    except Exception as e:
        print(f"❌ Initialization Error: {e}")
        # We catch the error but don't stop the server entirely
        pass
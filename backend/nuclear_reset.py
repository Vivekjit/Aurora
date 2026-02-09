from app.core.database import db

def wipe_database():
    print("☢️  INITIATING NUCLEAR RESET...")
    try:
        with db.get_session() as session:
            # Detach and delete EVERYTHING
            session.run("MATCH (n) DETACH DELETE n")
            print("✅ Database Wiped Clean.")
            
            # Drop old constraints if any exist (to avoid conflicts)
            try:
                session.run("DROP CONSTRAINT subthread_name_unique IF EXISTS")
                session.run("DROP CONSTRAINT user_username_unique IF EXISTS")
                session.run("DROP CONSTRAINT realm_name_unique IF EXISTS")
                print("✅ Old constraints dropped.")
            except Exception as e:
                print(f"⚠️ Note on constraints: {e}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    wipe_database()
from fastapi import APIRouter, Depends, Query, HTTPException
from app.core.database import get_db_session
from neo4j import Session
from typing import List, Optional

router = APIRouter()

@router.get("/feed/mix")
def get_main_feed(
    session: Session = Depends(get_db_session)
):
    print("🔍 FEED DEBUG: Fetching ALL posts from DB...")
    
    # SIMPLE DEBUG QUERY
    # Fetches all posts, ignoring relationships/realms
    query = """
    MATCH (p:Post)
    RETURN toString(p.id) as id, 
           p.title as title, 
           p.media_type as type, 
           p.media_url as url, 
           p.thumbnail_url as thumbnail_url, 
           p.colors as colors,
           p.timeline as timeline,
           toString(p.created_at) as created_at
    ORDER BY p.created_at DESC
    LIMIT 20
    """
    
    try:
        results = session.run(query).data()
        print(f"✅ FEED DEBUG: Found {len(results)} posts.")
        return results
    except Exception as e:
        print(f"❌ FEED ERROR: {e}")
        return []
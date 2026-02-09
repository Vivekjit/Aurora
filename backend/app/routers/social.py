from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_db_session
from app.models.schemas import UserProfile, MessageCreate, MessageResponse
from app.core.security import get_current_user # We need to build this dependency next
from neo4j import Session
import uuid
from typing import List

router = APIRouter()

# --- 1. PROFILE & METADATA ---

@router.get("/profile/{username}", response_model=UserProfile)
def get_profile(
    username: str, 
    current_user: str = Depends(get_current_user), 
    session: Session = Depends(get_db_session)
):
    query = """
    MATCH (u:User {username: $target})
    
    OPTIONAL MATCH (follower:User)-[:FOLLOWS]->(u)
    WITH u, count(follower) as followers
    
    OPTIONAL MATCH (u)-[:FOLLOWS]->(following:User)
    WITH u, followers, count(following) as following
    
    OPTIONAL MATCH (me:User {username: $me})-[:FOLLOWS]->(u)
    WITH u, followers, following, (me IS NOT NULL) as is_following
    
    RETURN u.username as username, 
           u.synapse_cred as cred, 
           toString(u.created_at) as created_at,
           u.profile_pic_url as pic_url,  // <--- FETCH THE URL
           followers, 
           following, 
           is_following
    """
    
    result = session.run(query, target=username, me=current_user).single()
    
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "username": result["username"],
        "synapse_cred": result["cred"],
        "follower_count": result["followers"],
        "following_count": result["following"],
        "is_following": result["is_following"],
        "created_at": result["created_at"],
        "profile_pic_url": result["pic_url"] # <--- MAP IT HERE
    }

# --- 2. FOLLOW ACTION ---
@router.post("/user/{username}/follow")
def follow_user(
    username: str, 
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    if username == current_user:
        raise HTTPException(status_code=400, detail="You cannot follow yourself.")

    # Create Follow Edge
    query = """
    MATCH (me:User {username: $me})
    MATCH (target:User {username: $target})
    MERGE (me)-[r:FOLLOWS]->(target)
    ON CREATE SET r.since = datetime()
    RETURN type(r)
    """
    result = session.run(query, me=current_user, target=username)
    
    if result.peek() is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": f"You are now following {username}"}

# --- 3. MESSAGING (DMs) ---
@router.post("/dm/send", response_model=MessageResponse)
def send_dm(
    msg: MessageCreate,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    """
    Graph-Based Chat: (Sender)-[:SENT]->(Msg)-[:TO]->(Recipient)
    """
    query = """
    MATCH (sender:User {username: $me})
    MATCH (recipient:User {username: $recipient})
    
    CREATE (m:Message {
        id: randomUUID(),
        content: $content,
        timestamp: datetime()
    })
    
    CREATE (sender)-[:SENT]->(m)-[:TO]->(recipient)
    
    RETURN m.id as id, m.content as content, m.timestamp as ts
    """
    
    record = session.run(query, me=current_user, recipient=msg.recipient_username, content=msg.content).single()
    
    if not record:
        raise HTTPException(status_code=404, detail="Recipient not found")

    return {
        "id": record["id"],
        "sender": current_user,
        "content": record["content"],
        "timestamp": record["ts"].iso_format()
    }
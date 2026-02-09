from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_db_session
from app.models.schemas import EngagementRequest, InteractionType
from app.core.security import get_current_user
from neo4j import Session

router = APIRouter()

@router.post("/engage")
def track_engagement(
    req: EngagementRequest,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    """
    Captures:
    1. LIKES: (User)-[:LIKED]->(Post) -> Boosts Velocity Score
    2. VIEWS: (User)-[:VIEWED {duration: 120}]->(Post) -> Tracks 'Time Spent'
    """
    
    if req.interaction_type == InteractionType.LIKE:
        query = """
        MATCH (u:User {username: $user}), (p:Post {id: $post_id})
        MERGE (u)-[r:LIKED]->(p)
        ON CREATE SET r.timestamp = datetime(),
                      p.velocity_score = p.velocity_score + 5.0  // Boost Score!
        RETURN p.velocity_score as new_score
        """
        
    elif req.interaction_type == InteractionType.VIEW:
        # Time Spent Logging
        query = """
        MATCH (u:User {username: $user}), (p:Post {id: $post_id})
        CREATE (u)-[r:VIEWED]->(p)
        SET r.duration_seconds = $duration,
            r.timestamp = datetime()
        RETURN r.duration_seconds
        """
        
    else:
        # DISLIKE (Reduces Score)
        query = """
        MATCH (u:User {username: $user}), (p:Post {id: $post_id})
        MERGE (u)-[r:DISLIKED]->(p)
        ON CREATE SET p.velocity_score = p.velocity_score - 5.0
        RETURN p.velocity_score as new_score
        """

    result = session.run(query, user=current_user, post_id=req.post_id, duration=req.duration_seconds)
    
    if result.peek() is None:
        raise HTTPException(status_code=404, detail="Post not found")
        
    return {"status": "recorded", "type": req.interaction_type}
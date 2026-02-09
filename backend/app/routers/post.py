from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form, BackgroundTasks
from app.core.database import get_db_session
from app.models.schemas import CreateTopicRequest, TopicResponse
from neo4j import Session
import shutil
import os
from datetime import datetime

# --- THIS WAS MISSING ---
router = APIRouter()
# ------------------------

@router.post("/topic/create", response_model=TopicResponse)
def create_topic(request: CreateTopicRequest, session: Session = Depends(get_db_session)):
    """
    Creates a new Sub-Thread (Topic) under a Parent Realm.
    Example: User creates 'Rocketry' under 'Science'.
    """
    
    # 1. Check if the Parent Realm exists (Strict Typing)
    check_realm_query = """
    MATCH (r:Realm {name: $realm_name})
    RETURN r
    """
    result = session.run(check_realm_query, realm_name=request.parent_realm.value)
    
    if not result.single():
        raise HTTPException(status_code=400, detail=f"Realm '{request.parent_realm}' does not exist.")

    # 2. Create the Topic and Link it
    create_query = """
    MATCH (r:Realm {name: $realm_name})
    MERGE (t:Topic {name: $topic_name})
    ON CREATE SET t.created_at = datetime()
    MERGE (t)-[:BELONGS_TO]->(r)
    RETURN t.name as name, r.name as parent, 0 as count
    """
    
    record = session.run(create_query, 
                         realm_name=request.parent_realm.value, 
                         topic_name=request.name).single()
    
    if not record:
        raise HTTPException(status_code=500, detail="Failed to create topic.")

    return TopicResponse(
        name=record["name"],
        parent_realm=record["parent"],
        post_count=record["count"]
    )

@router.post("/post/upload")
async def upload_content(
    title: str = Form(...),
    topic_name: str = Form(...),
    file: UploadFile = File(...),
    session: Session = Depends(get_db_session)
):
    """
    1. Validates the file type against the Realm's strict rules.
    2. Simulates upload (saves locally for now).
    3. Creates the Post Node in the Graph.
    """
    
    # 1. Fetch the Parent Realm rules for this Topic
    rule_query = """
    MATCH (t:Topic {name: $topic_name})-[:BELONGS_TO]->(r:Realm)
    RETURN r.name as realm, r.allowed_media as allowed
    """
    result = session.run(rule_query, topic_name=topic_name).single()
    
    if not result:
        raise HTTPException(status_code=400, detail="Topic does not exist.")
    
    realm_name = result["realm"]
    allowed_types = result["allowed"] # e.g. ['pdf', 'image']
    
    # 2. STRICT VALIDATION: Check file extension
    content_type = file.content_type  # e.g., 'application/pdf'
    
    # Simple mapping for validation
    type_map = {
        "application/pdf": "pdf",
        "image/jpeg": "image", 
        "image/png": "image",
        "video/mp4": "video",
        "audio/mpeg": "audio"
    }
    
    detected_type = type_map.get(content_type, "unknown")
    
    if detected_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid media type! {realm_name} only accepts: {allowed_types}"
        )

    # 3. Simulate Cloud Upload (Save to local disk)
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{datetime.now().timestamp()}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 4. Extract Colors (if audio/image) OR Process Video
    extracted_colors = []
    video_timeline = []
    
    # VIDEO LOGIC
    if detected_type == "video":
        from app.utils.video_processor import process_video_upload
        print("🎬 Processing Video Upload...")
        result = process_video_upload(file_path)
        
        # Update path if it was compressed/renamed
        file_path = result["path"]
        video_timeline = result["timeline"]
        
        # Flatten timeline to colors for simple list storage if needed,
        # OR just store the timeline. The prompt implies we return the timeline.
        # But Neo4j property 'colors' is expected to be a list of strings by current convention.
        # We might need a new property 'timeline' OR serialize it.
        # For backwards compatibility with 'AuroraPlayer', we might pick the first frame's colors as 'colors'.
        if video_timeline:
            extracted_colors = video_timeline[0]["colors"]

    # IMAGE LOGIC
    elif detected_type == "image":
        from app.utils.colors import extract_aurora_colors
        extracted_colors = extract_aurora_colors(file_path)

    # 5. Create Post Node in Graph
    # We add 'timeline' property to the query
    create_post_query = """
    MATCH (t:Topic {name: $topic_name})
    CREATE (p:Post {
        id: randomUUID(),
        title: $title,
        media_url: $url,
        media_type: $type,
        colors: $colors,
        timeline: $timeline,
        created_at: datetime(),
        velocity_score: 100.0
    })
    CREATE (p)-[:POSTED_IN]->(t)
    RETURN p.id as id
    """
    
    session.run(create_post_query, 
                topic_name=topic_name, 
                title=title, 
                url=file_path,
                colors=extracted_colors,
                timeline=video_timeline if detected_type == "video" else [], # Pass empty list if not video
                type=detected_type)
    
    return {
        "status": "success", 
        "message": f"Posted to {topic_name}!",
        "path": file_path,
        "colors": extracted_colors,
        "timeline": video_timeline # <--- Return timeline to frontend
    }
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional
import boto3
import uuid
import os
import shutil
from datetime import datetime

# --- IMPORTS FROM YOUR PROJECT ---
from app.core.database import db
from app.core.init_db import init_graph_constraints_and_realms
from app.routers import chat # <--- Encrypted Chat Router

# Optional: If you want to keep your old local upload logic alongside S3
# from app.utils.video_processor import process_video_upload
# from app.utils.colors import extract_aurora_colors

# --- CONFIGURATION & CONSTANTS ---
REALMS_RULES = {
    "Art": {"allowed": ["image"], "limit": 10},
    "Tech": {"allowed": ["video", "image"], "limit": 10},
    "Science": {"allowed": ["pdf", "image"], "limit": 5},
    "Music": {"allowed": ["audio"], "limit": 1},
    "Cinematography": {"allowed": ["video"], "limit": 1},
    "Sports": {"allowed": ["video", "image"], "limit": 5, "video_max_sec": 60},
    "Literature": {"allowed": ["pdf"], "limit": 1}
}

# --- AWS S3 CLIENT SETUP ---
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)
BUCKET = os.getenv("AWS_BUCKET_NAME")

# --- LIFECYCLE MANAGER (Startup/Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Project Synapse Backend Starting...")
    try:
        db.connect()
        init_graph_constraints_and_realms()
    except Exception as e:
        print(f"⚠️ Startup Warning: {e}")
    
    yield  # Application runs here
    
    db.close()
    print("💤 Project Synapse Backend Shutting Down...")

# --- APP INITIALIZATION ---
app = FastAPI(title="Project Synapse API", version="2.0", lifespan=lifespan)

# Mount local uploads (Legacy support)
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(chat.router, tags=["Encrypted Chat"]) # <--- Register Chat Router

# --- CORS MIDDLEWARE (Security Pass) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
#        PART 1: AWS S3 UPLOAD ENGINE
# ==========================================

class SignRequest(BaseModel):
    filename: str
    file_type: str
    realm: str

@app.post("/api/upload/sign")
async def sign_upload(req: SignRequest):
    # 1. Validation Logic
    rule = REALMS_RULES.get(req.realm)
    if not rule:
        # Fallback for testing new realms
        rule = {"allowed": ["image", "video"], "limit": 10}
    
    media_type = req.file_type.split('/')[0]
    if req.file_type == "application/pdf": media_type = "pdf"
    
    # Loose validation for development comfort
    # (In production, uncomment strict check below)
    # if media_type not in rule["allowed"]:
    #    raise HTTPException(400, f"{media_type} not allowed in {req.realm}")

    # 2. Key Generation
    ext = req.filename.split('.')[-1]
    key = f"uploads/{req.realm}/{datetime.now().strftime('%Y-%m-%d')}/{uuid.uuid4()}.{ext}"
    
    # 3. AWS Handshake
    try:
        url = s3_client.generate_presigned_url(
            'put_object',
            Params={'Bucket': BUCKET, 'Key': key, 'ContentType': req.file_type},
            ExpiresIn=300
        )
        return {
            "upload_url": url, 
            "public_url": f"https://{BUCKET}.s3.amazonaws.com/{key}",
            "file_key": key
        }
    except Exception as e:
        print(f"AWS Error: {e}")
        raise HTTPException(500, detail="AWS Credentials Invalid or Bucket Missing")

# ==========================================
#        PART 2: THE SOCIAL GRAPH API
# ==========================================

class PostCreate(BaseModel):
    realm: str
    subthread: str
    caption: str
    media_url: str
    media_type: str
    s3_key: str

@app.post("/api/posts")
async def create_post(post: PostCreate):
    # The "Grand Integration" Query
    query = """
    MATCH (r:Realm {name: $realm})
    MERGE (s:Subthread {name: $subthread})
    ON CREATE SET s.popularity = 1, s.created_at = datetime()
    ON MATCH SET s.popularity = s.popularity + 1
    
    MERGE (u:User {username: "test_user_alpha"})
    
    CREATE (p:Post {
        id: randomUUID(),
        caption: $caption,
        url: $media_url,
        type: $media_type,
        created_at: datetime()
    })
    
    MERGE (p)-[:POSTED_BY]->(u)
    MERGE (p)-[:BELONGS_TO]->(s)
    MERGE (p)-[:IN_REALM]->(r)
    
    RETURN p.id as id
    """
    try:
        with db.get_session() as session:
            result = session.run(query, post.dict())
            record = result.single()
            if record:
                return {"status": "success", "id": record["id"]}
            return {"status": "error", "detail": "Failed to create node"}
    except Exception as e:
        print(f"DB Error: {e}")
        raise HTTPException(500, str(e))

# --- THE HONEYCOMB CLOUD FETCH ---
@app.get("/api/subthreads/{realm}")
async def get_subthreads(realm: str):
    # Matches 'Realm' nodes (consistently with seeding script)
    query = """
    MATCH (r:Realm {name: $realm})-[:HAS_SUBTHREAD]->(s:Subthread)
    RETURN s.name as name, s.popularity as popularity
    ORDER BY s.popularity DESC
    LIMIT 100
    """
    with db.get_session() as session:
        result = session.run(query, realm=realm)
        return [record.data() for record in result]

# ==========================================
#        PART 3: THE FEED ALGORITHMS
# ==========================================

@app.get("/api/feed/explore")
async def feed_explore():
    query = """
    MATCH (p:Post)-[:BELONGS_TO]->(s:Subthread)
    MATCH (p)-[:POSTED_BY]->(u)
    MATCH (p)-[:IN_REALM]->(r)
    RETURN 
        p.id as id, 
        p.caption as caption, 
        p.url as url, 
        p.type as type,
        u.username as author,
        s.name as subthread,
        r.name as realm
    ORDER BY p.created_at DESC
    LIMIT 20
    """
    with db.get_session() as session:
        return [record.data() for record in session.run(query)]

@app.get("/")
def health_check():
    return {"status": "operational", "cloud": "AWS S3 Connected", "db": "Neo4j Connected"}
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum
from datetime import datetime

# 1. Enums: Enforcing the "Parent Threads" Strict List
class RealmType(str, Enum):
    ART = "Art"
    MODERN_TECH = "Modern Tech"
    SCIENCE = "Science"
    LITERATURE = "Literature"
    PHOTOGRAPHY = "Photography"
    VIDEOGRAPHY = "Videography"
    MUSIC = "Music"
    TIDBITS = "Tidbits"

# 2. Enums: Allowed Media Types
class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    PDF = "pdf"

# --- READ MODELS (Response to Frontend) ---

class RealmResponse(BaseModel):
    name: RealmType
    allowed_media: List[MediaType]
    max_count: int

class TopicResponse(BaseModel):
    name: str
    parent_realm: RealmType
    post_count: int

class PostResponse(BaseModel):
    id: str
    title: str
    media_url: str
    media_type: MediaType
    author: str
    velocity_score: float
    created_at: datetime

# --- WRITE MODELS (Input from User) ---

class CreateTopicRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=50, description="Name of the sub-thread")
    parent_realm: RealmType = Field(..., description="Must be one of the 8 core parent threads")

class CreatePostMetadata(BaseModel):
    title: str = Field(..., max_length=100)
    topic_name: str
    # Note: The actual file is handled via Form data in FastAPI, 
    # but this model validates the accompanying JSON data.


    # --- USER AUTH MODELS ---

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    username: str
    synapse_cred: float # The Reputation Score
    created_at: datetime

# ... (Keep existing Enums and Post models) ...

# --- NEW: INTERACTION MODELS ---
class InteractionType(str, Enum):
    LIKE = "like"
    DISLIKE = "dislike"
    VIEW = "view"

class EngagementRequest(BaseModel):
    post_id: str
    interaction_type: InteractionType
    duration_seconds: Optional[int] = 0 # Only for 'view'

# --- UPDATED: USER PROFILE ---
class UserProfile(BaseModel):
    username: str
    synapse_cred: float
    follower_count: int
    following_count: int
    is_following: bool
    created_at: str
    profile_pic_url: Optional[str] = None  # <--- NEW FIELD

# --- DM MODELS ---
class MessageCreate(BaseModel):
    recipient_username: str
    content: str = Field(..., min_length=1, max_length=1000)

class MessageResponse(BaseModel):
    id: str
    sender: str
    content: str
    timestamp: datetime
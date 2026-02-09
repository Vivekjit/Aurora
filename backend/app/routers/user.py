#HANDLES THE USERS 


from fastapi import APIRouter, HTTPException, Depends, status
from app.core.database import get_db_session
from app.models.schemas import UserCreate, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from neo4j import Session
from datetime import timedelta

from fastapi import File, UploadFile, status
import shutil
import os
from datetime import datetime
from app.core.security import get_current_user # Ensure this is imported
from fastapi.security import OAuth2PasswordRequestForm #

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, session: Session = Depends(get_db_session)):
    # 1. Check if user exists
    check_query = "MATCH (u:User {username: $username}) RETURN u"
    if session.run(check_query, username=user.username).single():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # 2. Hash Password (ARGON2)
    try:
        hashed_pw = get_password_hash(user.password)
    except Exception as e:
        print(f"❌ HASHING ERROR: {e}")
        raise HTTPException(status_code=500, detail="Security module failure")
    
    # 3. Create User & Return Date as String
    create_query = """
    CREATE (u:User {
        username: $username,
        password_hash: $pwd,
        synapse_cred: 50.0,
        created_at: datetime()
    })
    RETURN u.username as username, 
           u.synapse_cred as synapse_cred, 
           toString(u.created_at) as created_at
    """
    
    result = session.run(create_query, username=user.username, pwd=hashed_pw).single()
    
    return {
        "username": result["username"],
        "synapse_cred": result["synapse_cred"],
        "created_at": result["created_at"]
    }

@router.post("/login", response_model=Token)
@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), # <--- CHANGE THIS
    session: Session = Depends(get_db_session)
):
    """
    Standardized Login for Swagger/OAuth2 compatibility.
    1. Finds user.
    2. Verifies Password.
    3. Returns JWT Token.
    """
    
    # Note: OAuth2PasswordRequestForm uses 'username' and 'password' fields
    query = "MATCH (u:User {username: $username}) RETURN u.password_hash as pwd_hash"
    result = session.run(query, username=form_data.username).single()
    
    if not result or not verify_password(form_data.password, result["pwd_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Generate Token
    access_token_expires = timedelta(minutes=300)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}



#USER PROFILE PIC _IG
@router.put("/profile/image")
def update_profile_picture(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    """
    1. Validates the file is an image.
    2. Saves it locally (simulating Cloud Storage).
    3. Updates the User Node in Neo4j.
    """
    
    # 1. Validate Image
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPEG and PNG are allowed."
        )

    # 2. Save File (Overwrite handling is implied by unique filename timestamp)
    os.makedirs("uploads/profiles", exist_ok=True)
    filename = f"profile_{current_user}_{int(datetime.now().timestamp())}.jpg"
    file_path = f"uploads/profiles/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. GENERATE AURORA COLORS
    from app.utils.colors import extract_aurora_colors
    try:
        aurora_colors = extract_aurora_colors(file_path)
    except Exception as e:
        print(f"Color extraction warning: {e}")
        aurora_colors = ["#0ea5e9", "#8b5cf6"] # Fallback

    # 4. Update Graph
    # We use SET to add/update the property. It works even if the property didn't exist before.
    query = """
    MATCH (u:User {username: $username})
    SET u.profile_pic_url = $url, u.profile_colors = $colors
    RETURN u.profile_pic_url as url, u.profile_colors as colors
    """
    
    result = session.run(query, username=current_user, url=file_path, colors=aurora_colors).single()
    
    return {
        "status": "success", 
        "profile_pic_url": result["url"],
        "colors": result["colors"]
    }
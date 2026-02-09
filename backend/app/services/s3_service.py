import boto3
import uuid
import os
from botocore.exceptions import ClientError
from datetime import datetime

# --- CONFIGURATION ---
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
REGION = os.getenv("AWS_REGION", "us-east-1")

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=REGION
)

# --- REALM RULES (From your screenshot) ---
REALMS_RULES = {
    "Art": {"allowed": ["image/jpeg", "image/png", "image/webp"]},
    "Modern Tech": {"allowed": ["video/mp4", "image/jpeg", "image/png"]},
    "Science": {"allowed": ["application/pdf", "image/jpeg"]},
    "Music": {"allowed": ["audio/mpeg", "audio/wav"]},
    # Add others as needed...
}

def generate_presigned_url(filename: str, file_type: str, realm: str):
    """
    Generates a secure URL that allows the frontend to upload DIRECTLY to AWS.
    """
    # 1. VALIDATE REALM
    rules = REALMS_RULES.get(realm)
    if not rules:
        raise ValueError(f"Invalid Realm: {realm}")
    
    # 2. VALIDATE FILE TYPE
    # Simple check: does the MIME type start with allowed types?
    # (In production, use more robust checking)
    is_allowed = any(file_type == allowed for allowed in rules["allowed"])
    if not is_allowed:
        raise ValueError(f"File type {file_type} not allowed in {realm}")

    # 3. GENERATE UNIQUE KEY (Folder Structure)
    # storage/Music/2026-02-07/unique-id.mp3
    ext = filename.split('.')[-1]
    unique_name = f"{uuid.uuid4()}.{ext}"
    date_path = datetime.now().strftime("%Y-%m-%d")
    object_key = f"uploads/{realm}/{date_path}/{unique_name}"

    try:
        # 4. ASK AWS FOR PERMISSION
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': object_key,
                'ContentType': file_type
            },
            ExpiresIn=300 # URL dies in 5 minutes
        )
        
        # Return the URL for the frontend to use, AND the final key to save in DB later
        return {
            "upload_url": presigned_url,
            "file_key": object_key,
            "public_url": f"https://{BUCKET_NAME}.s3.amazonaws.com/{object_key}"
        }

    except ClientError as e:
        print(f"AWS Error: {e}")
        return None

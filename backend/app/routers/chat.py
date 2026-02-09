from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.socket_manager import manager
from app.core.database import db
import json

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # 1. Wait for incoming message
            data = await websocket.receive_json()
            
            target_id = data.get("to")
            encrypted_content = data.get("ciphertext")
            
            # 2. Store in Neo4j (With the FIX)
            query = """
            MERGE (u1:User {username: $sender})  // <--- CHANGED FROM MATCH TO MERGE
            MERGE (u2:User {username: $receiver})
            
            CREATE (m:Message {
                content: $content, 
                timestamp: datetime(),
                id: randomUUID()
            })
            
            MERGE (u1)-[:SENT]->(m)
            MERGE (m)-[:TO]->(u2)
            """
            
            try:
                with db.get_session() as session:
                    session.run(query, {
                        "sender": user_id, 
                        "receiver": target_id, 
                        "content": encrypted_content
                    })
            except Exception as e:
                print(f"❌ DB Save Error: {e}")

            # 3. Push to Real-time Socket
            await manager.send_private_message(encrypted_content, user_id, target_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"⚠️ Socket Error: {e}")
        manager.disconnect(websocket, user_id)

@router.get("/api/chat/history/{user1}/{user2}")
async def get_chat_history(user1: str, user2: str):
    # Fetch conversation between two users (in both directions)
    query = """
    MATCH (u1:User {username: $u1})-[r1:SENT]->(m:Message)-[r2:TO]->(u2:User {username: $u2})
    RETURN m.content as content, m.timestamp as timestamp, u1.username as sender
    UNION
    MATCH (u2:User {username: $u2})-[r3:SENT]->(m:Message)-[r4:TO]->(u1:User {username: $u1})
    RETURN m.content as content, m.timestamp as timestamp, u2.username as sender
    ORDER BY timestamp ASC
    """
    try:
        with db.get_session() as session:
            result = session.run(query, {"u1": user1, "u2": user2})
            history = []
            for record in result:
                history.append({
                    "from": record["sender"],
                    "content": record["content"], # Still Encrypted!
                    "timestamp": record["timestamp"].isoformat() if hasattr(record["timestamp"], 'isoformat') else str(record["timestamp"])
                })
            return history
    except Exception as e:
        print(f"History Fetch Error: {e}")
        return []
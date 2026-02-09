from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List of active WebSockets (User might have multiple tabs/devices)
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"🔌 User {user_id} connected via Socket")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"🔌 User {user_id} disconnected")

    async def send_private_message(self, message: str, sender_id: str, receiver_id: str):
        # 1. Send to Receiver (if online)
        if receiver_id in self.active_connections:
            for connection in self.active_connections[receiver_id]:
                await connection.send_text(json.dumps({
                    "from": sender_id,
                    "content": message, # THIS IS ENCRYPTED
                    "timestamp": "Now"
                }))

        # 2. Echo back to Sender (so it appears on their screen immediately if they have multiple tabs)
        # In a real app, the frontend usually updates optimistically, but this ensures consistency across tabs.
        if sender_id in self.active_connections:
            for connection in self.active_connections[sender_id]:
                 await connection.send_text(json.dumps({
                    "from": sender_id, # From "Me"
                    "content": message,
                    "timestamp": "Now"
                }))

manager = ConnectionManager()

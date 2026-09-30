"""
Giao thức trao đổi Message chuẩn cho Hệ Thống Multi-Agent
Theo đặc tả Bài 6 & 7: models/agent_message.py
"""
from typing import Any, Optional

try:
    from pydantic import BaseModel

    class AgentMessage(BaseModel):
        task_id: str
        from_agent: str
        to_agent: str
        message_type: str
        payload: Any
        status: str = "success"
        error: Optional[str] = None

        def __getitem__(self, key: str):
            if isinstance(self.payload, dict) and key in self.payload:
                return self.payload[key]
            return getattr(self, key)
except ImportError:
    class AgentMessage:
        def __init__(self, task_id: str, from_agent: str, to_agent: str, message_type: str, payload: Any, status: str = "success", error: Optional[str] = None):
            self.task_id = task_id
            self.from_agent = from_agent
            self.to_agent = to_agent
            self.message_type = message_type
            self.payload = payload
            self.status = status
            self.error = error

        def __getitem__(self, key: str):
            if isinstance(self.payload, dict) and key in self.payload:
                return self.payload[key]
            return getattr(self, key)

        def dict(self):
            return {
                "task_id": self.task_id,
                "from_agent": self.from_agent,
                "to_agent": self.to_agent,
                "message_type": self.message_type,
                "payload": self.payload,
                "status": self.status,
                "error": self.error
            }


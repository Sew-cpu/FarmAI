"""
RAG Agent (agents/rag_agent.py)
Trách nhiệm: Quản lý tài liệu phi cấu trúc, truy vấn tri thức chuyên ngành qua Vector Search.
"""
from agents.base_agent import BaseAgent
from models.agent_message import AgentMessage
from services.vector_service import search_knowledge

class RAGAgent(BaseAgent):
    def __init__(self):
        super().__init__("rag_agent")

    def process(self, message: AgentMessage) -> AgentMessage:
        query = message.payload.get("question", "") if isinstance(message.payload, dict) else str(message.payload)
        knowledge = search_knowledge(query)

        return AgentMessage(
            task_id=message.task_id,
            from_agent=self.name,
            to_agent="reasoning_agent",
            message_type="knowledge_retrieved",
            payload={"knowledge": knowledge}
        )

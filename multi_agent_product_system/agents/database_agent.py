"""
Database Agent (agents/database_agent.py)
Trách nhiệm: Nhận tiêu chí lọc cấu trúc, xây dựng query SQL chuẩn hóa, truy xuất trực tiếp MySQL.
"""
from agents.base_agent import BaseAgent
from models.agent_message import AgentMessage
from services.database_service import search_products

class DatabaseAgent(BaseAgent):
    def __init__(self):
        super().__init__("database_agent")

    def process(self, message: AgentMessage) -> AgentMessage:
        requirements = message.payload if isinstance(message.payload, dict) else {}
        products = search_products(requirements)

        return AgentMessage(
            task_id=message.task_id,
            from_agent=self.name,
            to_agent="reasoning_agent",
            message_type="db_products_found",
            payload={"products": products, "requirements": requirements}
        )

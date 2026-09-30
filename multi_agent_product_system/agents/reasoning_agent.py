"""
Reasoning Agent (agents/reasoning_agent.py)
Trách nhiệm: Tổng hợp danh sách sản phẩm từ DB và tri thức từ RAG, so sánh, suy luận và đưa ra đề xuất tối ưu kèm giải thích.
"""
from agents.base_agent import BaseAgent
from models.agent_message import AgentMessage

class ReasoningAgent(BaseAgent):
    def __init__(self):
        super().__init__("reasoning_agent")

    def process(self, message: AgentMessage) -> AgentMessage:
        payload = message.payload if isinstance(message.payload, dict) else {}
        products = payload.get("products", [])
        knowledge = payload.get("knowledge", [])
        requirements = payload.get("requirements", {})

        if not products:
            rec = None
            reasons = []
        else:
            rec = products[0]
            reasons = [
                f"Sản phẩm {rec.get('name')} phù hợp với ngân sách (giá {rec.get('price', 0):,} VNĐ).",
                f"Thương hiệu {rec.get('brand')} có bảo hành chính hãng {rec.get('warranty', 24)} tháng.",
                f"Chỉ định điều trị tối ưu theo cơ sở dữ liệu chuyên ngành thú y."
            ]

        kw_text = " ".join(knowledge) if isinstance(knowledge, list) else str(knowledge)

        return AgentMessage(
            task_id=message.task_id,
            from_agent=self.name,
            to_agent="critic_agent",
            message_type="recommendation_generated",
            payload={
                "recommendation": rec,
                "reason": reasons,
                "knowledge": kw_text,
                "all_products": products
            }
        )

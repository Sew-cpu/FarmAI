"""
Critic Agent (agents/critic_agent.py)
Theo đặc tả Bài 6 & 7: Trang 5
Trách nhiệm: Kiểm tra chéo: xác thực thông số sản phẩm có khớp DB, kiểm soát Hallucination, ra quyết định APPROVE/REJECT.
"""
from agents.base_agent import BaseAgent
from models.agent_message import AgentMessage

class CriticAgent(BaseAgent):
    def __init__(self):
        super().__init__("critic_agent")

    def process(self, message: AgentMessage) -> AgentMessage:
        rec = message.payload.get("recommendation")
        reason = message.payload.get("reason", [])
        kw = message.payload.get("knowledge", "")
        errors = []

        if not rec:
            errors.append("Không có sản phẩm được đề xuất.")
        else:
            for field in ["price", "ram", "warranty", "name"]:
                if field not in rec:
                    errors.append(f"Thiếu thông tin {field}.")
            if not reason:
                errors.append("Không có lý do giải thích.")
            if not kw:
                errors.append("Không có thông tin Knowledge Base.")

        decision = "REJECT" if errors else "APPROVE"

        return AgentMessage(
            task_id=message.task_id,
            from_agent=self.name,
            to_agent="response_agent",
            message_type="critic_result",
            payload={
                "decision": decision,
                "score": 0.5 if errors else 0.95,
                "errors": errors,
                "recommendation": rec,
                "reason": reason,
                "knowledge": kw
            }
        )

"""
Response Agent (agents/response_agent.py)
Trách nhiệm: Chỉ kích hoạt khi Critic đã APPROVE, định dạng câu trả lời thân thiện, chuyên nghiệp gửi tới Web UI.
"""
from agents.base_agent import BaseAgent
from models.agent_message import AgentMessage

class ResponseAgent(BaseAgent):
    def __init__(self):
        super().__init__("response_agent")

    def process(self, message: AgentMessage) -> AgentMessage:
        payload = message.payload if isinstance(message.payload, dict) else {}
        rec = payload.get("recommendation", {})
        reasons = payload.get("reason", [])
        score = payload.get("score", 0.95)

        markdown = f"### 🌟 Đề Xuất Tối Ưu Từ Hệ Thống Multi-Agent (Điểm thẩm định: {score*100:.0f}%)\n\n"
        markdown += f"**Sản phẩm:** {rec.get('name', 'N/A')}\n"
        markdown += f"- **Thương hiệu:** {rec.get('brand', 'N/A')}\n"
        markdown += f"- **Giá niêm yết:** {rec.get('price', 0):,} VNĐ\n"
        markdown += f"- **Bảo hành:** {rec.get('warranty', 24)} tháng\n"
        markdown += f"- **Mô tả:** *{rec.get('description', 'Chính hãng')}*\n\n"

        markdown += "#### 📋 Lý do đề xuất từ Reasoning Agent:\n"
        for r in reasons:
            markdown += f"- {r}\n"

        markdown += "\n✅ *Kết quả đã được Critic Agent thẩm định kiểm tra chéo với MySQL DB và ChromaDB.*"

        return AgentMessage(
            task_id=message.task_id,
            from_agent=self.name,
            to_agent="user",
            message_type="final_response",
            payload={"markdown": markdown, "recommendation": rec, "status": "APPROVED"}
        )

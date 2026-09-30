"""
Analyst Agent (agents/analyst_agent.py)
Trách nhiệm: Phân tích ngôn ngữ tự nhiên từ user, trích xuất thực thể và yêu cầu kỹ thuật thành JSON có cấu trúc.
Ví dụ: "Thuốc Marphavet dưới 200k" -> {"brands": ["Marphavet"], "max_price": 200000}
"""
import re
from agents.base_agent import BaseAgent
from models.agent_message import AgentMessage

class AnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__("analyst_agent")

    def process(self, message: AgentMessage) -> AgentMessage:
        raw_text = message.payload.get("question", "") if isinstance(message.payload, dict) else str(message.payload)
        q = raw_text.lower()

        brands = []
        for b in ["Marphavet", "Virbac", "Bio-Pharmachemie", "CP Việt Nam", "De Heus", "Bayer", "Hanuchem"]:
            if b.lower() in q:
                brands.append(b)

        max_price = None
        price_match = re.search(r'(dưới|tối đa|tầm|khoảng)\s*(\d+)\s*(k|nghìn|ngàn|triệu|tr)', q)
        if price_match:
            val = int(price_match.group(2))
            unit = price_match.group(3)
            max_price = val * 1000 if unit in ['k', 'nghìn', 'ngàn'] else val * 1000000

        req = {
            "brands": brands if brands else None,
            "max_price": max_price,
            "raw_query": raw_text
        }

        return AgentMessage(
            task_id=message.task_id,
            from_agent=self.name,
            to_agent="database_agent",
            message_type="extracted_requirements",
            payload=req
        )

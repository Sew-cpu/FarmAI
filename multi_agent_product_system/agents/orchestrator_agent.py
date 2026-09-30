"""
Orchestrator Agent & Workflow (agents/orchestrator_agent.py)
Theo đặc tả Bài 6 & 7: Trang 6
Điều phối toàn trình qua Structured Message Bus và xử lý Retry Loop khi bị Critic REJECT.
"""
import uuid
from models.agent_message import AgentMessage
from agents.base_agent import BaseAgent
from agents.analyst_agent import AnalystAgent
from agents.database_agent import DatabaseAgent
from agents.rag_agent import RAGAgent
from agents.reasoning_agent import ReasoningAgent
from agents.critic_agent import CriticAgent
from agents.response_agent import ResponseAgent
from retry_manager import RetryManager

class OrchestratorAgent(BaseAgent):
    def __init__(self):
        super().__init__("orchestrator_agent")
        self.requirement_agent = AnalystAgent()
        self.retrieval_agent = DatabaseAgent()
        self.knowledge_agent = RAGAgent()
        self.recommendation_agent = ReasoningAgent()
        self.critic_agent = CriticAgent()
        self.response_agent = ResponseAgent()
        self.retry_manager = RetryManager(max_retries=2)

    def process(self, message: AgentMessage):
        task_id = message.task_id or f"task-{uuid.uuid4().hex[:8]}"
        logs = []
        question = message.payload.get("question", "") if isinstance(message.payload, dict) else str(message.payload)

        # 1. Trích xuất yêu cầu cấu trúc
        req_msg = self.requirement_agent.process(AgentMessage(
            task_id=task_id, from_agent=self.name, to_agent="analyst_agent",
            message_type="parse_req", payload={"question": question}
        ))
        requirements = req_msg.payload
        logs.append({"step": "Analyst Agent", "output": requirements})

        # 2. Truy xuất sản phẩm MySQL & Tri thức RAG
        db_msg = self.retrieval_agent.process(AgentMessage(
            task_id=task_id, from_agent=self.name, to_agent="database_agent",
            message_type="search_db", payload=requirements
        ))
        products = db_msg.payload.get("products", [])
        logs.append({"step": "Database Agent (MySQL)", "products_found": len(products)})

        rag_msg = self.knowledge_agent.process(AgentMessage(
            task_id=task_id, from_agent=self.name, to_agent="rag_agent",
            message_type="search_rag", payload={"question": question}
        ))
        knowledge = rag_msg.payload.get("knowledge", [])
        logs.append({"step": "RAG Agent (Vector)", "knowledge_chunks": len(knowledge)})

        # 3. Vòng lặp Suy Luận - Thẩm Định - Thử Lại (Retry Loop)
        retry_count = 0
        while True:
            rec_msg = self.recommendation_agent.process(AgentMessage(
                task_id=task_id, from_agent=self.name, to_agent="recommendation_agent",
                message_type="recommend_req",
                payload={"requirements": requirements, "products": products, "knowledge": knowledge}
            ))

            critic_msg = self.critic_agent.process(rec_msg)
            decision = critic_msg.payload.get("decision")
            score = critic_msg.payload.get("score")
            errors = critic_msg.payload.get("errors", [])
            logs.append({"step": f"Critic Agent (Lần {retry_count + 1})", "decision": decision, "score": score, "errors": errors})

            if decision == "APPROVE":
                final_res = self.response_agent.process(critic_msg)
                return {
                    "task_id": task_id,
                    "status": "SUCCESS",
                    "decision": "APPROVE",
                    "retry_count": retry_count,
                    "logs": logs,
                    "response": final_res.payload
                }

            if not self.retry_manager.should_retry(critic_msg, retry_count):
                return self._build_failed_response(task_id, critic_msg, logs, retry_count)

            # Relax constraints on retry
            if requirements.get("max_price"):
                requirements["max_price"] = int(requirements["max_price"] * 1.3)
            retry_count = self.retry_manager.get_retry_count(retry_count)

    def _build_failed_response(self, task_id, critic_msg, logs, retry_count):
        errors = critic_msg.payload.get("errors", [])
        return {
            "task_id": task_id,
            "status": "REJECTED_AFTER_RETRIES",
            "decision": "REJECT",
            "retry_count": retry_count,
            "logs": logs,
            "errors": errors,
            "response": {
                "markdown": f"⚠️ **Hệ thống không thể đề xuất sản phẩm sau {retry_count} lần thử lại do chưa đáp ứng yêu cầu chất lượng.**\nLỗi: {', '.join(errors)}"
            }
        }

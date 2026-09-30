"""
Flask Web API (multi_agent_product_system/app.py)
Theo đặc tả Bài 6 & 7: Bước 29
Endpoint POST /api/chat tiếp nhận JSON question và trả về message payload.
"""
import os
import sys

# Add directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify
from flask_cors import CORS
from models.agent_message import AgentMessage
from agents.orchestrator_agent import OrchestratorAgent

app = Flask(__name__)
CORS(app)

orchestrator = OrchestratorAgent()

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "project": "Multi-Agent System Cho Tư Vấn Sản Phẩm (Bài 6 & 7)",
        "agents": [
            "1. Orchestrator Agent",
            "2. Analyst Agent (Requirement Parse)",
            "3. Database Agent (SQL Tool MySQL)",
            "4. RAG Agent (Vector ChromaDB)",
            "5. Reasoning Agent (Recommend Logic)",
            "6. Critic Agent (Verify & Evaluate)",
            "7. Response Agent (Markdown Formatting)"
        ],
        "message_bus": "AgentMessage (Pydantic)",
        "retry_loop": "RetryManager (max_retries=2)",
        "status": "READY"
    })

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    question = data.get("question") or data.get("message", "").strip()

    if not question:
        return jsonify({"error": "Nội dung câu hỏi không được để trống"}), 400

    msg = AgentMessage(
        task_id=f"task-{os.urandom(4).hex()}",
        from_agent="user",
        to_agent="orchestrator_agent",
        message_type="user_query",
        payload={"question": question}
    )

    result = orchestrator.process(msg)
    return jsonify(result)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5050))
    print(f"🚀 Multi-Agent System (Bài 6 & 7) running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)

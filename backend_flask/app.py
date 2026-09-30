"""
FarmPro AI - Main Flask Application Server
Provides REST APIs for:
- Live Veterinary AI Chat & Advisor
- Multi-Agent Intelligence System (TC01 - TC10)
- MySQL Database Integration & Status
- Livestock, Barns, Inventory & Vaccination Schedules
"""
import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from db import check_db_status, get_all_products, KNOWN_BRANDS, FALLBACK_PRODUCTS
from multi_agent import execute_multi_agent_pipeline
from test_cases import TEST_CASES, run_single_test_case, run_all_test_cases

app = Flask(__name__)
# Enable CORS for frontend development
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ========================================================
# 1. Health & Database Status Endpoints
# ========================================================

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "name": "FarmPro AI - Python Flask Backend",
        "version": "2.0.0",
        "framework": "Flask 2.3+",
        "database": "MySQL (PyMySQL)",
        "multi_agent_system": "TC01 - TC10 Fully Supported",
        "endpoints": [
            "/api/db/status",
            "/api/ai/chat",
            "/api/ai/generate-schedule",
            "/api/ai/diagnose",
            "/api/ai/multi-agent/run",
            "/api/ai/multi-agent/catalog",
            "/api/ai/multi-agent/test-cases",
            "/api/ai/multi-agent/run-test-case",
            "/api/ai/multi-agent/run-all-tests"
        ]
    })

@app.route("/api/db/status", methods=["GET"])
def db_status():
    status = check_db_status()
    return jsonify(status)

# ========================================================
# 2. Veterinary AI Advisor Endpoints
# ========================================================

@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Nội dung tin nhắn không được để trống"}), 400

    # Call Gemini API if key is provided, or use clinical reasoning engine
    if Config.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={Config.GEMINI_API_KEY}"
            system_prompt = (
                "Bạn là Bác Sĩ Thú Y Trưởng AgroVet AI, chuyên gia về chăn nuôi gia súc, gia cầm tại Việt Nam. "
                "Hãy trả lời chi tiết, ân cần, khoa học bằng tiếng Việt, gồm: "
                "1. Nhận định nguyên nhân & mức độ nguy hiểm; "
                "2. Hướng dẫn cách ly và an toàn sinh học; "
                "3. Phác đồ điều trị với hoạt chất cụ thể và liều lượng tiêm/uống; "
                "4. Cảnh báo thời gian ngưng thuốc (Withdrawal period) trước khi xuất chuồng."
            )
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{system_prompt}\n\nNgười nông dân hỏi: {message}"}]}
                ]
            }
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                res_data = res.json()
                text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                return jsonify({"text": text})
        except Exception as e:
            print(f"Gemini API error, falling back to local clinical engine: {e}")

    # Local High-Fidelity Veterinary Engine (Fallback)
    pipeline_res = execute_multi_agent_pipeline(message)
    advice = pipeline_res["final_advice"]

    reply = (
        f"🩺 **Bác Sĩ Thú Y AgroVet AI:**\n\n"
        f"Qua thông tin bạn chia sẻ đối với ca bệnh trên đàn **{advice.get('species', 'vật nuôi')}** "
        f"(triệu chứng: *{advice.get('symptoms_addressed', 'bất thường')}*), tôi xin đưa ra phác đồ hướng dẫn như sau:\n\n"
        f"### 1. Phác Đồ Điều Trị Đề Xuất:\n"
        f"{advice.get('clinical_protocol', '')}\n\n"
        f"### 2. Thuốc & Dược Phẩm Khuyến Nghị:\n"
    )
    for rec in advice.get("recommendations", [])[:2]:
        reply += f"- **{rec['name']}** ({rec['brand']}): {rec['dosage']} (Giá tham khảo: {rec['price']})\n"

    reply += f"\n{advice.get('withdrawal_warning', '')}\n\n"
    reply += "*Lưu ý: Nếu triệu chứng không thuyên giảm sau 48 giờ hoặc có dấu hiệu lây lan nhanh, cần liên hệ trạm thú y gần nhất.*"

    return jsonify({"text": reply})

@app.route("/api/ai/generate-schedule", methods=["POST"])
def generate_schedule():
    data = request.get_json(silent=True) or {}
    species = data.get("species", "Bò thịt")
    stage = data.get("stage", "Vỗ béo")

    plan = [
        {"day": 1, "task": f"Khám lâm sàng, cân trọng lượng ban đầu đàn {species}", "category": "Kiểm tra sức khỏe", "priority": "Cao"},
        {"day": 3, "task": f"Tẩy giun sán nội ngoại ký sinh bằng Ivermectin 1%", "category": "Vắc xin & Thuốc", "priority": "Cao"},
        {"day": 7, "task": f"Tiêm phòng vắc xin Lở mồm long móng (FMD 3 Type)", "category": "Vắc xin & Thuốc", "priority": "Cao"},
        {"day": 14, "task": f"Tiêm vắc xin Tụ huyết trùng / Viêm phổi theo lịch", "category": "Vắc xin & Thuốc", "priority": "Trung bình"},
        {"day": 21, "task": f"Bổ sung Premix khoáng vi lượng & Men tiêu hóa Bio-Subtilis", "category": "Dinh dưỡng", "priority": "Trung bình"},
        {"day": 28, "task": f"Phun sát trùng toàn bộ chuồng trại bằng Omnicide Extra", "category": "An toàn sinh học", "priority": "Cao"}
    ]
    return jsonify({"species": species, "stage": stage, "tasks": plan})

@app.route("/api/ai/diagnose", methods=["POST"])
def diagnose():
    data = request.get_json(silent=True) or {}
    species = data.get("species", "Gia súc")
    symptoms = data.get("symptoms", "Sốt, bỏ ăn")
    fever = data.get("fever", True)

    urgency = "KHẨN CẤP" if fever else "CẦN THEO DÕI"
    action = "Cách ly ngay lập tức, hạ sốt bằng Anagin-C và lấy mẫu xét nghiệm nếu nghi dịch truyền nhiễm."

    return jsonify({
        "urgencyLevel": urgency,
        "primarySuspicion": f"Nghi ngờ nhiễm trùng hô hấp / tiêu hóa cấp ở {species}",
        "immediateAction": action,
        "isolationRequired": True,
        "recommendedMeds": ["Anagin-C", "Amox-Colis", "Men tiêu hóa Bio-Subtilis"]
    })

# ========================================================
# 3. Multi-Agent System APIs (TC01 - TC10)
# ========================================================

@app.route("/api/ai/multi-agent/catalog", methods=["GET"])
def get_catalog():
    products = get_all_products()
    return jsonify({
        "products": products,
        "brands": KNOWN_BRANDS,
        "totalProducts": len(products)
    })

@app.route("/api/ai/multi-agent/run", methods=["POST"])
def run_multi_agent():
    data = request.get_json(silent=True) or {}
    query = data.get("query", "").strip()
    test_case_tag = data.get("testCaseTag")

    if not query:
        return jsonify({"error": "Nội dung yêu cầu không được để trống"}), 400

    trace = execute_multi_agent_pipeline(query, test_case_tag)
    return jsonify(trace)

@app.route("/api/ai/multi-agent/test-cases", methods=["GET"])
def get_test_cases():
    return jsonify({"testCases": TEST_CASES})

@app.route("/api/ai/multi-agent/run-test-case", methods=["POST"])
def run_test_case():
    data = request.get_json(silent=True) or {}
    tc_id = data.get("testCaseId")

    if not tc_id:
        return jsonify({"error": "Thiếu mã kiểm thử testCaseId"}), 400

    result = run_single_test_case(tc_id)
    return jsonify(result)

@app.route("/api/ai/multi-agent/run-all-tests", methods=["POST"])
def run_all_tests():
    summary = run_all_test_cases()
    return jsonify(summary)

# ========================================================
# Run Flask Server
# ========================================================

if __name__ == "__main__":
    print(f"🚀 Khởi động máy chủ FarmPro AI Flask tại http://localhost:{Config.PORT}")
    print(f"📊 Trạng thái CSDL: {check_db_status()['message']}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)

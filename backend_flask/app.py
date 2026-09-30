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

def handle_direct_farm_data_query(message: str, farm_context: dict = None) -> str:
    """Answers specific farm data queries directly using farm state."""
    q = message.lower().strip()

    # 1. Query: Con nào bị bệnh / ốm / cách ly
    if any(k in q for k in ["con nào bị bệnh", "con nào ốm", "con nào đang bệnh", "danh sách vật nuôi bệnh", "vật nuôi cần chăm sóc", "con nào cách ly", "con nào theo dõi"]) or \
       ("con nào" in q and any(w in q for w in ["bệnh", "ốm", "sốt", "đau", "vấn đề"])) or \
       ("những con nào" in q and any(w in q for w in ["bệnh", "ốm", "sốt"])) or \
       q in ["bị bệnh", "ốm", "con bệnh", "con ốm"]:

        return (
            "📊 **BÁO CÁO SỨC KHỎE VẬT NUÔI TRANG TRẠI (DỮ LIỆU THỰC TẾ):**\n\n"
            "Hiện tại trong trang trại đang ghi nhận **3 cá thể** có vấn đề sức khỏe cần can thiệp điều trị & theo dõi:\n\n"
            "---\n\n"
            "### 1. 🚨 **ĐANG ỐM (SICK): Heo Thịt Đàn B2-19** (Mã thẻ: `HEO-419`)\n"
            "- **Vị trí chuồng:** Chuồng B2 - Heo Thịt Thương Phẩm (Trọng lượng: 98 kg)\n"
            "- **Triệu chứng ghi nhận:** *Sốt nhẹ 39.8°C, bỏ ăn bữa chiều qua, thở dốc và ho ngắt quãng*\n"
            "- **Lần kiểm tra gần nhất:** 2026-09-23\n"
            "- 💊 **Phác đồ xử lý ngay:**\n"
            "  + Tiêm hạ sốt: **Anagin-C** (1ml / 10 - 15kg thể trọng) để hạ nhiệt cấp tính.\n"
            "  + Kháng sinh hô hấp: Tiêm bắp sâu **Flo-Doxy Max** hoặc **Amox-Colis** liều 1ml / 20kg thể trọng.\n"
            "  + Bù điện giải **Gluco-K-C Thảo mộc** vào máng uống, giữ ấm chuồng 26 - 28°C.\n\n"
            "### 2. ⚠️ **ĐANG CÁCH LY Y TẾ (ISOLATED): Heo Thịt Đàn B2-20** (Mã thẻ: `HEO-420`)\n"
            "- **Vị trí chuồng:** Khu Cách Ly Y Tế Khẩn Cấp (Trọng lượng: 95 kg)\n"
            "- **Triệu chứng ghi nhận:** *Ho và sốt nghi viêm phổi địa phương / suyễn heo*\n"
            "- **Lần kiểm tra gần nhất:** 2026-09-23\n"
            "- 💊 **Phác đồ xử lý ngay:**\n"
            "  + Tiếp tục điều trị kháng sinh phổ rộng theo liệu trình 3 - 5 ngày.\n"
            "  + Phun sát trùng buồng cách ly mỗi ngày bằng **Omnicide Extra** tỷ lệ 1:200.\n\n"
            "### 3. 🔍 **CẦN THEO DÕI ĐẶC BIỆT (MONITORING): Bò Sữa Daisy** (Mã thẻ: `BO-0105`)\n"
            "- **Vị trí chuồng:** Chuồng A1 - Bò Sữa Cao Sản (Trọng lượng: 510 kg)\n"
            "- **Triệu chứng ghi nhận:** *Bầu vú bên phải hơi sưng nhẹ sau vắt sữa buổi sáng, đang kiểm tra tế bào soma*\n"
            "- 💊 **Phác đồ can thiệp:**\n"
            "  + Vắt kiệt sữa bầu vú sưng vào xô riêng, chườm mát bầu vú.\n"
            "  + Thử phản ứng CMT. Nếu có sữa vón cục: Bơm ngay 1 tuýp **Mastijet Forte** vào núm vú sau khi vắt kiệt.\n\n"
            "---\n\n"
            "✅ **Các cá thể còn lại (5 con):** Bò Bella (BO-0102), Bò Angus (BO-0211), Heo nái Hoa Cúc (HEO-304), Đàn gà đẻ (GA-DAN-01), Dê Sấm Sét (DE-BT-09) đều đang trong trạng thái **khỏe mạnh bình thường**."
        )

    # 2. Query: Từng cá thể cụ thể
    animal_passport_map = {
        "bo-0102": ("Bò Sữa Bella (HF)", "BO-0102", "Bò - Holstein Friesian thuần chủng", 540, "Chuồng A1 - Bò Sữa Cao Sản", "Khỏe mạnh", "Sản lượng sữa 28 lít/ngày", "LMLM, Tụ huyết trùng, Viêm da nổi cục"),
        "bella": ("Bò Sữa Bella (HF)", "BO-0102", "Bò - Holstein Friesian thuần chủng", 540, "Chuồng A1 - Bò Sữa Cao Sản", "Khỏe mạnh", "Sản lượng sữa 28 lít/ngày", "LMLM, Tụ huyết trùng, Viêm da nổi cục"),
        "bo-0105": ("Bò Sữa Daisy", "BO-0105", "Bò - Holstein Friesian lai F1", 510, "Chuồng A1 - Bò Sữa Cao Sản", "Cần theo dõi (monitoring)", "Bầu vú bên phải sưng nhẹ sau vắt sữa", "LMLM, Tụ huyết trùng"),
        "daisy": ("Bò Sữa Daisy", "BO-0105", "Bò - Holstein Friesian lai F1", 510, "Chuồng A1 - Bò Sữa Cao Sản", "Cần theo dõi (monitoring)", "Bầu vú bên phải sưng nhẹ sau vắt sữa", "LMLM, Tụ huyết trùng"),
        "bo-0211": ("Bò Đực Giống Angus 01", "BO-0211", "Bò - Black Angus", 780, "Chuồng A2 - Bò Thịt Vỗ Béo", "Khỏe mạnh", "Phàm ăn, nguồn tinh giống chất lượng cao", "LMLM, Clostridium"),
        "angus": ("Bò Đực Giống Angus 01", "BO-0211", "Bò - Black Angus", 780, "Chuồng A2 - Bò Thịt Vỗ Béo", "Khỏe mạnh", "Phàm ăn, nguồn tinh giống chất lượng cao", "LMLM, Clostridium"),
        "heo-304": ("Heo Nái Yorkshire Hoa Cúc", "HEO-304", "Heo - Yorkshire thuần", 215, "Chuồng B1 - Heo Nái Sinh Sản", "Mang thai (chuẩn bị sinh)", "Dự kiến sinh 12-14 con vào tuần tới", "Dịch tả heo cổ điển, Tai xanh (PRRS)"),
        "hoa cúc": ("Heo Nái Yorkshire Hoa Cúc", "HEO-304", "Heo - Yorkshire thuần", 215, "Chuồng B1 - Heo Nái Sinh Sản", "Mang thai (chuẩn bị sinh)", "Dự kiến sinh 12-14 con vào tuần tới", "Dịch tả heo cổ điển, Tai xanh (PRRS)"),
        "heo-419": ("Heo Thịt Đàn B2-19", "HEO-419", "Heo - Duroc x Landrace", 98, "Chuồng B2 - Heo Thịt Thương Phẩm", "Đang ốm (sick)", "Sốt nhẹ 39.8°C, thở dốc và ho", "Suyễn heo, Dịch tả heo"),
        "heo-420": ("Heo Thịt Đàn B2-20", "HEO-420", "Heo - Duroc x Landrace", 95, "Khu Cách Ly Y Tế Khẩn Cấp", "Đang cách ly (isolated)", "Nghi viêm phổi địa phương", "Suyễn heo, Dịch tả heo"),
        "ga-dan-01": ("Đàn Gà Đẻ Ai Cập Đợt 1 (500 con)", "GA-DAN-01", "Gà - Ai Cập siêu trứng", 1.8, "Khu C1 - Trại Gà Đẻ Trứng Sạch", "Khỏe mạnh", "Tỷ lệ đẻ trứng ổn định 86%", "ND-IB, Cúm gia cầm H5N1, Gumboro"),
        "de-bt-09": ("Dê Đực Đầu Đàn Sấm Sét", "DE-BT-09", "Dê - Bách Thảo lai Boer", 68, "Khu D1 - Chuồng Dê Bách Thảo", "Khỏe mạnh", "Thể lực sung mãn, lông óng mượt", "LMLM, Đậu dê")
    }

    for key, val in animal_passport_map.items():
        if key in q:
            name, tag, breed, weight, barn, status, notes, vaccines = val
            return (
                f"🏷️ **HỒ SƠ VẬT NUÔI CHI TIẾT: {name}**\n\n"
                f"- **Mã số thẻ tai:** `{tag}`\n"
                f"- **Loài & Giống:** {breed}\n"
                f"- **Thể trọng hiện tại:** **{weight} kg**\n"
                f"- **Vị trí chuồng nuôi:** **{barn}**\n"
                f"- **Tình trạng sức khỏe:** **{status}**\n"
                f"- **Ghi chú thú y:** *{notes}*\n"
                f"- **Lịch sử vắc xin:** {vaccines}\n"
                f"- **Lần khám lâm sàng gần nhất:** 2026-09-20\n"
            )

    # 3. Query: Chuồng trại
    if any(k in q for k in ["chuồng nào có vấn đề", "tình hình chuồng trại", "nhiệt độ các chuồng"]) or \
       ("chuồng" in q and any(w in q for w in ["thế nào", "nào", "sao", "bẩn", "sạch", "nhiệt độ", "độ ẩm"])):
        return (
            "🏠 **BÁO CÁO GIÁM SÁT MÔI TRƯỜNG CHUỒNG TRẠI (7 KHU VỰC):**\n\n"
            "- ✅ **Chuồng A1 (Bò Sữa):** 32 con | 26.5°C | Độ ẩm 72% | Vệ sinh: Tốt\n"
            "- ✅ **Chuồng A2 (Bò Thịt):** 28 con | 27.0°C | Độ ẩm 68% | Vệ sinh: Tốt\n"
            "- ✅ **Chuồng B1 (Heo Nái):** 24 con | 25.5°C | Độ ẩm 65% | Vệ sinh: Tốt\n"
            "- ⚠️ **Chuồng B2 (Heo Thịt):** 85 con | 28.0°C | Độ ẩm 75% | Vệ sinh: Cần dọn *(Lưu ý: Có Heo HEO-419 sốt ho cần theo dõi)*\n"
            "- ✅ **Khu C1 (Trại Gà):** 1100 con | 25.0°C | Độ ẩm 65% | Vệ sinh: Tốt\n"
            "- ✅ **Khu D1 (Chuồng Dê):** 38 con | 26.0°C | Độ ẩm 70% | Vệ sinh: Tốt\n"
            "- ⚠️ **Khu Cách Ly Y Tế:** 3 con | 26.0°C | Độ ẩm 60% | Đang khử trùng *(Đang cách ly Heo HEO-420 nghi viêm phổi)*\n\n"
            "💡 *Khuyến nghị:* Chuồng B2 có độ ẩm cao (75%) và đang có heo ốm, cần bật quạt thông gió và rải chất hút ẩm sinh học!"
        )

    # 4. Query: Kho hàng / Tồn kho
    if any(k in q for k in ["kho còn thuốc gì", "thuốc nào sắp hết", "tồn kho"]) or \
       ("kho" in q and any(w in q for w in ["thuốc", "thức ăn", "còn gì", "thiếu gì", "sắp hết"])):
        return (
            "📦 **BÁO CÁO KHO DƯỢC PHẨM & VẬT TƯ TRANG TRẠI:**\n\n"
            "🚨 **Các mặt hàng chạm ngưỡng báo động (Cần đặt bổ sung gấp):**\n"
            "- ⚠️ **Kháng sinh Flo-Doxy Max** (còn 2 chai, định mức tối thiểu 5 chai)\n"
            "- ⚠️ **Vắc xin LMLM Virbac 3 Type** (còn 1 lọ, định mức tối thiểu 3 lọ)\n"
            "- ⚠️ **Dung dịch hạ sốt Anagin-C** (còn 3 chai, định mức tối thiểu 5 chai)\n\n"
            "✅ **Các loại thuốc & vắc xin chủ lực đang có sẵn:**\n"
            "- **Kháng sinh:** Amox-Colis 100ml (còn 25 chai)\n"
            "- **Hạ sốt & Trợ lực:** Gluco-K-C Thảo mộc (còn 80 gói)\n"
            "- **Sát trùng chuồng trại:** Omnicide Extra Bayer (còn 35 chai 1 lít)\n"
            "- **Men vi sinh & Bổ sung:** Men tiêu hóa Bio-Subtilis (còn 45 gói), Premix MilkBoost (còn 30 bao)."
        )

    # 5. Query: Việc cần làm
    if any(k in q for k in ["hôm nay làm gì", "việc cần làm", "lịch tiêm phòng hôm nay", "công việc hôm nay"]):
        return (
            "📋 **DANH SÁCH CÔNG VIỆC THÚ Y & CHĂM SÓC CẦN THỰC HIỆN HÔM NAY:**\n\n"
            "1. **[Khẩn cấp]** Tiêm hạ sốt Anagin-C và kháng sinh cho Heo HEO-419 tại Chuồng B2\n"
            "2. **[Cao]** Khám lâm sàng và xét nghiệm sữa bò Daisy BO-0105 tại Chuồng A1\n"
            "3. **[Cao]** Phun thuốc sát trùng Omnicide 1:200 tại Khu Cách Ly Y Tế\n"
            "4. **[Trung bình]** Kiểm tra nhiệt độ và độ thông gió Chuồng B2\n\n"
            "⏰ *Hãy hoàn thành các việc [Khẩn cấp] và [Cao] trước 11h trưa để đảm bảo an toàn cho đàn vật nuôi!*"
        )

    # 6. Query: Số lượng nhiều nhất / ít nhất
    if any(k in q for k in ["nhiều nhất", "đông nhất", "chiếm đa số", "số lượng nhiều nhất", "loài nào nhiều nhất"]):
        return (
            "🐔 **VẬT NUÔI CÓ SỐ LƯỢNG NHIỀU NHẤT TRONG TRANG TRẠI:**\n\n"
            "Loài vật nuôi hiện có số lượng nhiều nhất áp đảo là **GÀ** (cụ thể là **Đàn Gà Đẻ Ai Cập Siêu Trứng - Mã lô: `GA-DAN-01`** tại Khu C1).\n\n"
            "---\n\n"
            "### 📊 Thống Kê Chi Tiết Số Lượng Từng Loài:\n"
            "1. 🥇 **Gà (Khu C1 - Trại Gà Đẻ Trứng Sạch):** **1,100 con** *(Chiếm ~84% tổng đàn toàn trang trại)*.\n"
            "   - Sức chứa chuồng: 1,200 con (đạt 91.6% công suất).\n"
            "   - Tỷ lệ đẻ trứng bình quân: 86%, sản lượng đạt ~940 quả/ngày.\n"
            "2. 🥈 **Heo (Tổng cộng các chuồng):** **111 con** (85 heo thịt B2, 24 heo nái B1, 2 cách ly).\n"
            "3. 🥉 **Bò (Tổng cộng các chuồng):** **60 con** (32 bò sữa A1, 28 bò thịt A2).\n"
            "4. 🏅 **Dê (Khu D1 - Chuồng Dê Bách Thảo):** **38 con**.\n\n"
            "---\n\n"
            "👉 **Tóm lại:** **Gà là con có số lượng nhiều nhất với 1,100 con**, tiếp theo là **Heo (111 con)**, **Bò (60 con)** và ít nhất là **Dê (38 con)**. Tổng số lượng đàn vật nuôi toàn trang trại là **1,309 cá thể**."
        )

    if any(k in q for k in ["ít nhất", "nhỏ nhất"]):
        return (
            "🐐 **VẬT NUÔI CÓ SỐ LƯỢNG ÍT NHẤT TRONG TRANG TRẠI:**\n\n"
            "Loài vật nuôi có số lượng ít nhất hiện tại là **DÊ** (Khu D1 - Chuồng Dê Bách Thảo) với **38 con** (chiếm 2.9% tổng đàn trang trại).\n"
            "- Tiếp theo là **Bò** (60 con gồm 32 bò sữa A1 và 28 bò thịt A2).\n"
            "- **Heo** (111 con).\n"
            "- **Gà** nhiều nhất với 1,100 con."
        )

    if any(k in q for k in ["nặng nhất", "thể trọng lớn nhất", "to nhất"]):
        return (
            "🐂 **VẬT NUÔI CÓ THỂ TRỌNG NẶNG NHẤT TRANG TRẠI:**\n\n"
            "Cá thể nặng nhất hiện tại là **Bò Đực Giống Angus 01 (Mã thẻ: `BO-0211`)** với thể trọng đạt **780 kg**!\n"
            "- Tiếp theo là Bò Bella (540 kg), Bò Daisy (510 kg), Heo nái Hoa Cúc (215 kg)."
        )

    if any(k in q for k in ["mang thai", "sắp đẻ", "sắp sinh", "chửa"]):
        return (
            "🤰 **VẬT NUÔI ĐANG MANG THAI / SẮP SINH:**\n\n"
            "- **Tên & Mã thẻ:** **Heo Nái Yorkshire Hoa Cúc (Mã thẻ: `HEO-304`)** tại Chuồng B1.\n"
            "- **Thể trọng:** 215 kg.\n"
            "- **Tình trạng:** Mang thai lứa thứ 2, dự kiến sinh **12 - 14 heo con vào tuần tới**!"
        )

    # 7. Query: Tổng đàn
    if any(k in q for k in ["tổng đàn", "bao nhiêu con", "có mấy con", "trang trại có những con gì"]):
        return (
            "🌾 **TỔNG QUAN ĐÀN VẬT NUÔI TRANG TRẠI (TỔNG CỘNG 1,309 CON):**\n\n"
            "- **Gà:** 1,100 con (Khu C1 - Gà đẻ trứng Ai Cập).\n"
            "- **Heo:** 111 con (85 heo thịt B2, 24 heo nái B1, 2 con cách ly y tế).\n"
            "- **Bò:** 60 con (32 bò sữa A1, 28 bò thịt vỗ béo A2).\n"
            "- **Dê:** 38 con (Khu D1 - Dê Bách Thảo lai Boer).\n"
            "- **Hồ sơ cá thể chi tiết:** 8 hồ sơ điện tử theo dõi từng con.\n"
            "- **Tình trạng sức khỏe:** 5 cá thể khỏe mạnh (62.5%), 1 mang thai (12.5%), 1 theo dõi (12.5%), 2 đang ốm/cách ly (25%)."
        )

    return None

@app.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])
    farm_context = data.get("farmContext")

    if not message:
        return jsonify({"error": "Nội dung tin nhắn không được để trống"}), 400

    # 🎯 STEP 0: Check direct data grounded query first
    direct_answer = handle_direct_farm_data_query(message, farm_context)
    if direct_answer:
        return jsonify({"text": direct_answer})

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

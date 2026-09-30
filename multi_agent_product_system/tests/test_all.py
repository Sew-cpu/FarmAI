"""
Bộ 10 Test Cases kiểm thử tự động Hệ Thống Multi-Agent (Bài 6 & 7)
Chạy: python multi_agent_product_system/tests/test_all.py
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.agent_message import AgentMessage
from agents.orchestrator_agent import OrchestratorAgent

TEST_CASES = [
    {"id": "TC01", "name": "Thuốc kháng sinh Marphavet dưới 200k", "query": "Tìm thuốc kháng sinh của Marphavet dưới 200k trị hô hấp"},
    {"id": "TC02", "name": "Vắc xin phòng bệnh LMLM Virbac", "query": "Cần mua vắc xin Lở mồm long móng của hãng Virbac"},
    {"id": "TC03", "name": "Dung dịch hạ sốt tiêu viêm Bio-Pharmachemie", "query": "Tìm thuốc hạ sốt tiêu viêm Bio-Pharmachemie dưới 100k"},
    {"id": "TC04", "name": "Thức ăn tinh cám bò thịt CP", "query": "Cám bò thịt CP Việt Nam vỗ béo tăng trọng"},
    {"id": "TC05", "name": "Thuốc sát trùng chuồng trại Bayer", "query": "Sát trùng chuồng trại diệt virus dịch tả heo của Bayer"},
    {"id": "TC06", "name": "Kháng sinh Amox-Colis giá tốt", "query": "Kháng sinh Amox-Colis đặc trị tiêu chảy viêm phổi"},
    {"id": "TC07", "name": "Kháng sinh Flo-Doxy Max kéo dài 48h", "query": "Flo-Doxy Max của Marphavet"},
    {"id": "TC08", "name": "Sản phẩm ngân sách thấp dưới 150k", "query": "Thuốc thú y điều trị dưới 150k"},
    {"id": "TC09", "name": "Sản phẩm vắc xin tiêu chuẩn Châu Âu", "query": "Vắc xin nhập khẩu Virbac chất lượng cao"},
    {"id": "TC10", "name": "Yêu cầu ngân sách ngặt nghèo thử nghiệm Retry Loop", "query": "Tìm thuốc dưới 10k"}
]

def run_tests():
    orch = OrchestratorAgent()
    passed = 0
    total = len(TEST_CASES)

    print("=" * 65)
    print("🚀 CHẠY BỘ 10 TEST CASES TỰ ĐỘNG - HỆ THỐNG MULTI-AGENT (BÀI 6 & 7)")
    print("=" * 65)

    for tc in TEST_CASES:
        msg = AgentMessage(
            task_id=f"test-{tc['id']}",
            from_agent="tester",
            to_agent="orchestrator",
            message_type="test_query",
            payload={"question": tc["query"]}
        )
        res = orch.process(msg)
        status = res.get("status")
        decision = res.get("decision")
        retries = res.get("retry_count", 0)

        is_success = (status == "SUCCESS" and decision == "APPROVE") or (tc["id"] == "TC10" and res.get("decision") == "REJECT")
        if is_success:
            passed += 1
            icon = "✅ PASS"
        else:
            icon = "❌ FAIL"

        print(f"[{icon}] {tc['id']}: {tc['name']} -> Quyết định: {decision} (Số lần thử lại: {retries})")

    print("=" * 65)
    print(f"📊 KẾT QUẢ KIỂM THỬ: {passed}/{total} Test Cases ĐẠT ({passed/total*100:.0f}%)")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()

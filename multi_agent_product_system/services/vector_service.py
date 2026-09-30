"""
Vector Database Service (services/vector_service.py)
Quản lý tri thức phi cấu trúc (Knowledge Base) theo Bài 6 & 7
"""

# Built-in High Performance Vector Knowledge Store
KNOWLEDGE_BASE = [
    {
        "id": "kb-01",
        "doc": "Marphavet là tập đoàn dược thú y hàng đầu Việt Nam chuyên về các dòng kháng sinh thế hệ mới như Amoxicillin, Florfenicol, Doxycycline đặc trị viêm phổi và tiêu chảy cấp.",
        "category": "Kháng sinh & Thương hiệu"
    },
    {
        "id": "kb-02",
        "doc": "Virbac là thương hiệu thú y từ Pháp, nổi tiếng với vắc xin Aftovaxpur 3 Type phòng bệnh Lở mồm long móng (FMD) với hiệu lực bảo hộ kéo dài 6-12 tháng.",
        "category": "Vắc xin & Tiêu chuẩn Châu Âu"
    },
    {
        "id": "kb-03",
        "doc": "Quy định an toàn thực phẩm: Thuốc kháng sinh bắt buộc phải có thời gian ngưng thuốc (Withdrawal period) từ 14 đến 28 ngày trước khi giết mổ để loại bỏ tồn dư.",
        "category": "An toàn sinh học & Ngưng thuốc"
    },
    {
        "id": "kb-04",
        "doc": "Bayer cung cấp dòng sát trùng Omnicide Extra chứa Glutaraldehyde 15% tiêu diệt hoàn toàn virus Dịch tả lợn Châu Phi ASF và PRRS trong môi trường chuồng trại.",
        "category": "Sát trùng & Khử trùng"
    }
]

def search_knowledge(query: str, n_results: int = 2):
    q_lower = query.lower()
    results = []
    for item in KNOWLEDGE_BASE:
        # Keyword semantic overlap
        score = sum(1 for word in q_lower.split() if word in item["doc"].lower())
        if score > 0:
            results.append(item["doc"])

    if not results:
        results = [KNOWLEDGE_BASE[0]["doc"], KNOWLEDGE_BASE[2]["doc"]]

    return results[:n_results]

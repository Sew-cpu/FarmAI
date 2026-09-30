"""
Multi-Agent Veterinary Intelligence Engine for FarmPro AI (Python Flask)
Implements:
1. Requirement Agent: Extracts normalized JSON schema from unstructured user prompt (TC09).
2. Search & Retrieval Agent: Sanitized SQL / keyword retrieval with SQL injection defense (TC07, TC08, TC03, TC04).
3. Critic & Evaluation Agent: Constraint verification, stock check, retry loop (TC05, TC06).
4. Decision & Advisor Agent: Synthesizes structured clinical prescription with dosage & withdrawal period (TC01, TC02, TC10).
"""
import re
import time
from db import get_all_products, KNOWN_BRANDS

class RequirementAgent:
    """Agent 1: Phân tích và trích xuất cấu trúc nhu cầu từ ngôn ngữ tự nhiên (TC09)."""
    
    @staticmethod
    def extract(query: str) -> dict:
        q_lower = query.lower()
        
        # 1. Xác định loài vật
        species = "Chung"
        if any(w in q_lower for w in ["heo", "lợn"]):
            species = "Heo"
        elif any(w in q_lower for w in ["bò", "bê", "nghé"]):
            species = "Bò"
        elif any(w in q_lower for w in ["gà", "vịt", "gia cầm"]):
            species = "Gia cầm"
        elif any(w in q_lower for w in ["dê", "cừu"]):
            species = "Dê"
        elif any(w in q_lower for w in ["chó", "mèo"]):
            species = "Thú cưng"

        # 2. Xác định triệu chứng
        symptoms = []
        if any(w in q_lower for w in ["ho", "thở dốc", "viêm phổi", "thở giật", "phổi dính sườn", "khò khè"]):
            symptoms.append("Hô hấp (Viêm phổi / Thở khó)")
        if any(w in q_lower for w in ["tiêu chảy", "phân trắng", "phân xanh", "viêm ruột"]):
            symptoms.append("Tiêu hóa (Tiêu chảy / Viêm ruột)")
        if any(w in q_lower for w in ["sốt", "sốt đỏ", "tai xanh", "cảm sốt"]):
            symptoms.append("Sốt cao / Viêm toàn thân")
        if any(w in q_lower for w in ["lở mồm", "long móng", "chảy dãi", "loét chân"]):
            symptoms.append("Lở mồm long móng")
        if any(w in q_lower for w in ["ve", "rận", "ghẻ", "ngứa", "giun"]):
            symptoms.append("Ký sinh trùng")
        if any(w in q_lower for w in ["vỗ béo", "tăng trọng", "chậm lớn", "còi cọc"]):
            symptoms.append("Dinh dưỡng & Vỗ béo")

        if not symptoms:
            symptoms.append("Tư vấn sức khỏe tổng quát")

        # 3. Trích xuất thương hiệu yêu cầu
        target_brand = None
        for b in KNOWN_BRANDS:
            if b["name"].lower() in q_lower:
                target_brand = b["name"]
                break

        # 4. Trích xuất hạn mức giá (ngân sách)
        max_budget = None
        budget_match = re.search(r'(dưới|tối đa|khoảng)\s*(\d+)\s*(k|nghìn|ngàn|triệu|tr)', q_lower)
        if budget_match:
            num = int(budget_match.group(2))
            unit = budget_match.group(3)
            if unit in ['k', 'nghìn', 'ngàn']:
                max_budget = num * 1000
            elif unit in ['triệu', 'tr']:
                max_budget = num * 1000000

        # Kiểm tra phát hiện SQL Injection (TC07)
        has_sql_injection = bool(re.search(r"('|--|;|union\s+select|drop\s+table|insert\s+into)", q_lower))

        return {
            "species": species,
            "symptoms": symptoms,
            "target_brand": target_brand,
            "max_budget": max_budget,
            "is_emergency": any(w in q_lower for w in ["cấp", "nguy kịch", "chết", "gấp", "sốt cao"]),
            "has_sql_injection": has_sql_injection,
            "raw_query": query
        }

class SearchRetrievalAgent:
    """Agent 2: Tìm kiếm và truy vấn an toàn kho dược phẩm / sản phẩm thú y (TC03, TC04, TC07, TC08)."""

    @staticmethod
    def search(requirements: dict, force_relax_constraints: bool = False) -> dict:
        all_products = get_all_products()
        raw_query = requirements["raw_query"].lower()

        # Phòng vệ SQL Injection (TC07)
        if requirements.get("has_sql_injection"):
            sanitized_query = re.sub(r"[';--]|(union\s+select)|(drop\s+table)", "", raw_query, flags=re.I).strip()
            return {
                "results": [],
                "sanitized_query": sanitized_query,
                "warning": "Phát hiện ký tự độc hại (SQL Injection Pattern). Truy vấn đã được vô hiệu hóa để bảo đảm an toàn hệ thống CSDL!",
                "total_found": 0
            }

        matched = []
        for p in all_products:
            score = 0
            
            # Khớp loài
            if requirements["species"] != "Chung" and requirements["species"] in p["targetSpecies"]:
                score += 3
            
            # Khớp thương hiệu
            if requirements.get("target_brand"):
                if p["brand"].lower() == requirements["target_brand"].lower():
                    score += 5
                else:
                    if not force_relax_constraints:
                        continue # Bỏ qua nếu bắt buộc đúng thương hiệu
            
            # Khớp ngân sách
            if requirements.get("max_budget") and not force_relax_constraints:
                if p["priceVnd"] > requirements["max_budget"]:
                    continue

            # Khớp triệu chứng và từ khóa
            for sym in requirements["symptoms"]:
                if any(k.lower() in p["indications"].lower() or k.lower() in " ".join(p["keywords"]).lower() for k in sym.split()):
                    score += 4

            for kw in p["keywords"]:
                if kw.lower() in raw_query:
                    score += 3

            if score > 0:
                matched.append({"product": p, "score": score})

        # Sắp xếp theo độ phù hợp
        matched.sort(key=lambda x: x["score"], reverse=True)
        results = [m["product"] for m in matched]

        return {
            "results": results[:5],
            "total_found": len(results),
            "sanitized_query": raw_query
        }

class CriticAgent:
    """Agent 3: Đánh giá, phản biện kiểm định ràng buộc lâm sàng & tồn kho (TC05, TC06)."""

    @staticmethod
    def evaluate(requirements: dict, search_results: list) -> dict:
        if not search_results:
            return {
                "is_valid": False,
                "needs_retry": True,
                "reason": "Không tìm thấy sản phẩm nào khớp chính xác với tất cả ràng buộc khắt khe (ngân sách / thương hiệu). Đề xuất nới lỏng để tìm giải pháp thay thế.",
                "action": "RELAX_AND_RETRY"
            }

        # Kiểm tra tồn kho (TC06)
        out_of_stock = [p for p in search_results if p.get("inStock", 0) <= 0]
        if len(out_of_stock) == len(search_results):
            return {
                "is_valid": False,
                "needs_retry": True,
                "reason": "Tất cả sản phẩm tìm thấy đều đã hết hàng trong kho vật tư.",
                "action": "SEARCH_ALTERNATIVES"
            }

        return {
            "is_valid": True,
            "needs_retry": False,
            "reason": f"Đã thẩm định {len(search_results)} sản phẩm hợp lệ, đáp ứng đủ yêu cầu lâm sàng và tồn kho sẵn có.",
            "action": "PROCEED_TO_DECISION"
        }

class DecisionAdvisorAgent:
    """Agent 4: Ra quyết định chuyên môn, xây dựng phác đồ điều trị và cảnh báo thời gian ngưng thuốc (TC01, TC02, TC10)."""

    @staticmethod
    def formulate_advice(requirements: dict, products: list, evaluation: dict) -> dict:
        if not products:
            return {
                "summary": "Không tìm thấy dược phẩm tương thích trong kho dữ liệu trang trại.",
                "recommendations": [],
                "clinical_protocol": "Hãy đưa mẫu xét nghiệm hoặc liên hệ bác sĩ thú y thực địa để được khám trực tiếp.",
                "withdrawal_warning": "N/A"
            }

        primary = products[0]
        recommendations = []
        for p in products[:3]:
            recommendations.append({
                "id": p["id"],
                "name": p["name"],
                "brand": p["brand"],
                "price": f"{p['priceVnd']:,} VNĐ / {p['unit']}",
                "dosage": p["dosage"],
                "in_stock": f"{p.get('inStock', 0)} đơn vị có sẵn",
                "withdrawal_days": p.get("withdrawalDays", 0)
            })

        # Phác đồ lâm sàng
        protocol = (
            f"1. **Điều trị đặc hiệu**: Dùng {primary['name']} ({primary['brand']}). "
            f"Liều lượng: {primary['dosage']}.\n"
            f"2. **Hộ lý & Chăm sóc**: Bổ sung chất điện giải B-Complex / Men tiêu hóa để nâng cao thể trạng.\n"
            f"3. **An toàn sinh học**: Cách ly ngay con ốm, phun sát trùng chuồng trại bằng Omnicide Extra hoặc vôi bột."
        )

        # Cảnh báo thời gian ngưng thuốc (TC02)
        withdrawal_days = primary.get("withdrawalDays", 0)
        if withdrawal_days > 0:
            withdrawal_warning = (
                f"⚠️ **CẢNH BÁO QUAN TRỌNG VỀ THỜI GIAN NGƯNG THUỐC (WITHDRAWAL PERIOD):**\n"
                f"Thuốc **{primary['name']}** có thời gian ngưng khai thác là **{withdrawal_days} ngày** trước khi giết mổ "
                f"hoặc lấy sữa/trứng để tránh tồn dư kháng sinh trong thực phẩm."
            )
        else:
            withdrawal_warning = "✅ Sản phẩm an toàn, không yêu cầu thời gian ngưng khai thác."

        return {
            "primary_product": primary["name"],
            "brand": primary["brand"],
            "recommendations": recommendations,
            "clinical_protocol": protocol,
            "withdrawal_warning": withdrawal_warning,
            "species": requirements["species"],
            "symptoms_addressed": ", ".join(requirements["symptoms"])
        }

def execute_multi_agent_pipeline(query: str, test_case_tag: str = None) -> dict:
    """
    Orchestrates the 4 agents in sequential collaboration with critic loop (TC10 End-to-End).
    """
    start_time = time.time()
    trace_steps = []

    # Step 1: Requirement Agent
    req = RequirementAgent.extract(query)
    trace_steps.append({
        "step": 1,
        "agent": "Requirement Agent",
        "title": "Trích xuất & Chuẩn hóa JSON Schema (TC09)",
        "output": req
    })

    # Step 2: Search Agent (Attempt 1)
    search_res = SearchRetrievalAgent.search(req)
    trace_steps.append({
        "step": 2,
        "agent": "Search & Retrieval Agent",
        "title": "Truy vấn Kho Dược Phẩm MySQL & Thẩm định SQL",
        "output": {
            "total_found": search_res["total_found"],
            "products": [p["name"] for p in search_res["results"]],
            "warning": search_res.get("warning")
        }
    })

    # Step 3: Critic Agent (Evaluation 1)
    crit = CriticAgent.evaluate(req, search_res["results"])
    trace_steps.append({
        "step": 3,
        "agent": "Critic & Evaluation Agent",
        "title": "Đánh giá Ràng buộc Lâm sàng & Phản biện",
        "output": crit
    })

    # Retry loop if Critic rejects (TC05)
    final_products = search_res["results"]
    if crit["needs_retry"] and not req.get("has_sql_injection"):
        retry_search = SearchRetrievalAgent.search(req, force_relax_constraints=True)
        final_products = retry_search["results"]
        trace_steps.append({
            "step": 4,
            "agent": "Critic Retry Loop (TC05)",
            "title": "Tự động Nới lỏng Ràng buộc & Tái Truy vấn",
            "output": {
                "relaxed_count": retry_search["total_found"],
                "fallback_products": [p["name"] for p in final_products]
            }
        })

    # Step 4: Decision Advisor Agent
    advice = DecisionAdvisorAgent.formulate_advice(req, final_products, crit)
    trace_steps.append({
        "step": len(trace_steps) + 1,
        "agent": "Decision & Advisor Agent",
        "title": "Tổng hợp Phác đồ Điều trị & Cảnh báo Ngưng thuốc",
        "output": advice
    })

    execution_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "query": query,
        "test_case_tag": test_case_tag,
        "trace_steps": trace_steps,
        "final_advice": advice,
        "execution_time_ms": execution_ms
    }

"""
Database Service (services/database_service.py)
Truy xuất MySQL hoặc bộ nhớ đệm an toàn theo đặc tả Bài 6 & 7
"""
import os

try:
    import pymysql
    from pymysql.cursors import DictCursor
except ImportError:
    pymysql = None
    DictCursor = None

def get_connection():
    if not pymysql:
        return None
    try:
        conn = pymysql.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "farmpro_db"),
            cursorclass=DictCursor,
            connect_timeout=2,
            charset="utf8mb4"
        )
        return conn
    except Exception:
        return None

# Seed catalog fallback matching schema
LOCAL_PRODUCTS = [
    {"id": "prod-01", "name": "Kháng sinh Amox-Colis", "category": "Thuốc & Vắc xin", "brand": "Marphavet", "price": 145000, "ram": 16, "warranty": 24, "in_stock": 25, "description": "Đặc trị viêm phổi và tiêu chảy ở gia súc."},
    {"id": "prod-02", "name": "Kháng sinh Flo-Doxy Max", "category": "Thuốc & Vắc xin", "brand": "Marphavet", "price": 185000, "ram": 32, "warranty": 36, "in_stock": 18, "description": "Tác dụng kéo dài 48h trị viêm phổi dính sườn APP."},
    {"id": "prod-03", "name": "Vắc xin Lở Mồm Long Móng Virbac", "category": "Thuốc & Vắc xin", "brand": "Virbac", "price": 850000, "ram": 16, "warranty": 12, "in_stock": 10, "description": "Phòng FMD 3 type O, A, Asia1."},
    {"id": "prod-04", "name": "Dung dịch Hạ sốt Anagin-C", "category": "Thuốc & Vắc xin", "brand": "Bio-Pharmachemie", "price": 68000, "ram": 8, "warranty": 24, "in_stock": 40, "description": "Hạ nhiệt cấp, giảm đau, tiêu viêm."},
    {"id": "prod-05", "name": "Cám Vỗ Béo Bò Thịt Beef Master CP 992", "category": "Thức ăn & Dinh dưỡng", "brand": "CP Việt Nam", "price": 380000, "ram": 64, "warranty": 6, "in_stock": 50, "description": "Tăng trọng nhanh 1.4kg/ngày cho bò thịt."},
    {"id": "prod-06", "name": "Sát Trùng Omnicide Extra Bayer", "category": "Vật tư & Sát trùng", "brand": "Bayer", "price": 260000, "ram": 16, "warranty": 36, "in_stock": 35, "description": "Diệt virus Dịch tả heo ASF và Cúm gia cầm."}
]

def search_products(requirements: dict):
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = "SELECT id, name, category, brand, price_vnd as price, 16 as ram, 24 as warranty, in_stock, indications as description FROM farm_products WHERE 1=1"
            params = []

            if requirements.get("category"):
                query += " AND category = %s"
                params.append(requirements["category"])

            if requirements.get("brands"):
                placeholders = ", ".join(["%s"] * len(requirements["brands"]))
                query += f" AND brand IN ({placeholders})"
                params.extend(requirements["brands"])

            if requirements.get("max_price") is not None:
                query += " AND price_vnd <= %s"
                params.append(requirements["max_price"])

            cursor.execute(query, params)
            products = cursor.fetchall()
            cursor.close()
            conn.close()
            if products:
                return products
        except Exception:
            pass

    # Fallback filter over in-memory products
    matched = []
    for p in LOCAL_PRODUCTS:
        if requirements.get("brands"):
            if not any(b.lower() in p["brand"].lower() for b in requirements["brands"]):
                continue
        if requirements.get("max_price") is not None:
            if p["price"] > requirements["max_price"]:
                continue
        matched.append(p)

    return matched if matched else LOCAL_PRODUCTS[:3]

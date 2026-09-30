"""
Database Connection & Fallback Module for FarmPro AI
Handles PyMySQL connections with automatic fallback to high-fidelity In-Memory mock data.
"""
import json
import pymysql
from pymysql.cursors import DictCursor
from config import Config

# Fallback catalog data matching schema.mysql.sql
FALLBACK_PRODUCTS = [
    {
        "id": "prod-01",
        "name": "Kháng sinh Amox-Colis Đặc Trị Hô Hấp & Tiêu Hóa",
        "brand": "Marphavet",
        "category": "Thuốc & Vắc xin",
        "targetSpecies": ["Heo", "Bò", "Gà", "Vịt", "Dê"],
        "priceVnd": 145000,
        "unit": "Chai 100ml",
        "activeIngredients": "Amoxicillin Trihydrate 15%, Colistin Sulfate 25M UI",
        "indications": "Đặc trị sốt phát ban, viêm phổi cấp, thở giật bụng, viêm ruột tiêu chảy phân xanh phân trắng, phó thương hàn ở heo và bê nghé.",
        "dosage": "Tiêm bắp 1ml / 10 - 12kg thể trọng, ngày 1 lần liên tục 3-5 ngày.",
        "withdrawalDays": 14,
        "inStock": 25,
        "keywords": ["sốt đỏ", "viêm phổi", "thở dốc", "tiêu chảy", "amox", "kháng sinh", "phó thương hàn"]
    },
    {
        "id": "prod-02",
        "name": "Kháng sinh Flo-Doxy Max Tác Dụng Kéo Dài 48H",
        "brand": "Marphavet",
        "category": "Thuốc & Vắc xin",
        "targetSpecies": ["Heo", "Bò", "Dê"],
        "priceVnd": 185000,
        "unit": "Chai 100ml",
        "activeIngredients": "Florfenicol 30%, Doxycycline Hyclate 10%",
        "indications": "Đặc trị viêm phổi dính sườn (APP), suyễn heo do Mycoplasma, tai xanh ghép sốt đỏ, tụ huyết trùng gia súc.",
        "dosage": "Tiêm bắp sâu 1ml / 20kg thể trọng, một mũi tác dụng 48 giờ.",
        "withdrawalDays": 28,
        "inStock": 18,
        "keywords": ["viêm phổi dính sườn", "app", "suyễn heo", "tai xanh", "ho khan", "thở giật"]
    },
    {
        "id": "prod-03",
        "name": "Vắc xin Lở Mồm Long Móng Aftovaxpur 3 Type (O, A, Asia1)",
        "brand": "Virbac",
        "category": "Thuốc & Vắc xin",
        "targetSpecies": ["Bò", "Heo", "Dê", "Cừu"],
        "priceVnd": 850000,
        "unit": "Lọ 50 liều",
        "activeIngredients": "Kháng nguyên vô hoạt FMD Type O, A, Asia1 với chất bổ trợ dầu",
        "indications": "Tạo miễn dịch chủ động phòng bệnh lở mồm long móng ở gia súc guốc chẵn, bảo hộ kéo dài 6-12 tháng.",
        "dosage": "Tiêm dưới da hoặc tiêm bắp: Bò 2ml/con, Heo/Dê 1ml/con. Tiêm nhắc định kỳ 6 tháng.",
        "withdrawalDays": 0,
        "inStock": 10,
        "keywords": ["lở mồm long móng", "lmlm", "vắc xin", "virbac", "chân móng loét", "chảy nước dãi"]
    },
    {
        "id": "prod-04",
        "name": "Dung Dịch Hạ Sốt & Kháng Viêm Anagin-C Hạ Nhiệt Cấp",
        "brand": "Bio-Pharmachemie",
        "category": "Thuốc & Vắc xin",
        "targetSpecies": ["Bò", "Heo", "Chó", "Mèo", "Dê"],
        "priceVnd": 68000,
        "unit": "Chai 100ml",
        "activeIngredients": "Analgin 20%, Vitamin C 5%",
        "indications": "Hạ sốt nhanh trong các bệnh truyền nhiễm cấp tính, giảm đau, trợ lực, tiêu viêm, chống cảm nóng sốt cao.",
        "dosage": "Tiêm bắp 1ml / 10 - 15kg thể trọng, có thể lặp lại sau 8 - 12 giờ.",
        "withdrawalDays": 7,
        "inStock": 40,
        "keywords": ["hạ sốt", "sốt cao", "giảm đau", "anagin", "vitamin c", "trợ lực"]
    },
    {
        "id": "prod-05",
        "name": "Cám Hỗn Hợp Vỗ Béo Bò Thịt Cao Cấp Beef Master CP 992",
        "brand": "CP Việt Nam",
        "category": "Thức ăn & Dinh dưỡng",
        "targetSpecies": ["Bò", "Dê"],
        "priceVnd": 380000,
        "unit": "Bao 40kg",
        "activeIngredients": "Đạm thô 16%, Xơ thô max 12%, Canxi 0.9%, Photpho 0.5%, Năng lượng ME 2800 kcal/kg",
        "indications": "Cung cấp năng lượng đạm và khoáng vi lượng tối ưu cho bò thịt giai đoạn vỗ béo tăng trọng từ 1.2 - 1.6 kg/ngày, thớ thịt săn chắc, mỡ trắng.",
        "dosage": "Cho ăn 3 - 5 kg/con/ngày kết hợp cỏ voi ủ chua và rơm khô sạch.",
        "withdrawalDays": 0,
        "inStock": 50,
        "keywords": ["vỗ béo", "tăng trọng", "cám bò", "bò thịt", "cp việt nam", "dinh dưỡng", "tăng cân"]
    },
    {
        "id": "prod-06",
        "name": "Thức Ăn Bổ Sung Premix Khoáng & Vitamin Cho Bò Sữa MilkBoost",
        "brand": "De Heus",
        "category": "Thực phẩm bổ sung",
        "targetSpecies": ["Bò", "Dê"],
        "priceVnd": 290000,
        "unit": "Bao 25kg",
        "activeIngredients": "Vitamin A, D3, E, Biotin, Kẽm hữu cơ, Mangan, Đồng, Men sống Saccharomyces cerevisiae",
        "indications": "Tăng sản lượng sữa từ 10 - 15%, cải thiện tỷ lệ thụ thai, ngừa bại liệt sau sinh và viêm vú tiềm ẩn do thiếu khoáng.",
        "dosage": "Trộn 50 - 100g/con/ngày vào thức ăn tinh.",
        "withdrawalDays": 0,
        "inStock": 30,
        "keywords": ["khoáng vi lượng", "bò sữa", "tăng sữa", "de heus", "premix", "men sống", "bổ sung"]
    },
    {
        "id": "prod-07",
        "name": "Men Tiêu Hóa Cao Cấp Bio-Subtilis Men Sống Chịu Kháng Sinh",
        "brand": "Bio-Pharmachemie",
        "category": "Thực phẩm bổ sung",
        "targetSpecies": ["Heo", "Gà", "Vịt", "Bò", "Chó"],
        "priceVnd": 75000,
        "unit": "Gói 1kg",
        "activeIngredients": "Bacillus subtilis 10^9 CFU/g, Lactobacillus acidophilus, Enzym Protease, Amylase",
        "indications": "Cân bằng hệ vi sinh đường ruột, phục hồi nhung mao ruột sau khi dùng kháng sinh, chống phân sống, khử mùi hôi phân chuồng trại.",
        "dosage": "Pha 1g / 1 - 2 lít nước uống hoặc trộn 1kg / 500kg thức ăn.",
        "withdrawalDays": 0,
        "inStock": 45,
        "keywords": ["men tiêu hóa", "men sống", "tiêu hóa", "chống phân sống", "bảo vệ đường ruột"]
    },
    {
        "id": "prod-08",
        "name": "Sát Trùng Chuồng Trại Phổ Rộng Omnicide Extra",
        "brand": "Bayer",
        "category": "Vật tư & Sát trùng",
        "targetSpecies": ["Heo", "Bò", "Gà", "Vịt", "Dê"],
        "priceVnd": 260000,
        "unit": "Chai 1 Lít",
        "activeIngredients": "Glutaraldehyde 15%, Cocobenzyl dimethyl ammonium chloride 10%",
        "indications": "Tiêu diệt 100% virus Dịch tả lợn Châu Phi (ASF), Cúm gia cầm (H5N1), Tai xanh (PRRS), vi khuẩn và bào tử nấm.",
        "dosage": "Pha tỷ lệ 1:200 phun khử trùng định kỳ; 1:100 khi có dịch bệnh.",
        "withdrawalDays": 0,
        "inStock": 35,
        "keywords": ["sát trùng", "khử trùng", "bayer", "dịch tả", "asf", "omnicide", "chuồng trại"]
    },
    {
        "id": "prod-09",
        "name": "Thuốc Trị Ký Sinh Trùng Đường Máu Boverm Inj",
        "brand": "Virbac",
        "category": "Thuốc & Vắc xin",
        "targetSpecies": ["Bò", "Dê", "Ngựa", "Chó"],
        "priceVnd": 320000,
        "unit": "Lọ 50ml",
        "activeIngredients": "Diminazene Aceturate 70mg/ml, Phenazone 375mg/ml",
        "indications": "Đặc trị bệnh tiên mao trùng, lê dạng trùng, biên trùng ở bò sữa và bò thịt gây sốt cao, thiếu máu, tiểu đỏ.",
        "dosage": "Tiêm bắp sâu 1ml / 20kg thể trọng, kết hợp bổ sung sắt và B12.",
        "withdrawalDays": 21,
        "inStock": 12,
        "keywords": ["ký sinh trùng đường máu", "tiểu đỏ", "thiếu máu", "virbac", "bò sốt", "ve rận"]
    },
    {
        "id": "prod-10",
        "name": "Thuốc Trị Ve Rận & Tẩy Giun Sán Nội Ngoại Ký Sinh Ivermectin 1%",
        "brand": "Hanuchem",
        "category": "Thuốc & Vắc xin",
        "targetSpecies": ["Heo", "Bò", "Dê", "Chó"],
        "priceVnd": 45000,
        "unit": "Chai 20ml",
        "activeIngredients": "Ivermectin 10mg/ml",
        "indications": "Đặc trị ghẻ, ve rận, mạt, bọ chét và các loại giun đũa, giun phổi, giun dạ cỏ ký sinh.",
        "dosage": "Tiêm dưới da: Bò/Heo 1ml / 33kg thể trọng. Chó 1ml / 30 - 50kg thể trọng.",
        "withdrawalDays": 28,
        "inStock": 60,
        "keywords": ["ghẻ", "ve rận", "tẩy giun", "ivermectin", "ngứa", "ký sinh trùng"]
    },
    {
        "id": "prod-11",
        "name": "Hỗn Hợp Bồi Bổ Thảo Dược Gluco-K-C Thảo Mộc",
        "brand": "Marphavet",
        "category": "Thực phẩm bổ sung",
        "targetSpecies": ["Heo", "Bò", "Gà", "Vịt"],
        "priceVnd": 55000,
        "unit": "Gói 1kg",
        "activeIngredients": "Glucose cao năng lượng, Vitamin K3, Vitamin C, Cao thảo dược Actiso và Kim ngân hoa",
        "indications": "Giải độc gan thận, trợ tim, giải nhiệt chống nóng mùa hè, cầm máu khi mắc cầu trùng, tăng sức đề kháng.",
        "dosage": "Pha 1g / 1 lít nước sạch cho uống tự do suốt ngày.",
        "withdrawalDays": 0,
        "inStock": 80,
        "keywords": ["gluco kc", "giải nhiệt", "chống sốc", "thảo mộc", "marphavet", "bổ sung"]
    },
    {
        "id": "prod-12",
        "name": "Cám Khởi Động Giai Đoạn 1 Cho Heo Con Cai Sữa CP 551",
        "brand": "CP Việt Nam",
        "category": "Thức ăn & Dinh dưỡng",
        "targetSpecies": ["Heo"],
        "priceVnd": 420000,
        "unit": "Bao 25kg",
        "activeIngredients": "Đạm tiêu hóa cao 20%, Sữa bột cao cấp, Kẽm Oxit chống tiêu chảy, Axit hữu cơ",
        "indications": "Kích thích heo con tập ăn sớm từ 7 ngày tuổi, giảm thiểu tỷ lệ tiêu chảy sau cai sữa, đường ruột khỏe mạnh.",
        "dosage": "Cho ăn tự do nhiều lần trong ngày, máng ăn sạch sẽ khô ráo.",
        "withdrawalDays": 0,
        "inStock": 22,
        "keywords": ["heo con", "cám tập ăn", "cai sữa", "cp việt nam", "dinh dưỡng heo"]
    }
]

KNOWN_BRANDS = [
    {"name": "Marphavet", "country": "Việt Nam", "badge": "Kháng sinh & Trị liệu hàng đầu"},
    {"name": "Virbac", "country": "Pháp", "badge": "Vắc xin & Tiêu chuẩn Châu Âu"},
    {"name": "Bio-Pharmachemie", "country": "Việt Nam", "badge": "Thảo dược & Hạ sốt trợ lực"},
    {"name": "CP Việt Nam", "country": "Thái Lan", "badge": "Dinh dưỡng & Cám vỗ béo"},
    {"name": "De Heus", "country": "Hà Lan", "badge": "Premix khoáng & Bò sữa"},
    {"name": "Bayer", "country": "Đức", "badge": "Sát trùng & An toàn sinh học"},
    {"name": "Hanuchem", "country": "Việt Nam", "badge": "Ký sinh trùng & Tẩy giun"}
]

def get_db_connection():
    """
    Attempt to connect to MySQL. Returns connection or None if offline.
    """
    try:
        conn = pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            cursorclass=DictCursor,
            connect_timeout=3,
            charset='utf8mb4'
        )
        return conn
    except Exception as e:
        return None

def check_db_status():
    """
    Returns live MySQL connection status for API/UI.
    """
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
            conn.close()
            return {
                "connected": True,
                "host": Config.DB_HOST,
                "database": Config.DB_NAME,
                "mode": "mysql_live",
                "message": f"Đã kết nối thành công với MySQL CSDL: {Config.DB_NAME}"
            }
        except Exception as e:
            pass

    return {
        "connected": False,
        "host": Config.DB_HOST,
        "database": Config.DB_NAME,
        "mode": "in_memory_simulation",
        "message": f"Chưa kết nối MySQL (Đang dùng In-Memory Fallback). Vui lòng chạy 'python init_db.py'."
    }

def get_all_products():
    """
    Fetch products from MySQL if available, else return FALLBACK_PRODUCTS.
    """
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM farm_products")
                rows = cur.fetchall()
                if rows and len(rows) > 0:
                    products = []
                    for r in rows:
                        products.append({
                            "id": r["id"],
                            "name": r["name"],
                            "brand": r["brand"],
                            "category": r["category"],
                            "targetSpecies": json.loads(r["target_species"]) if isinstance(r["target_species"], str) else r["target_species"],
                            "priceVnd": int(r["price_vnd"]),
                            "unit": r["unit"],
                            "activeIngredients": r["active_ingredients"],
                            "indications": r["indications"],
                            "dosage": r["dosage"],
                            "withdrawalDays": r.get("withdrawal_days", 0),
                            "inStock": r["in_stock"],
                            "keywords": json.loads(r["keywords"]) if isinstance(r["keywords"], str) else r["keywords"]
                        })
                    conn.close()
                    return products
            conn.close()
        except Exception:
            pass

    return FALLBACK_PRODUCTS

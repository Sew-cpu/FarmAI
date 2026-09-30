"""
Database Initialization Script for FarmPro AI (MySQL)
Executes database/schema.mysql.sql to bootstrap database and seed data.
Usage:
    python init_db.py
"""
import os
import pymysql
from config import Config

def init_mysql_database():
    print(f"🔄 Đang kết nối tới máy chủ MySQL tại {Config.DB_HOST}:{Config.DB_PORT}...")
    
    try:
        # 1. Connect without database first to ensure database exists
        conn = pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            charset='utf8mb4'
        )
        print("✅ Đã kết nối thành công tới MySQL Server!")

        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"✅ Đã đảm bảo CSDL `{Config.DB_NAME}` tồn tại.")
        conn.close()

        # 2. Re-connect to specific database
        conn = pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            charset='utf8mb4'
        )

        # 3. Read schema.mysql.sql
        schema_path = os.path.join(os.path.dirname(__file__), "..", "database", "schema.mysql.sql")
        if not os.path.exists(schema_path):
            schema_path = os.path.join(os.path.dirname(__file__), "schema.mysql.sql")

        print(f"📖 Đang đọc tệp cấu trúc CSDL: {schema_path}")
        with open(schema_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        # Split statements by semicolon
        statements = sql_script.split(";")
        with conn.cursor() as cur:
            for stmt in statements:
                stmt_clean = stmt.strip()
                if stmt_clean:
                    cur.execute(stmt_clean)
            conn.commit()

        print(f"🎉 KHỞI TẠO CSDL `{Config.DB_NAME}` THÀNH CÔNG VỚI ĐẦY ĐỦ DỮ LIỆU SEED SẴN SÀNG!")
        conn.close()
        return True

    except Exception as e:
        print(f"❌ Lỗi khi khởi tạo CSDL MySQL: {e}")
        print("💡 Gợi ý: Hãy kiểm tra thông tin MYSQL_USER và MYSQL_PASSWORD trong tệp .env.")
        return False

if __name__ == "__main__":
    init_mysql_database()

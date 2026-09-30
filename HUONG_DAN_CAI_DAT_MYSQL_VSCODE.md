# 📘 Hướng Dẫn Cài Đặt & Chạy FarmPro AI Với MySQL Trên VS Code

Hệ thống **FarmPro AI** đã được tích hợp sẵn driver **`mysql2`** và cơ chế **Hybrid Data Fallback**:
- Nếu **có MySQL**: Ứng dụng tự động kết nối và đọc/ghi dữ liệu trực tiếp vào CSDL MySQL.
- Nếu **chưa bật MySQL**: Ứng dụng tự động chuyển sang chế độ an toàn (*In-Memory Safe Mode*), đảm bảo ứng dụng không bao giờ bị sập (crash) và mọi tính năng AI Agent vẫn hoạt động trơn tru 100%.

---

## 🛠️ Bước 1: Khởi Tạo Cơ Sở Dữ Liệu MySQL

Dự án đã có sẵn file kịch bản SQL chuẩn tại:  
📁 **`database/schema.mysql.sql`**  
*(Bao gồm bảng `farm_products` với 12 loại thuốc & dinh dưỡng, bảng `animals`, `barns`, `inventory_items`, `care_tasks`)*.

Bạn chọn **1 trong 3 cách** sau để khởi chạy MySQL:

### 👉 Cách A: Dùng XAMPP (Đơn giản nhất trên Windows)
1. Tải và cài đặt **[XAMPP](https://www.apachefriends.org/)**.
2. Mở XAMPP Control Panel, bấm **Start** tại mục **MySQL** và **Apache**.
3. Mở trình duyệt vào: `http://localhost/phpmyadmin`.
4. Bấm tab **Import** (Nhập) ➡️ Chọn tệp `database/schema.mysql.sql` trong thư mục dự án ➡️ Bấm **Go** (Thực hiện).
   *(Cơ sở dữ liệu `farmpro_db` sẽ được tạo tự động kèm đầy đủ bảng và dữ liệu)*.

---

### 👉 Cách B: Dùng Docker (Nhanh & Chuyên nghiệp)
Nếu máy bạn đã cài Docker Desktop, chỉ cần mở terminal chạy 1 dòng lệnh:

```bash
docker run --name farmpro-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=farmpro_db -p 3306:3306 -d mysql:8.0
```

Sau đó import dữ liệu vào container:
```bash
docker exec -i farmpro-mysql mysql -uroot -proot farmpro_db < database/schema.mysql.sql
```

---

### 👉 Cách C: Dùng MySQL Workbench / DBeaver
1. Mở MySQL Workbench, kết nối vào máy chủ MySQL của bạn (`localhost:3306`).
2. Vào menu **File** ➡️ **Open SQL Script...** ➡️ Chọn file `database/schema.mysql.sql`.
3. Bấm biểu tượng ⚡ **Execute** (hoặc nhấn `Ctrl + Shift + Enter`) để thực thi toàn bộ script.

---

## ⚙️ Bước 2: Cấu Hình File `.env` Trên VS Code

Tạo một file `.env` tại thư mục gốc của dự án (ngang hàng với `package.json`), điền các thông số:

```env
# Cấu hình kết nối MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=            # Điền mật khẩu MySQL của bạn (nếu dùng XAMPP thì để trống)
MYSQL_DATABASE=farmpro_db

# API Key cho Gemini (Nếu muốn dùng thêm tính năng AI trực tuyến)
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

---

## 🚀 Bước 3: Cài Đặt Thư Viện & Khởi Chạy Trên VS Code

Mở Terminal trong VS Code (`Ctrl + \`` hoặc `Terminal -> New Terminal`):

```bash
# 1. Cài đặt toàn bộ dependencies
npm install

# 2. Khởi chạy máy chủ phát triển (Backend Express + Frontend Vite)
npm run dev
```

Terminal sẽ hiển thị thông báo:
```text
✅ [MySQL] Đã kết nối thành công tới cơ sở dữ liệu: farmpro_db (localhost)
Server is running at http://localhost:3000
```

Mở trình duyệt truy cập: **`http://localhost:3000`** để bắt đầu trải nghiệm!

---

## 🔍 Kiểm Tra Trạng Thái Kết Nối MySQL

Bạn có thể kiểm tra trạng thái kết nối MySQL bất cứ lúc nào bằng cách mở đường dẫn:
```text
http://localhost:3000/api/db/status
```

Nếu kết nối thành công, hệ thống sẽ phản hồi:
```json
{
  "connected": true,
  "host": "localhost",
  "database": "farmpro_db",
  "mode": "mysql_live",
  "message": "Đã kết nối thành công với MySQL CSDL: farmpro_db"
}
```

# HƯỚNG DẪN CHẠY DỰ ÁN FARMPRO AI VỚI PYTHON FLASK & CSDL MYSQL

Tài liệu này hướng dẫn chi tiết cách cài đặt, khởi tạo cơ sở dữ liệu và vận hành hệ thống **FarmPro AI** sử dụng **Backend Python Flask** kết nối trực tiếp với **MySQL Database** và giao diện **React Frontend**.

---

## 📂 1. Cấu Trúc Thư Mục Backend Flask

Toàn bộ mã nguồn Python Flask được đặt gọn gàng trong thư mục `backend_flask/`:

```text
├── backend_flask/
│   ├── app.py                 # File chạy chính của máy chủ Flask (REST API)
│   ├── config.py              # Đọc cấu hình môi trường & thông số MySQL từ .env
│   ├── db.py                  # Module kết nối PyMySQL & cơ chế In-Memory Fallback
│   ├── init_db.py             # Script tự động tạo CSDL & seed 12 danh mục sản phẩm
│   ├── multi_agent.py         # Hệ thống AI 4 Agent (Requirement, Search, Critic, Decision)
│   ├── test_cases.py          # Bộ kiểm thử tự động 10 kịch bản chuẩn (TC01 - TC10)
│   └── requirements.txt       # Danh sách thư viện Python (Flask, PyMySQL, requests,...)
├── database/
│   └── schema.mysql.sql       # Script SQL chuẩn tạo các bảng CSDL cho MySQL
├── src/                       # Giao diện Frontend React + Tailwind CSS
└── .env.example               # Mẫu cấu hình biến môi trường
```

---

## 🛠️ 2. Các Bước Cài Đặt & Chạy Hệ Thống

### Bước 1: Mở Terminal tại thư mục dự án và tạo môi trường ảo Python

```bash
# 1. Tạo môi trường ảo venv
python -m venv venv

# 2. Kích hoạt môi trường ảo:
# Trên Windows:
venv\Scripts\activate

# Trên macOS / Linux:
source venv/bin/activate
```

---

### Bước 2: Cài đặt các thư viện cần thiết

```bash
pip install -r backend_flask/requirements.txt
```

---

### Bước 3: Cấu hình thông tin kết nối MySQL trong tệp `.env`

Tạo hoặc mở tệp `.env` ở thư mục gốc của dự án và điền thông số MySQL của máy tính bạn (ví dụ XAMPP, WampServer hoặc MySQL Workbench):

```ini
# Cấu hình MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=farmpro_db

# Cổng chạy Flask Backend
FLASK_PORT=5000

# (Tùy chọn) Khóa Gemini API nếu muốn AI phân tích trực tuyến
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### Bước 4: Khởi tạo Cơ Sở Dữ Liệu MySQL tự động

Chạy tập lệnh sau để tự động tạo Database `farmpro_db`, khởi tạo bảng và chèn dữ liệu mẫu 12 loại thuốc & vắc xin thú y:

```bash
python backend_flask/init_db.py
```

Khi chạy xong, terminal sẽ hiển thị:
```text
✅ Đã kết nối thành công tới MySQL Server!
✅ Đã đảm bảo CSDL farmpro_db tồn tại.
📖 Đang đọc tệp cấu trúc CSDL: database/schema.mysql.sql
🎉 KHỞI TẠO CSDL farmpro_db THÀNH CÔNG VỚI ĐẦY ĐỦ DỮ LIỆU SEED SẴN SÀNG!
```

---

### Bước 5: Khởi động máy chủ Python Flask

Chạy máy chủ Flask API:

```bash
python backend_flask/app.py
```

Máy chủ Flask sẽ khởi động tại: **`http://localhost:5000`**

Kiểm tra trạng thái kết nối MySQL trên trình duyệt:
- Mở link: `http://localhost:5000/api/db/status`
- Kết quả trả về:
  ```json
  {
    "connected": true,
    "database": "farmpro_db",
    "host": "localhost",
    "mode": "mysql_live",
    "message": "Đã kết nối thành công với MySQL CSDL: farmpro_db"
  }
  ```

---

### Bước 6: Khởi động giao diện React Frontend

Mở một cửa sổ Terminal thứ 2 (giữ nguyên cửa sổ Flask đang chạy):

```bash
npm install
npm run dev
```

Giao diện sẽ chạy tại: **`http://localhost:3000`**. Giao diện sẽ tự động gửi yêu cầu đến các API của Flask và hiển thị dữ liệu trực tiếp từ MySQL!

---

## 📡 3. Danh Sách Các REST API Trên Flask

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| `GET` | `/api/db/status` | Kiểm tra tình trạng kết nối CSDL MySQL |
| `POST` | `/api/ai/chat` | Tư vấn thú y trực tuyến (Bác sĩ AI) |
| `POST` | `/api/ai/generate-schedule` | Tự động tạo lịch tiêm phòng & chăm sóc theo loài |
| `POST` | `/api/ai/diagnose` | Chẩn đoán phân loại bệnh khẩn cấp |
| `GET` | `/api/ai/multi-agent/catalog` | Danh mục 12 dược phẩm, vắc xin và hãng sản xuất |
| `POST` | `/api/ai/multi-agent/run` | Chạy quy trình tư vấn đa tác tử (4 Agent) |
| `GET` | `/api/ai/multi-agent/test-cases` | Danh sách 10 kịch bản kiểm thử (TC01-TC10) |
| `POST` | `/api/ai/multi-agent/run-test-case` | Chạy 1 test case đơn lẻ |
| `POST` | `/api/ai/multi-agent/run-all-tests` | Chạy toàn bộ 10 test case tự động (Batch Run) |

---

## 🤖 4. Nguyên Lý Hoạt Động Của 4 Tác Tử AI (Multi-Agent System)

1. **Requirement Agent (Trích xuất & Chuẩn hóa):**
   - Phân tích câu hỏi tự nhiên của nông dân, trích xuất cấu trúc JSON: loài vật, triệu chứng, ngân sách, hãng yêu cầu.
2. **Search & Retrieval Agent (Truy vấn CSDL an toàn):**
   - Truy vấn kho dữ liệu MySQL bằng câu lệnh an toàn, tích hợp cơ chế phòng vệ chống tấn công SQL Injection (TC07).
3. **Critic & Evaluation Agent (Phản biện & Thẩm định):**
   - Kiểm tra ràng buộc ngân sách, tồn kho khả dụng. Nếu không có thuốc khớp, kích hoạt chu trình **Retry Loop** nới lỏng điều kiện để tìm sản phẩm tương đương.
4. **Decision & Advisor Agent (Ra quyết định lâm sàng):**
   - Kê đơn hoàn chỉnh kèm liều dùng cụ thể và cảnh báo đặc biệt về **thời gian ngưng thuốc (Withdrawal period)** trước khi xuất chuồng.

---

Chúc bạn cài đặt và vận hành hệ sinh thái **FarmPro AI (Flask + MySQL + React)** thành công!

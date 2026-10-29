---
name: capstone-defense-guide
description: >-
  Cẩm nang trả lời vấn đáp và bảo vệ đồ án FarmPro AI đạt điểm 10/10 theo chuẩn thang điểm rubric.
  Bao quát 5 tiêu chí: Phân tích nghiệp vụ SDLC, Hệ thống đa tác tử 4 Agent & Critic Loop,
  Backend MySQL & Rào chắn y khoa ngưng thuốc, Bộ kiểm thử tự động 10 Test Cases chống SQLi,
  và Thực nghiệm 3 phiên bản Prompt chống ảo giác.
---

# SKILL: CẨM NANG VẤN ĐÁP & BẢO VỆ ĐỒ ÁN FARMPRO AI (THANG ĐIỂM 10/10)

Kỹ năng chuyên biệt cung cấp toàn bộ kịch bản trả lời vấn đáp, luận cứ kỹ thuật và bản đồ thao tác Web trực quan giúp nhóm sinh viên đạt điểm tuyệt đối 10/10 trước hội đồng chấm đồ án.

---

## 🎯 KHI NÀO SỬ DỤNG SKILL NÀY?
Sử dụng kỹ năng này khi:
1. Chuẩn bị nội dung bảo vệ đồ án tốt nghiệp / môn học trước hội đồng giảng viên.
2. Cần tra cứu nhanh câu trả lời mẫu cho 5 tiêu chí trong bảng Rubric đánh giá.
3. Cần biết chính xác vị trí nút bấm và màn hình cần mở trên giao diện Web [http://localhost:3000](http://localhost:3000) khi giảng viên đặt câu hỏi.
4. Cần giải thích sâu về các cơ chế công nghệ: Multi-Agent System (MAS), Critic Loop, RAG Context Snapshot, SQL Injection Defense, Withdrawal Period, và Multi-Tier Resilience.

---

## 🧭 BẢN ĐỒ ĐỐI CHIẾU 5 TIÊU CHÍ RUBRIC VỚI HỆ THỐNG

### TIÊU CHÍ 1: PHÂN TÍCH BÀI TOÁN & THIẾT KẾ GIẢI PHÁP (CLO1 - 2.0 ĐIỂM)
- **Nghiệp vụ cốt lõi:** Quản lý sức khỏe cá thể gia súc/gia cầm công nghiệp, kiểm soát dịch bệnh lây lan, tối ưu hóa chi phí thức ăn và thuốc thú y.
- **Vị trí tích hợp AI trong SDLC:** Giai đoạn **Requirements Engineering (Khởi tạo yêu cầu)**.
- **Tác tử đảm nhiệm:** `Requirements Engineering Agent` (đóng vai Senior Business Analyst & System Architect).
- **Thao tác Web:** Mở `Phòng Khám & Bác Sĩ AI` $\rightarrow$ Sub-tab `Kỹ Sư Yêu Cầu AI (SDLC BA)` $\rightarrow$ Bấm `Phân Tích Đề Bài Kỹ Thuật (SDLC)`.
- **Luận cứ kỹ thuật:** AI tự động quét điểm mơ hồ (Ambiguities) về xử lý ngoại lệ, đồng thời phân rã thành User Stories, Tasks kỹ thuật và Definition of Done (DoD). CSDL chuẩn hóa 3NF gồm 6 bảng thực thể trong `schema.mysql.sql`.

---

### TIÊU CHÍ 2: HOÀN THIỆN HỆ THỐNG VÀ CHỨC NĂNG AI (CLO2, CLO3 - 2.0 ĐIỂM)
- **Kiến trúc 4 Tác tử (Multi-Agent System):**
  1. `Requirement Agent`: Bóc tách ngôn ngữ tự nhiên thành JSON cấu trúc.
  2. `Search & Retrieval Agent`: Truy vấn MySQL an toàn kết hợp tìm kiếm ngữ nghĩa.
  3. `Critic & Evaluation Agent`: Phản biện chéo về loài, tồn kho và ngân sách; kích hoạt vòng lặp **Retry Loop** (tối đa 2 lần) tự nới lỏng điều kiện khi hết hàng.
  4. `Decision & Advisor Agent`: Ra quyết định kê đơn lâm sàng, tính liều theo thể trọng và cảnh báo thời gian ngưng thuốc.
- **Thao tác Web:** Mở sub-tab `Đa Tác Tử (MAS)` $\rightarrow$ Chọn chip `TC05: Vắc xin Bayer dưới 50k` $\rightarrow$ Bấm `Chạy Phân Tích Đa Tác Tử` $\rightarrow$ Quan sát Critic Agent tự sửa lỗi.
- **Tính năng 1 chạm (Actionable):** Nút `📥 Nhập thuốc vào kho` và `📅 Thêm vào lịch công việc` đồng bộ trực tiếp đơn thuốc vào CSDL.

---

### TIÊU CHÍ 3: THỰC NGHIỆM, KIỂM THỬ VÀ ĐÁNH GIÁ (CLO3, CLO4, PLO7 - 2.0 ĐIỂM)
- **Bộ 10 Test Cases tự động (TC01 - TC10):**
  - *TC01:* Khuyến nghị thuốc có sẵn trong kho (Happy Path).
  - *TC02:* Cảnh báo thời gian ngưng thuốc an toàn sinh học.
  - *TC03:* Ràng buộc thương hiệu chỉ định.
  - *TC04:* Giới hạn trần ngân sách cho phép.
  - *TC05:* Vòng lặp phản biện Critic Loop tự nới lỏng điều kiện.
  - *TC06:* Xử lý ngoại lệ hàng hết tồn kho.
  - *TC07:* Phòng vệ tấn công SQL Injection (`DROP TABLE farm_products; -- OR 1=1`).
  - *TC08:* Chẩn đoán ca bệnh phức tạp ghép đôi (hô hấp + sốt đỏ).
  - *TC09:* Kiểm thử hợp thức hóa JSON Schema.
  - *TC10:* Kiểm thử tích hợp toàn diện End-to-End cả 4 Agent.
- **Thao tác Web:** Mở tab `Đa Tác Tử (MAS)` $\rightarrow$ chọn `Bộ kiểm thử tự động (TC01 - TC10)` $\rightarrow$ Bấm `▶ Chạy Toàn Bộ 10 Test Case Tự Động` (chạy xong trong 1-2 giây, đạt 10/10 Passed).

---

### TIÊU CHÍ 4: SẢN PHẨM, BÁO CÁO VÀ DEMO (CLO5 - 2.0 ĐIỂM)
- **Giao diện người dùng:** React 19 + Tailwind CSS, responsive mượt mà trên desktop và mobile, thanh điều hướng trực quan, nút **🗑️ Xóa lịch sử chat** tiện lợi.
- **Kiến trúc Backend & Resilience:**
  - Python Flask (Port 5000) làm AI & Data Core Service.
  - Node.js Express (Port 3000) làm BFF & Web Host.
  - Cơ chế **In-Memory Fallback** đảm bảo 100% Uptime nếu MySQL mất kết nối.
  - Bao bọc gọi API qua `withTimeout` (8-15s), tự động chuyển sang mô hình dự phòng nếu API bên ngoài gặp lỗi 429 hoặc Insufficient Balance.
- **Triển khai & Quản lý Git:** Repository sạch sẽ tại [Sew-cpu/FarmAI](https://github.com/Sew-cpu/FarmAI), script 1-click `start_servers.bat`.

---

### TIÊU CHÍ 5: TƯ DUY PHẢN BIỆN & SỬ DỤNG AI CÓ TRÁCH NHIỆM (CLO1, CLO5 - 2.0 ĐIỂM)
- **Thực nghiệm 3 thế hệ Prompt:**
  - *Prompt v1 (Zero-Shot thô):* AI bị ảo giác nặng, tự bịa ra tên thuốc và giá tiền.
  - *Prompt v2 (Few-Shot tĩnh):* Có cấu trúc nhưng không nắm được dữ liệu chuồng trại thực tế.
  - *Prompt v3 (RAG Live Farm Snapshot + 3 Quy Tắc Vàng):* Bơm dữ liệu đàn và kho thuốc thời gian thực từ MySQL vào System Instruction. Áp dụng 3 quy tắc vàng: (1) Trả lời thẳng Có/Không, (2) Không xả dữ liệu rác, (3) Mở rộng có căn cứ $\rightarrow$ Triệt tiêu 100% ảo giác.
- **Trách nhiệm y khoa & An toàn thực phẩm:** Rào chắn **Thời gian ngưng thuốc (*Withdrawal Period*)** bắt buộc bảo vệ người tiêu dùng khỏi tồn dư kháng sinh trong thịt và sữa.

---

## 🎙️ KỊCH BẢN THUYẾT TRÌNH MẪU 3 PHÚT

1. **Phút 1 (Nghiệp vụ & CSDL):** Mở `localhost:3000`, chỉ vào huy hiệu `🟢 MySQL Live Connected`. Mở tab Quản lý đàn và Kho thuốc để chứng minh CSDL quan hệ 6 bảng đang chạy thật.
2. **Phút 2 (Trí tuệ nhân tạo & RAG):** Mở chat Bác sĩ AI, hỏi câu thử thách: *"Trại mình có bò Wagyu không?"* $\rightarrow$ AI đối chiếu MySQL trả lời ngay: *"Trại không có bò Wagyu, hiện có 60 con gồm Holstein Friesian và Black Angus..."* (chứng minh không bị ảo giác). Thử bấm nút `🗑️ Xóa lịch sử`.
3. **Phút 3 (Đa tác tử & Kiểm thử):** Mở tab `Đa Tác Tử (MAS)` $\rightarrow$ Chạy `▶ Chạy Toàn Bộ 10 Test Case Tự Động`. Trình bày cơ chế phản biện Critic Loop và phòng vệ SQL Injection tại TC07.


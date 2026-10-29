---
name: capstone-defense-guide
description: >-
  Cẩm nang trả lời vấn đáp và bảo vệ đồ án FarmPro AI đạt điểm 10/10 theo chuẩn rubric 5 tiêu chí (CLO1 - CLO5, PLO7).
  Bao quát 20 tiểu mục chi tiết: Nghiệp vụ VietGAHP, Phân quyền 3 vai trò, Hệ thống Đa tác tử 4 Agent & Critic Loop,
  Backend MySQL 3NF & Rào chắn thời gian ngưng thuốc, Bộ kiểm thử tự động 10 Test Cases chống SQLi,
  Thực nghiệm 3 phiên bản Prompt chống ảo giác và Ứng dụng AI trong toàn trình SDLC.
---

# SKILL: CẨM NANG VẤN ĐÁP BẢO VỆ ĐỒ ÁN FARMPRO AI (CHUẨN RUBRIC 10/10 ĐIỂM)

Kỹ năng chuyên biệt cung cấp toàn bộ kịch bản trả lời vấn đáp, luận cứ kỹ thuật và bản đồ thao tác Web trực quan giúp nhóm sinh viên đạt điểm tuyệt đối 10/10 trước hội đồng chấm đồ án theo đúng Phiếu đánh giá chính thức (5 Tiêu chí $\times$ 4 Tiểu mục $= 20$ tiêu chí chi tiết).

---

## 🎯 KHI NÀO SỬ DỤNG SKILL NÀY?
Sử dụng kỹ năng này khi:
1. Chuẩn bị nội dung bảo vệ đồ án tốt nghiệp / đồ án môn học trước hội đồng giảng viên.
2. Cần tra cứu nhanh câu trả lời mẫu cho từng tiêu chí trong bảng Rubric đánh giá từ 1.1 đến 5.4.
3. Cần biết chính xác vị trí nút bấm và màn hình cần mở trên giao diện Web [http://localhost:3000](http://localhost:3000) khi giảng viên đặt câu hỏi.
4. Cần giải thích sâu về các cơ chế công nghệ: Multi-Agent System (MAS), Critic Retry Loop, RAG Live Context Snapshot, SQL Injection Defense, Withdrawal Period VietGAHP, và Multi-Tier Resilience.

---

## 🧭 BẢN ĐỒ ÁNH XẠ 20 TIÊU CHÍ RUBRIC VỚI HỆ THỐNG

### TIÊU CHÍ 1: PHÂN TÍCH BÀI TOÁN & THIẾT KẾ GIẢI PHÁP (CLO1 - 2.0 ĐIỂM)
- **1.1 Phân tích đúng nghiệp vụ:** Nghiệp vụ quản lý sức khỏe gia súc, phát hiện sớm dịch bệnh, kiểm soát an toàn thực phẩm VietGAHP, tối ưu hóa tồn kho dược phẩm (`schema.mysql.sql`).
- **1.2 Yêu cầu chức năng đầy đủ:** 6 phân hệ hoàn chỉnh: Quản lý đàn (Animals), Chuồng trại IoT (Barns), Kho thuốc (Inventory), Phòng khám Bác sĩ AI, Hệ thống đa tác tử (MAS), Kỹ sư yêu cầu (SDLC BA).
- **1.3 Kiến trúc, CSDL hợp lý:** Kiến trúc 3 tầng chuẩn Client - Server (React Vite + Node.js BFF + Flask Core API + MySQL 3NF với 6 bảng thực thể và cơ chế In-Memory Safe Fallback đạt 100% Uptime).
- **1.4 Lý giải vị trí AI:** Tích hợp AI tại 2 vị trí giá trị cao nhất: Pha phân tích yêu cầu (SDLC BA Agent quét điểm mơ hồ, sinh User Story) và Pha vận hành lâm sàng (Đa tác tử MAS hỗ trợ kê đơn tính liều theo thể trọng).
- **Thao tác Web:** Mở `Kỹ Sư Yêu Cầu AI (SDLC BA)` $\rightarrow$ Bấm `Phân Tích Đề Bài Kỹ Thuật (SDLC)`. Chỉ vào huy hiệu `🟢 MySQL Live Connected`.

---

### TIÊU CHÍ 2: HOÀN THIỆN HỆ THỐNG VÀ CHỨC NĂNG AI (CLO2, CLO3 - 2.0 ĐIỂM)
- **2.1 Nghiệp vụ chính chạy đúng:** Tính liều thuốc chuẩn theo số kg thể trọng vật nuôi (`weightKg`), rào chắn thời gian ngưng thuốc (`withdrawal_days`), cập nhật xuất nhập kho tự động.
- **2.2 Đăng nhập và phân quyền:** Module [AuthModal.tsx](file:///c:/Users/AD/Documents/FarmAI/FarmAI/src/components/AuthModal.tsx) phân quyền rõ rệt 3 vai trò:
  1. *Chủ trang trại:* Xem tổng quan chi phí, quản trị đàn, duyệt xuất nhập kho lớn.
  2. *Kỹ sư chăn nuôi:* Giám sát môi trường chuồng trại, chỉ số IoT, cập nhật tăng trọng.
  3. *Bác sĩ thú y:* Chẩn đoán bệnh, kê đơn qua AI, phê duyệt lịch tiêm phòng VietGAHP.
- **2.3 AI phục vụ nghiệp vụ:** Chẩn đoán lâm sàng bám sát triệu chứng thực, tra cứu tồn kho theo thời gian thực, nhắc lịch tiêm phòng theo độ tuổi vật nuôi.
- **2.4 Kết nối API và Prompt:** Backend Flask REST API bọc timeout và exception handling; kết nối Gemini API với kỹ thuật RAG Dynamic Context Snapshot bơm dữ liệu MySQL vào System Instruction.
- **Thao tác Web:** Bấm avatar góc phải để chuyển vai trò người dùng mẫu. Mở tab `Quản lý đàn vật nuôi` để xem tính liều theo thể trọng.

---

### TIÊU CHÍ 3: THỰC NGHIỆM, KIỂM THỬ VÀ ĐÁNH GIÁ (CLO3, CLO4, PLO7 - 2.0 ĐIỂM)
- **3.1 Kiểm thử đúng, sai, biên (TC01 - TC10):**
  - *Ca đúng (Happy path):* TC01 (Khuyến nghị thuốc có sẵn), TC09 (Định dạng JSON Schema).
  - *Ca an toàn sinh học:* TC02 (Cảnh báo thời gian ngưng thuốc trước xuất bán).
  - *Ca biên & Giới hạn:* TC04 (Giới hạn trần ngân sách), TC05 (Vòng lặp Critic Loop), TC06 (Xử lý hàng hết tồn kho), TC08 (Ca bệnh ghép phức tạp).
- **3.2 So sánh các phiên bản Prompt:**
  - *Prompt v1 (Zero-Shot thô):* Ảo giác 68%, bịa thuốc, sai giá.
  - *Prompt v2 (Few-Shot tĩnh):* Định dạng chuẩn nhưng sai lệch dữ liệu trại thực tế 35%.
  - *Prompt v3 (RAG Live Context + 3 Golden Rules):* Neo chặt vào MySQL, triệt tiêu 100% ảo giác.
- **3.3 Xử lý lỗi AI:** Cơ chế Critic Retry Loop tự nới lỏng điều kiện tối đa 2 lần khi hết hàng/vượt giá; Cơ chế Offline Clinical Fallback khi API quá tải (HTTP 429).
- **3.4 Bảo mật dữ liệu & API Key (PLO7):** TC07 phòng chống tấn công SQL Injection bằng Regex Sanitizer kết hợp Parameterized Query; Ẩn API Key hoàn toàn trong biến môi trường `.env`.
- **Thao tác Web:** Mở tab `Đa Tác Tử (MAS)` $\rightarrow$ `Bộ kiểm thử tự động (TC01 - TC10)` $\rightarrow$ Bấm `▶ Chạy Toàn Bộ 10 Test Case Tự Động` $\rightarrow$ Mở xem chi tiết `TC07`.

---

### TIÊU CHÍ 4: SẢN PHẨM, BÁO CÁO VÀ DEMO (CLO5 - 2.0 ĐIỂM)
- **4.1 Giao diện dễ sử dụng:** Giao diện React Tailwind CSS hiện đại, hỗ trợ Dark/Light mode, responsive mọi kích thước màn hình, tích hợp nút **🗑️ Xóa lịch sử** dọn dẹp ngữ cảnh thuận tiện.
- **4.2 Triển khai, README, Git:** Mã nguồn đồng bộ tại GitHub `Sew-cpu/FarmAI`, commit log chuẩn mực, file `start_servers.bat` & `stop_servers.bat` khởi động 1-click.
- **4.3 Báo cáo kỹ thuật đầy đủ:** Trọn bộ sơ đồ kiến trúc MAS, ERD 6 bảng CSDL, đặc tả API RESTful, tài liệu hướng dẫn vấn đáp 20 tiêu chí trong `HUONG_DAN_VAN_DAP_BAO_VE_DO_AN.md`.
- **4.4 Demo trực tiếp thành công:** Cả 2 server đang hoạt động mượt mà tại `localhost:3000` và `localhost:5000`, kết nối MySQL Live `farmpro_db` không có độ trễ.

---

### TIÊU CHÍ 5: TƯ DUY PHẢN BIỆN VÀ SỬ DỤNG AI CÓ TRÁCH NHIỆM (CLO1, CLO5 - 2.0 ĐIỂM)
- **5.1 Minh chứng AI trong SDLC:** Trực tiếp demo SDLC BA Agent phân tích đề bài thô, phát hiện 3-5 điểm mơ hồ và sinh User Story kèm Acceptance Criteria (DoD).
- **5.2 Kiểm chứng, sửa lỗi AI:** Critic Agent đóng vai trò kiểm tra chéo độc lập; Luôn tuân thủ nguyên tắc **Human-in-the-loop** (con người giữ quyền quyết định cuối cùng trong việc kê đơn và xuất kho).
- **5.3 Vấn đáp độc lập từng người:** Phân chia rành mạch 3 vị trí chuyên trách:
  - Backend & CSDL (MySQL 3NF, Fallback, SQLi TC07).
  - AI & Prompt Engineering (4 Agent MAS, Critic Loop, RAG chống ảo giác).
  - Frontend & QA (Giao diện React, Phân quyền 3 vai trò, 10 Test Cases).
- **5.4 Cải tiến, đóng góp riêng:** Rào chắn an toàn y khoa VietGAHP (`withdrawal_days`), bộ đệm In-Memory Safe Resilience, hệ thống MAS tự phục hồi.

---

## 🎙️ KỊCH BẢN THUYẾT TRÌNH BẢO VỆ 3 PHÚT "ĂN ĐIỂM"

1. **Phút 1 (Nghiệp vụ & CSDL):** Mở `localhost:3000`, chỉ huy hiệu `🟢 MySQL Live Connected`. Bấm avatar đổi giữa vai trò Chủ trại và Bác sĩ thú y. Mở tab Quản lý đàn và Kho thuốc minh chứng CSDL thật.
2. **Phút 2 (Trí tuệ nhân tạo & RAG):** Mở Bác sĩ AI, hỏi thử: *"Trại mình có bò Wagyu không?"* $\rightarrow$ AI đối chiếu MySQL trả lời ngay không có bò Wagyu (chứng minh chống ảo giác). Mở tab SDLC BA Agent chứng minh ứng dụng AI từ khâu khởi tạo dự án.
3. **Phút 3 (Đa tác tử & Kiểm thử):** Mở tab `Đa Tác Tử (MAS)` $\rightarrow$ Chạy `▶ Chạy Toàn Bộ 10 Test Case Tự Động` (10/10 Passed). Giải thích cơ chế Critic Loop tự sửa lỗi tại TC05 và chống SQL Injection tại TC07.

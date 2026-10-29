# CẨM NANG VẤN ĐÁP & BẢO VỆ ĐỒ ÁN FARMPRO AI (THANG ĐIỂM 10/10)

Tài liệu này được biên soạn chuẩn theo **Phiếu đánh giá đồ án (Rubric 5 Tiêu chí x 2.0đ = 10 Điểm)**, hướng dẫn chi tiết cách trả lời tự tin từng câu hỏi của giảng viên và vị trí bấm thao tác trực quan trên giao diện Web [http://localhost:3000](http://localhost:3000).

---

## 🧭 MỤC LỤC 5 CÂU HỎI TRỌNG TÂM CỦA HỘI ĐỒNG

- [Câu 1: Phân tích nghiệp vụ chăn nuôi, AI Agent sinh User Story, ERD & Vị trí SDLC](#câu-1-phân-tích-nghiệp-vụ-chăn-nuôi-ai-agent-sinh-user-story-erd--vị-trí-sdlc-tiêu-chí-1---20đ)
- [Câu 2: Hệ thống Đa tác tử 4 Agent & Vòng lặp phản biện Critic tự sửa lỗi](#câu-2-hệ-thống-đa-tác-tử-4-agent--vòng-lặp-phản-biện-critic-tự-sửa-lỗi-tiêu-chí-2---20đ)
- [Câu 3: Backend MySQL, Liều lượng theo thể trọng & Rào chắn thời gian ngưng thuốc](#câu-3-backend-mysql-liều-lượng-theo-thể-trọng--rào-chắn-thời-gian-ngưng-thuốc-tiêu-chí-3---20đ)
- [Câu 4: Bộ kiểm thử tự động 10 Test Cases, Phòng chống SQL Injection & Cơ chế dự phòng](#câu-4-bộ-kiểm-thử-tự-động-10-test-cases-phòng-chống-sql-injection--cơ-chế-dự-phòng-tiêu-chí-4---20đ)
- [Câu 5: So sánh 3 phiên bản Prompt chống ảo giác, Quản lý Git & Nhật ký Prompt](#câu-5-so-sánh-3-phiên-bản-prompt-chống-ảo-giác-quản-lý-git--nhật-ký-prompt-tiêu-chí-5---20đ)

---

## CÂU 1: Phân tích nghiệp vụ chăn nuôi, AI Agent sinh User Story, ERD & Vị trí SDLC (Tiêu chí 1 - 2.0đ)

### ❓ Giảng viên hỏi:
1. *"Tại sao lại cần AI trong khâu phân tích bài toán thay vì con người tự viết?"*
2. *"AI Agent này sinh ra User Story, Use Case và phát hiện điểm mơ hồ (Ambiguity) như thế nào?"*
3. *"CSDL của em gồm những bảng nào, thiết kế ERD quan hệ ra sao?"*

### 🖱️ Vị trí bấm trên Web:
1. Menu trái: **`Phòng Khám & Bác Sĩ AI`** $\rightarrow$ chọn sub-tab **`Kỹ Sư Yêu Cầu AI (SDLC BA)`**.
2. Chọn đề bài mẫu (ví dụ: *Hệ thống IoT Giám sát chuồng trại* hoặc *Dự báo tồn kho thức ăn & vắc-xin*).
3. Bấm nút: **`Phân Tích Đề Bài Kỹ Thuật (SDLC)`**.

### 🎙️ Kịch bản trả lời mẫu:
> *"Thưa thầy/cô, AI được chúng em tích hợp ngay từ **giai đoạn đầu tiên của quy trình SDLC (Requirements Engineering)** đóng vai trò là Senior Business Analyst (BA) kiêm System Architect:
> - **Giải quyết bài toán:** Khách hàng (chủ trang trại) thường đưa ra yêu cầu rất sơ sài và nhiều điểm mơ hồ. Tác tử SDLC BA Agent sẽ tự động quét và chỉ ra **3-5 điểm mập mờ (Ambiguities)** (ví dụ: cách cảnh báo khi cảm biến IoT quá nhiệt, luồng ngoại lệ khi mất mạng, xử lý tranh chấp dữ liệu).
> - **Phân rã công việc:** Tự động sinh User Stories và Tasks kỹ thuật cho 4 nhóm: Backend/API, Frontend/UI, Security, và Testing/QA kèm **Định nghĩa hoàn thành (Definition of Done - DoD)**.
> - **Kiến trúc CSDL (ERD):** Được thiết kế chuẩn hóa 3NF trong file `schema.mysql.sql` gồm 6 bảng thực thể: `animals` (vật nuôi), `barns` (chuồng trại), `inventory_items` (kho hàng), `vaccination_schedules` (lịch tiêm), `health_logs` (bệnh án), và `farm_products` (dược phẩm). Các bảng liên kết chặt chẽ qua Foreign Key để hỗ trợ AI truy vấn thời gian thực."*

---

## CÂU 2: Hệ thống Đa tác tử 4 Agent & Vòng lặp phản biện Critic tự sửa lỗi (Tiêu chí 2 - 2.0đ)

### ❓ Giảng viên hỏi:
1. *"Tại sao phải chia làm 4 Agent riêng biệt thay vì dùng 1 Prompt duy nhất?"*
2. *"Luồng truyền dữ liệu giữa 4 Agent diễn ra như thế nào?"*
3. *"Cơ chế phản biện (Critic Loop) tự sửa lỗi khi hết hàng hoặc vượt ngân sách hoạt động ra sao?"*

### 🖱️ Vị trí bấm trên Web:
1. Tab **`Phòng Khám & Bác Sĩ AI`** $\rightarrow$ chọn sub-tab **`Đa Tác Tử (MAS)`**.
2. Bấm vào chip gợi ý: **`TC05: Vắc xin Bayer dưới 50k`** (kịch bản vượt ngân sách/không có hàng).
3. Bấm **`Chạy Phân Tích Đa Tác Tử`** $\rightarrow$ Mở thẻ **Critic Agent** và **Decision Agent**.

### 🎙️ Kịch bản trả lời mẫu:
> *"Thưa thầy/cô, nếu chỉ dùng 1 prompt đơn lẻ, AI rất dễ bị ảo giác, tự bịa ra loại thuốc không có trong kho hoặc báo giá sai. Hệ thống chia làm 4 Agent chuyên trách hoạt động theo đường ống (Pipeline):
> 1. **Requirement Agent:** Chuẩn hóa câu hỏi ngôn ngữ tự nhiên thành JSON Schema (loài, triệu chứng, ngân sách, hãng).
> 2. **Search Agent:** Thực thi câu lệnh SQL an toàn query vào CSDL MySQL để tìm sản phẩm khớp tiêu chí.
> 3. **Critic Agent (Tác tử phản biện):** Thẩm định độc lập 3 điều kiện: (1) Thuốc có đúng loài không? (2) Còn tồn kho không (`inStock > 0`)? (3) Giá có vượt ngân sách không?
>    - **Vòng lặp tự sửa lỗi (Retry Loop):** Khi khách đòi mua vắc-xin Bayer giá dưới 50k (mức giá không tưởng), Critic kích hoạt vòng lặp nới lỏng tối đa 2 lần: Lần 1 nâng hệ số ngân sách, Lần 2 bỏ ràng buộc hãng để tìm vắc-xin tương đương của Virbac/Marphavet đang có sẵn trong kho.
> 4. **Decision Agent:** Tổng hợp kê đơn, tính toán liều lượng theo số kg của con vật và xuất cảnh báo thời gian ngưng thuốc."*

---

## CÂU 3: Backend MySQL, Liều lượng theo thể trọng & Rào chắn thời gian ngưng thuốc (Tiêu chí 3 - 2.0đ)

### ❓ Giảng viên hỏi:
1. *"Backend kết nối với CSDL MySQL như thế nào? Có cơ chế phòng chống sập không?"*
2. *"Tại sao bắt buộc phải tính liều lượng theo thể trọng (`weightKg`)?"*
3. *"Thời gian ngưng thuốc (Withdrawal period) là gì? Ý nghĩa an toàn thực phẩm ra sao?"*

### 🖱️ Vị trí bấm trên Web:
1. Chỉ vào huy hiệu trên Header: 👉 **`🟢 MySQL Live Connected`**.
2. Mở tab **`Quản lý đàn vật nuôi`**, chỉ vào con heo `HEO-419` (nặng 98kg, chuồng B2).
3. Ở khung kết quả đơn thuốc của Bác sĩ AI, chỉ vào dòng chữ cảnh báo màu cam/đỏ.

### 🎙️ Kịch bản trả lời mẫu:
> *"Thưa thầy/cô:
> - **Về Backend & CSDL:** Backend Flask kết nối MySQL `farmpro_db` qua thư viện `PyMySQL` với Connection Pool. Đặc biệt, file `db.py` tích hợp cơ chế **In-Memory Fallback**: Nếu MySQL gặp sự cố ngắt kết nối, hệ thống tự động trích xuất bản snapshot đệm trong RAM, đảm bảo ứng dụng đạt 100% Uptime không bị crash.
> - **Về Tính liều theo thể trọng:** Dùng sai liều trong chăn nuôi sẽ gây kháng thuốc hoặc chết gia súc. Backend liên kết trực tiếp với trường `weightKg` trong CSDL để tính liều chính xác (ví dụ: Amox-Colis 1ml/10-12kg thể trọng, heo 98kg tiêm đúng 8-9ml).
> - **Về Rào chắn ngưng thuốc (Withdrawal Period):** Đây là rào chắn an toàn y khoa bắt buộc theo chuẩn VietGAHP. Mỗi loại thuốc trong CSDL đều có trường `withdrawal_days` (ví dụ: 14 ngày, 28 ngày). Nếu gia súc thịt sắp xuất chuồng trong vòng 10 ngày tới, AI bắt buộc phát cảnh báo khẩn cấp không cho phép sử dụng kháng sinh có thời gian đào thải dài, ngăn chặn triệt để nguy cơ tồn dư kháng sinh trong thịt và sữa bán cho người tiêu dùng."*

---

## CÂU 4: Bộ kiểm thử tự động 10 Test Cases, Phòng chống SQL Injection & Cơ chế dự phòng (Tiêu chí 4 - 2.0đ)

### ❓ Giảng viên hỏi:
1. *"10 test case của em kiểm thử những khía cạnh nào? Đâu là ca đúng, ca sai, ca bảo mật?"*
2. *"TC07 phòng chống tấn công SQL Injection như thế nào? Cho chạy thử?"*
3. *"Khi API AI quá tải (Rate Limit 429) hoặc mạng bị mất kết nối, hệ thống xử lý ra sao?"*

### 🖱️ Vị trí bấm trên Web:
1. Vào tab **`Đa Tác Tử (MAS)`** $\rightarrow$ chọn tab con **`Bộ Kiểm Thử Tự Động (TC01 - TC10)`**.
2. Bấm nút: **`▶ Chạy Toàn Bộ 10 Test Case Tự Động`** $\rightarrow$ Cả 10 bài test hiện tích xanh ✅ `PASSED`.
3. Bấm mở riêng dòng **`TC07: Phòng vệ chống SQL Injection`**.

### 🎙️ Kịch bản trả lời mẫu:
> *"Thưa thầy/cô, hệ thống sở hữu bộ test suite tự động 10 kịch bản bao quát 4 nhóm:
> - **Kiểm thử đúng (Happy path):** TC01 (Khuyến nghị thuốc có sẵn), TC09 (Chuẩn hóa JSON schema).
> - **Kiểm thử an toàn sinh học:** TC02 (Cảnh báo thời gian ngưng thuốc).
> - **Kiểm thử biên & Phản biện:** TC04 (Giới hạn trần ngân sách), TC05 (Vòng lặp tự sửa lỗi Critic Loop), TC06 (Xử lý hàng hết tồn kho), TC08 (Bệnh kép hô hấp + sốt đỏ).
> - **Kiểm thử bảo mật (TC07 - SQL Injection Defense):** Kẻ tấn công chèn chuỗi `Thuốc trị ho'; DROP TABLE farm_products; -- OR 1=1`. Search Agent có bộ lọc Regex Sanitizer kết hợp cơ chế Parameterized Query, ép chuỗi độc hại thành tham số chuỗi thuần túy, bảo vệ an toàn 100% CSDL.
> - **Cơ chế dự phòng 3 tầng (3-Tier Resilience):** Khi API AI đám mây bị quá tải (429) hoặc hết hạn mức, hàm `withTimeout` (8-15s) sẽ ngắt và tự động chuyển giao sang **Engine thú y nội bộ cục bộ (Offline Clinical Engine)** kết hợp truy vấn MySQL trực tiếp, đảm bảo người dùng luôn nhận được phác đồ cấp cứu mà không bị đơ giao diện."*

---

## CÂU 5: So sánh 3 phiên bản Prompt chống ảo giác, Quản lý Git & Nhật ký Prompt (Tiêu chí 5 - 2.0đ)

### ❓ Giảng viên hỏi:
1. *"Em đã thực nghiệm so sánh 3 phiên bản Prompt nào? Tiêu chí đánh giá là gì?"*
2. *"Kỹ thuật nào giúp loại bỏ hoàn toàn hiện tượng ảo giác (Hallucination)?"*
3. *"Quản lý mã nguồn trên Git và lưu vết tương tác như thế nào?"*

### 🖱️ Vị trí bấm trên Web:
1. Mở tab **`Phòng Khám & Bác Sĩ AI`**, khung chat Bác sĩ AI.
2. Thử hỏi câu: *"Nhà mình có nuôi bò Wagyu không?"* $\rightarrow$ AI trả lời: *"Dạ hiện tại trại không có bò Wagyu, hiện đang nuôi 60 con gồm Holstein Friesian và Black Angus..."* (chứng minh không bị ảo giác).
3. Thử bấm nút **`🗑️ Xóa lịch sử`** cạnh ô chat để chứng minh tính năng quản lý lịch sử trò chuyện.

### 🎙️ Kịch bản trả lời mẫu:
> *"Thưa thầy/cô, nhóm đã thực nghiệm đối chiếu 3 thế hệ Prompt:
> - **Prompt v1 (Zero-Shot thô):** Yêu cầu chung chung 'Bạn là bác sĩ thú y hãy kê đơn'. Kết quả: AI bị ảo giác nặng, tự bịa ra các loại thuốc không có trong kho và báo sai giá.
> - **Prompt v2 (Few-Shot có cấu trúc):** Đã có định dạng đơn thuốc nhưng vẫn bị sai lệch số lượng đàn và không nắm được tình trạng chuồng thực tế.
> - **Prompt v3 (RAG Dynamic Context Snapshot + 3 Quy Tắc Vàng):** Trước khi gọi AI, Backend tự động truy vấn MySQL lấy ảnh chụp dữ liệu thời gian thực (`live_farm_context`) bơm vào System Instruction cùng 3 quy tắc vàng: (1) Trả lời trực tiếp Có/Không trước, (2) Tuyệt đối không xả dữ liệu rác, (3) Chỉ tư vấn mở rộng khi trại chưa có. Kết quả: **Triệt tiêu 100% hiện tượng ảo giác**.
> Toàn bộ mã nguồn được quản lý chặt chẽ trên GitHub tại repo `Sew-cpu/FarmAI`, có commit log rõ ràng, lưu vết lịch sử chat vào LocalStorage/Backend và kèm script chạy tự động `start_servers.bat`."*

---

## 📊 BẢNG TỔNG HỢP "CÂU HỎI & VỊ TRÍ BẤM" PHẢN XẠ NHANH

| Giảng viên hỏi về | Vị trí bấm trên Web `localhost:3000` | Từ khóa "ăn điểm" cần nói |
|---|---|---|
| **CSDL MySQL** | Chỉ huy hiệu `🟢 MySQL Live Connected` | Chuẩn 3NF, 6 bảng thực thể, In-Memory Safe Fallback |
| **Phân tích SDLC** | Tab `Kỹ Sư Yêu Cầu AI (SDLC BA)` | Phát hiện điểm mơ hồ (Ambiguities), phân rã User Story, DoD |
| **4 Agent & Critic Loop** | Tab `Đa Tác Tử (MAS)` $\rightarrow$ chip TC05 | Requirement $\rightarrow$ Search $\rightarrow$ Critic $\rightarrow$ Decision, Retry Loop |
| **10 Test Cases** | Tab `Đa Tác Tử` $\rightarrow$ `Bộ kiểm thử tự động` | Chạy 1-click ra 10/10 Passed, bao quát đúng, sai, biên |
| **Bảo mật SQLi** | Mở riêng dòng `TC07: Phòng vệ SQLi` | Regex Sanitizer, Parameterized Query, triệt tiêu `DROP TABLE` |
| **Thời gian ngưng thuốc** | Dòng chữ cảnh báo màu cam/đỏ ở đơn thuốc | Withdrawal period, tính liều theo thể trọng `weightKg`, VietGAHP |
| **Chống ảo giác** | Hỏi câu hỏi thử về bò Wagyu trên chat | RAG Live Snapshot, 3 Quy tắc vàng, Neo vào dữ liệu thật |


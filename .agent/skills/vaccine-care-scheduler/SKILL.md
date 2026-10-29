---
name: vaccine-care-scheduler
description: >-
  Lập lịch trình tự động nhắc việc chăm sóc, vắc xin và phòng chống dịch bệnh thú y
  theo chuẩn VietGAHP cho các loài vật nuôi (Bò sữa, Bò thịt, Heo nái, Heo thịt, Gà đẻ, Dê).
  Tự động tính toán ngày tiêm, liều lượng theo thể trọng, khoảng cách an toàn giữa các mũi tiêm
  và cảnh báo thời gian đào thải thuốc (Withdrawal period).
---

# SKILL: ĐIỀU PHỐI LỊCH CHĂM SÓC & TIÊM PHÒNG VẮC-XIN FARMPRO AI

Kỹ năng chuyên sâu giúp AI Agent đóng vai trò **Bác sĩ Thú y Trưởng** tại trang trại, hỗ trợ người chăn nuôi lập kế hoạch tiêm phòng vắc-xin, bổ sung dinh dưỡng theo giai đoạn và tự động kích hoạt các lời nhắc việc (Reminders) an toàn sinh học.

---

## 🎯 KHI NÀO SỬ DỤNG SKILL NÀY?
Kích hoạt kỹ năng này khi người dùng:
1. Yêu cầu lập lịch tiêm phòng vắc-xin cho một đàn vật nuôi mới nhập trại hoặc mới sinh.
2. Hỏi về lịch phòng bệnh định kỳ theo mùa (mùa mưa lạnh, nắng nóng, thời điểm giao mùa dịch bệnh).
3. Cần tính toán ngày tiêm và thời gian cách ly ngưng thuốc (*Withdrawal period*) trước khi xuất bán gia súc thịt hoặc thu hoạch sữa.
4. Yêu cầu xuất danh sách công việc nhắc nhở (*Care Tasks*) đồng bộ vào cơ sở dữ liệu `farmpro_db`.

---

## 🧭 QUY TRÌNH 5 BƯỚC ĐIỀU PHỐI LỊCH TIÊM PHÒNG CHUẨN

```
[Bước 1: Thu thập thông tin đàn]
        │
        ▼
[Bước 2: Sàng lọc y khoa & Kiểm tra thân nhiệt]
        │
        ▼
[Bước 3: Lập ma trận lịch tiêm chuẩn VietGAHP]
        │
        ▼
[Bước 4: Thiết lập rào chắn ngưng thuốc (Withdrawal)]
        │
        ▼
[Bước 5: Xuất dữ liệu Lịch trình Markdown + JSON Tasks]
```

### Bước 1: Thu thập & Chuẩn hóa thông tin ca nuôi
- **Loài & Giống:** Bò (sữa HF, thịt Angus), Heo (nái Yorkshire, thịt Duroc), Gà (đẻ Ai Cập, thịt Ri), Dê.
- **Ngày tuổi / Thể trọng trung bình:** Xác định đúng giai đoạn (sơ sinh, cai sữa, hậu bị, mang thai, vỗ béo).
- **Mã chuồng & Số lượng:** Gán chính xác với các khu chuồng (`A1`, `A2`, `B1`, `B2`, `C1`, `D1`).
- **Lịch sử tiêm phòng trước đó:** Tránh tiêm trùng lặp hoặc tiêm quá sát nhau.

### Bước 2: Sàng lọc an toàn trước tiêm (Medical Pre-Check)
1. **Quy tắc vàng 1:** Tuyệt đối **KHÔNG** tiêm vắc-xin khi vật nuôi đang có biểu hiện sốt cao (> 39.5°C), ho dốc, tiêu chảy hoặc đang trong vùng ổ dịch cấp tính.
2. **Quy tắc vàng 2:** Giãn cách tối thiểu **14 ngày** giữa 2 loại vắc-xin sống nhược độc; giãn cách tối thiểu **7 ngày** giữa vắc-xin vô hoạt và vắc-xin sống.
3. **Quy tắc vàng 3:** Không kết hợp tiêm vắc-xin sống với thuốc kháng sinh diệt khuẩn toàn thân trong vòng 48 giờ.

### Bước 3: Lập ma trận tiêm phòng theo đặc thù từng loài

#### A. Đàn Bò (Bò sữa & Bò thịt):
| Ngày tuổi / Mốc | Hạng mục tiêm phòng & chăm sóc | Đường tiêm / Liều | Mức ưu tiên |
|---|---|---|---|
| 15 - 20 ngày | Tẩy giun sán nội ngoại ký sinh trùng (Ivermectin 1%) | Tiêm dưới da 1ml/33kg | Cao |
| 45 ngày | Vắc-xin Tụ Huyết Trùng trâu bò | Tiêm bắp 2 - 3ml | Cao |
| 60 ngày | Vắc-xin Lở Mồm Long Móng (FMD 3 Type: O, A, Asia 1) | Tiêm bắp sâu 2ml | Rất cao |
| 90 ngày | Vắc-xin Viêm Da Nổi Cục (LSD) | Tiêm dưới da 2ml | Cao |
| Định kỳ 6 tháng | Tiêm nhắc lại FMD + Tụ huyết trùng toàn đàn | Tiêm bắp | Cao |

#### B. Đàn Heo (Lợn):
| Ngày tuổi / Mốc | Hạng mục tiêm phòng & chăm sóc | Đường tiêm / Liều | Mức ưu tiên |
|---|---|---|---|
| 3 ngày | Tiêm Sắt (Dextran Iron 200mg) + Phòng Cầu Trùng | Tiêm bắp 1 - 2ml | Bắt buộc |
| 7 - 10 ngày | Vắc-xin Suyễn heo (Mycoplasma) mũi 1 | Tiêm bắp 2ml | Cao |
| 14 - 18 ngày | Vắc-xin Tai Xanh (PRRS) nhược độc | Tiêm bắp 2ml | Rất cao |
| 21 ngày (cai sữa) | Vắc-xin Circo Virus (PCV2) + Suyễn mũi 2 | Tiêm bắp 2ml | Rất cao |
| 35 - 40 ngày | Vắc-xin Dịch Tả Lợn Cổ Điển (CSF) | Tiêm bắp 1ml | Bắt buộc |
| 45 - 50 ngày | Vắc-xin Lở Mồm Long Móng (FMD Type O) | Tiêm bắp 2ml | Cao |

#### C. Đàn Gia Cầm (Gà đẻ, gà thịt):
| Ngày tuổi / Mốc | Hạng mục tiêm phòng & chăm sóc | Cách cấp | Mức ưu tiên |
|---|---|---|---|
| 1 - 3 ngày | Vắc-xin Newcastle + Viêm phế quản truyền nhiễm (ND-IB) | Nhỏ mắt, mũi | Bắt buộc |
| 7 ngày | Chủng Đậu gà (Fowl Pox) | Chủng màng cánh | Cao |
| 10 - 14 ngày | Vắc-xin Gumboro (IBD) lần 1 | Nhỏ miệng hoặc pha nước | Cao |
| 21 ngày | Vắc-xin Newcastle (Lasota) + Gumboro lần 2 | Pha nước uống | Cao |
| 45 ngày | Vắc-xin Cúm Gia Cầm (H5N1/H5N6) | Tiêm dưới da cổ 0.5ml | Bắt buộc |

---

## ⚠️ BƯỚC 4: RÀO CHẮN THỜI GIAN NGƯNG THUỐC (WITHDRAWAL PERIOD)
Khi lên lịch tiêm hoặc dùng kháng sinh điều trị kết hợp, hệ thống **bắt buộc kiểm tra cột mốc xuất chuồng**:
- Nếu **Bò thịt / Heo thịt** dự kiến xuất chuồng trong vòng **21 ngày tới**:
  - Không được dùng kháng sinh nhóm Quinolone, Doxycycline, Florfenicol dạng tác dụng kéo dài (thời gian đào thải 21 - 28 ngày).
  - Ưu tiên các biện pháp thảo dược, kháng sinh đào thải nhanh (3 - 5 ngày như Penicillin) hoặc cách ly cá thể bệnh sang chuồng riêng.
- Nếu **Bò sữa đang vắt sữa**:
  - Cảnh báo thời gian hủy bỏ sữa không thương phẩm (thường 72 giờ đối với kháng sinh điều trị viêm vú).

---

## 📦 BƯỚC 5: MẪU DỮ LIỆU ĐẦU RA CHUẨN ĐỒNG BỘ VÀO CSDL

AI Agent xuất ra cấu trúc JSON tương thích 100% với bảng `care_tasks` / `vaccination_schedules` trong MySQL:

```json
{
  "scheduleSummary": {
    "species": "Heo",
    "targetBarn": "Chuồng B2 - Heo Thịt Thương Phẩm",
    "startDate": "2026-11-01",
    "totalTasks": 4,
    "biosecurityLevel": "VietGAHP Chuẩn"
  },
  "tasks": [
    {
      "title": "[Vắc xin] Tiêm phòng Circo Virus (PCV2) đàn Heo B2",
      "category": "Vắc xin",
      "dueDate": "2026-11-03",
      "priority": "Cao",
      "assignedTo": "BS. Nguyễn Mai Lan",
      "dosage": "Tiêm bắp sâu 2ml/con sau gốc tai",
      "withdrawalDays": 21,
      "preCheckNote": "Đo thân nhiệt ngẫu nhiên 5 con, chỉ tiêm khi thân nhiệt < 39.5°C",
      "isAiGenerated": true
    },
    {
      "title": "[An toàn sinh học] Phun tiêu độc khử trùng chuồng nuôi Omnicide 1:200",
      "category": "An toàn sinh học",
      "dueDate": "2026-11-07",
      "priority": "Cao",
      "assignedTo": "KTV. Lê Hoàng Nam",
      "dosage": "Pha 50ml Omnicide vào 10L nước sạch phun sương",
      "withdrawalDays": 0,
      "preCheckNote": "Cách ngày tiêm vắc xin sống ít nhất 48 tiếng",
      "isAiGenerated": true
    }
  ]
}
```

---

## 🚨 QUY TRÌNH XỬ LÝ KHẨN CẤP: SỐC PHẢN VỆ SAU TIÊM
Mỗi khi lập lịch vắc-xin, Skill luôn đính kèm hướng dẫn khẩn cấp:
1. **Triệu chứng sốc phản vệ:** Vật nuôi run rẩy, sùi bọt mép, mắt trợn ngược, thở dốc, ngã quỵ trong vòng 5 - 30 phút sau tiêm.
2. **Xử lý ngay tại chỗ:**
   - Tiêm ngay **Atropin Sulfate 0.1%** (1ml/15-20kg thể trọng) hoặc **Adrenaline 1‰** (1ml/50kg thể trọng).
   - Tiêm trợ tim **Cafein** (3 - 5ml tiêm bắp).
   - Kéo đầu vật nuôi lên cao để thông đường thở, chườm nước mát vào đầu và tai.


-- ========================================================
-- FarmPro AI - MySQL Database Schema & Initial Seed Data
-- ========================================================

CREATE DATABASE IF NOT EXISTS `farmpro_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `farmpro_db`;

-- 1. Bảng Danh Mục Sản Phẩm & Thuốc Thú Y (Dành cho Multi-Agent System TC01-TC10)
DROP TABLE IF EXISTS `farm_products`;
CREATE TABLE `farm_products` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `category` ENUM('Thuốc & Vắc xin', 'Thức ăn & Dinh dưỡng', 'Thực phẩm bổ sung', 'Vật tư & Sát trùng') NOT NULL,
  `target_species` JSON NOT NULL, -- Danh sách loài: ["Bò", "Heo", "Gà", ...]
  `price_vnd` INT UNSIGNED NOT NULL,
  `unit` VARCHAR(50) NOT NULL,
  `active_ingredients` TEXT NOT NULL,
  `indications` TEXT NOT NULL,
  `dosage` TEXT NOT NULL,
  `withdrawal_days` INT UNSIGNED DEFAULT 0,
  `in_stock` INT UNSIGNED NOT NULL DEFAULT 0,
  `keywords` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_brand` (`brand`),
  INDEX `idx_category` (`category`),
  INDEX `idx_price` (`price_vnd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Dữ Liệu Khởi Tạo Sản Phẩm (Matching FarmPro Catalog)
INSERT INTO `farm_products` (`id`, `name`, `brand`, `category`, `target_species`, `price_vnd`, `unit`, `active_ingredients`, `indications`, `dosage`, `withdrawal_days`, `in_stock`, `keywords`) VALUES
('prod-01', 'Kháng sinh Amox-Colis Đặc Trị Hô Hấp & Tiêu Hóa', 'Marphavet', 'Thuốc & Vắc xin', '["Heo", "Bò", "Gà", "Vịt", "Dê"]', 145000, 'Chai 100ml', 'Amoxicillin Trihydrate 15%, Colistin Sulfate 25M UI', 'Đặc trị sốt phát ban, viêm phổi cấp, thở giật bụng, viêm ruột tiêu chảy phân xanh phân trắng, phó thương hàn ở heo và bê nghé.', 'Tiêm bắp 1ml / 10 - 12kg thể trọng, ngày 1 lần liên tục 3-5 ngày.', 14, 25, '["sốt đỏ", "viêm phổi", "thở dốc", "tiêu chảy", "amox", "kháng sinh", "phó thương hàn"]'),
('prod-02', 'Kháng sinh Flo-Doxy Max Tác Dụng Kéo Dài 48H', 'Marphavet', 'Thuốc & Vắc xin', '["Heo", "Bò", "Dê"]', 185000, 'Chai 100ml', 'Florfenicol 30%, Doxycycline Hyclate 10%', 'Đặc trị viêm phổi dính sườn (APP), suyễn heo do Mycoplasma, tai xanh ghép sốt đỏ, tụ huyết trùng gia súc.', 'Tiêm bắp sâu 1ml / 20kg thể trọng, một mũi tác dụng 48 giờ.', 28, 18, '["viêm phổi dính sườn", "app", "suyễn heo", "tai xanh", "ho khan", "thở giật"]'),
('prod-03', 'Vắc xin Lở Mồm Long Móng Aftovaxpur 3 Type (O, A, Asia1)', 'Virbac', 'Thuốc & Vắc xin', '["Bò", "Heo", "Dê", "Cừu"]', 850000, 'Lọ 50 liều', 'Kháng nguyên vô hoạt FMD Type O, A, Asia1 với chất bổ trợ dầu', 'Tạo miễn dịch chủ động phòng bệnh lở mồm long móng ở gia súc guốc chẵn, bảo hộ kéo dài 6-12 tháng.', 'Tiêm dưới da hoặc tiêm bắp: Bò 2ml/con, Heo/Dê 1ml/con. Tiêm nhắc định kỳ 6 tháng.', 0, 10, '["lở mồm long móng", "lmlm", "vắc xin", "virbac", "chân móng loét", "chảy nước dãi"]'),
('prod-04', 'Dung Dịch Hạ Sốt & Kháng Viêm Anagin-C Hạ Nhiệt Cấp', 'Bio-Pharmachemie', 'Thuốc & Vắc xin', '["Bò", "Heo", "Chó", "Mèo", "Dê"]', 68000, 'Chai 100ml', 'Analgin 20%, Vitamin C 5%', 'Hạ sốt nhanh trong các bệnh truyền nhiễm cấp tính, giảm đau, trợ lực, tiêu viêm, chống cảm nóng sốt cao.', 'Tiêm bắp 1ml / 10 - 15kg thể trọng, có thể lặp lại sau 8 - 12 giờ.', 7, 40, '["hạ sốt", "sốt cao", "giảm đau", "anagin", "vitamin c", "trợ lực"]'),
('prod-05', 'Cám Hỗn Hợp Vỗ Béo Bò Thịt Cao Cấp Beef Master CP 992', 'CP Việt Nam', 'Thức ăn & Dinh dưỡng', '["Bò", "Dê"]', 380000, 'Bao 40kg', 'Đạm thô 16%, Xơ thô max 12%, Canxi 0.9%, Photpho 0.5%, Năng lượng ME 2800 kcal/kg', 'Cung cấp năng lượng đạm và khoáng vi lượng tối ưu cho bò thịt giai đoạn vỗ béo tăng trọng từ 1.2 - 1.6 kg/ngày, thớ thịt săn chắc, mỡ trắng.', 'Cho ăn 3 - 5 kg/con/ngày kết hợp cỏ voi ủ chua và rơm khô sạch.', 0, 50, '["vỗ béo", "tăng trọng", "cám bò", "bò thịt", "cp việt nam", "dinh dưỡng", "tăng cân"]'),
('prod-06', 'Thức Ăn Bổ Sung Premix Khoáng & Vitamin Cho Bò Sữa MilkBoost', 'De Heus', 'Thực phẩm bổ sung', '["Bò", "Dê"]', 290000, 'Bao 25kg', 'Vitamin A, D3, E, Biotin, Kẽm hữu cơ, Mangan, Đồng, Men sống Saccharomyces cerevisiae', 'Tăng sản lượng sữa từ 10 - 15%, cải thiện tỷ lệ thụ thai, ngừa bại liệt sau sinh và viêm vú tiềm ẩn do thiếu khoáng.', 'Trộn 50 - 100g/con/ngày vào thức ăn tinh.', 0, 30, '["khoáng vi lượng", "bò sữa", "tăng sữa", "de heus", "premix", "men sống", "bổ sung"]'),
('prod-07', 'Men Tiêu Hóa Cao Cấp Bio-Subtilis Men Sống Chịu Kháng Sinh', 'Bio-Pharmachemie', 'Thực phẩm bổ sung', '["Heo", "Gà", "Vịt", "Bò", "Chó"]', 75000, 'Gói 1kg', 'Bacillus subtilis 10^9 CFU/g, Lactobacillus acidophilus, Enzym Protease, Amylase', 'Cân bằng hệ vi sinh đường ruột, phục hồi nhung mao ruột sau khi dùng kháng sinh, chống phân sống, khử mùi hôi phân chuồng trại.', 'Pha 1g / 1 - 2 lít nước uống hoặc trộn 1kg / 500kg thức ăn.', 0, 45, '["men tiêu hóa", "men sống", "tiêu hóa", "chống phân sống", "bảo vệ đường ruột"]'),
('prod-08', 'Sát Trùng Chuồng Trại Phổ Rộng Omnicide Extra', 'Bayer', 'Vật tư & Sát trùng', '["Heo", "Bò", "Gà", "Vịt", "Dê"]', 260000, 'Chai 1 Lít', 'Glutaraldehyde 15%, Cocobenzyl dimethyl ammonium chloride 10%', 'Tiêu diệt 100% virus Dịch tả lợn Châu Phi (ASF), Cúm gia cầm (H5N1), Tai xanh (PRRS), vi khuẩn và bào tử nấm.', 'Pha tỷ lệ 1:200 phun khử trùng định kỳ, hoặc 1:100 khi có dịch bệnh.', 0, 35, '["sát trùng", "khử trùng", "bayer", "dịch tả", "asf", "omnicide", "chuồng trại"]'),
('prod-09', 'Thuốc Trị Ký Sinh Trùng Đường Máu Boverm Inj', 'Virbac', 'Thuốc & Vắc xin', '["Bò", "Dê", "Ngựa", "Chó"]', 320000, 'Lọ 50ml', 'Diminazene Aceturate 70mg/ml, Phenazone 375mg/ml', 'Đặc trị bệnh tiên mao trùng, lê dạng trùng, biên trùng ở bò sữa và bò thịt gây sốt cao, thiếu máu, tiểu đỏ.', 'Tiêm bắp sâu 1ml / 20kg thể trọng, kết hợp bổ sung sắt và B12.', 21, 12, '["ký sinh trùng đường máu", "tiểu đỏ", "thiếu máu", "virbac", "bò sốt", "ve rận"]'),
('prod-10', 'Thuốc Trị Ve Rận & Tẩy Giun Sán Nội Ngoại Ký Sinh Ivermectin 1%', 'Hanuchem', 'Thuốc & Vắc xin', '["Heo", "Bò", "Dê", "Chó"]', 45000, 'Chai 20ml', 'Ivermectin 10mg/ml', 'Đặc trị ghẻ, ve rận, mạt, bọ chét và các loại giun đũa, giun phổi, giun dạ cỏ ký sinh.', 'Tiêm dưới da: Bò/Heo 1ml / 33kg thể trọng. Chó 1ml / 30 - 50kg thể trọng.', 28, 60, '["ghẻ", "ve rận", "tẩy giun", "ivermectin", "ngứa", "ký sinh trùng"]'),
('prod-11', 'Hỗn Hợp Bồi Bổ Thảo Dược Gluco-K-C Thảo Mộc', 'Marphavet', 'Thực phẩm bổ sung', '["Heo", "Bò", "Gà", "Vịt"]', 55000, 'Gói 1kg', 'Glucose cao năng lượng, Vitamin K3, Vitamin C, Cao thảo dược Actiso và Kim ngân hoa', 'Giải độc gan thận, trợ tim, giải nhiệt chống nóng mùa hè, cầm máu khi mắc cầu trùng, tăng sức đề kháng.', 'Pha 1g / 1 lít nước sạch cho uống tự do suốt ngày.', 0, 80, '["gluco kc", "giải nhiệt", "chống sốc", "thảo mộc", "marphavet", "bổ sung"]'),
('prod-12', 'Cám Khởi Động Giai Đoạn 1 Cho Heo Con Cai Sữa CP 551', 'CP Việt Nam', 'Thức ăn & Dinh dưỡng', '["Heo"]', 420000, 'Bao 25kg', 'Đạm tiêu hóa cao 20%, Sữa bột cao cấp, Kẽm Oxit chống tiêu chảy, Axit hữu cơ', 'Kích thích heo con tập ăn sớm từ 7 ngày tuổi, giảm thiểu tỷ lệ tiêu chảy sau cai sữa, đường ruột khỏe mạnh.', 'Cho ăn tự do nhiều lần trong ngày, máng ăn sạch sẽ khô ráo.', 0, 22, '["heo con", "cám tập ăn", "cai sữa", "cp việt nam", "dinh dưỡng heo"]');

-- 3. Bảng Quản Lý Chuồng Trại
DROP TABLE IF EXISTS `barns`;
CREATE TABLE `barns` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `species` VARCHAR(50) NOT NULL,
  `capacity` INT UNSIGNED NOT NULL,
  `current_count` INT UNSIGNED NOT NULL,
  `temperature` DECIMAL(4,1) NOT NULL,
  `humidity` DECIMAL(4,1) NOT NULL,
  `ventilation` ENUM('Bật', 'Tắt') NOT NULL DEFAULT 'Bật',
  `cleanliness` ENUM('Tốt', 'Khá', 'Cần dọn') NOT NULL DEFAULT 'Tốt',
  `last_sanitized` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Quản Lý Vật Nuôi
DROP TABLE IF EXISTS `animals`;
CREATE TABLE `animals` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `tag_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `species` VARCHAR(50) NOT NULL,
  `breed` VARCHAR(100) NOT NULL,
  `gender` ENUM('Đực', 'Cái') NOT NULL,
  `birth_date` DATE NOT NULL,
  `weight_kg` DECIMAL(6,2) NOT NULL,
  `barn_id` VARCHAR(50) NOT NULL,
  `status` ENUM('healthy', 'sick', 'pregnant', 'isolated') NOT NULL DEFAULT 'healthy',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`barn_id`) REFERENCES `barns`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Kho Dược Phẩm & Thức Ăn Trang Trại
DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE `inventory_items` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('Thức ăn', 'Thuốc & Vắc xin', 'Thực phẩm bổ sung', 'Vật tư chuồng trại') NOT NULL,
  `quantity` DECIMAL(8,2) NOT NULL,
  `unit` VARCHAR(50) NOT NULL,
  `min_threshold` DECIMAL(8,2) NOT NULL,
  `unit_price` INT UNSIGNED NOT NULL,
  `supplier` VARCHAR(100) NOT NULL,
  `expiry_date` DATE NOT NULL,
  `location` VARCHAR(100) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Lịch Trình Chăm Sóc & Phác Đồ Thú Y
DROP TABLE IF EXISTS `care_tasks`;
CREATE TABLE `care_tasks` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('Cho ăn & Dinh dưỡng', 'Vắc xin', 'Kiểm tra sức khỏe', 'Vệ sinh chuồng', 'Khác') NOT NULL,
  `due_date` DATE NOT NULL,
  `priority` ENUM('Thấp', 'Trung bình', 'Cao', 'Khẩn cấp') NOT NULL,
  `status` ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
  `assigned_to` VARCHAR(100) DEFAULT 'Kỹ thuật viên thú y',
  `notes` TEXT,
  `is_ai_generated` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

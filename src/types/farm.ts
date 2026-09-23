export type AnimalStatus = 'healthy' | 'monitoring' | 'sick' | 'isolated' | 'pregnant';

export type Species = 'Bò' | 'Heo' | 'Gà' | 'Vịt' | 'Dê' | 'Cừu' | 'Khác';

export interface Animal {
  id: string;
  tagId: string; // Ear tag or batch ID
  name: string;
  species: Species;
  breed: string; // E.g., Bò Holstein Friesian, Heo Yorkshire...
  gender: 'Đực' | 'Cái';
  birthDate: string;
  weightKg: number;
  barnId: string;
  status: AnimalStatus;
  notes?: string;
  vaccinationHistory: {
    vaccineName: string;
    date: string;
    nextDueDate?: string;
  }[];
  lastCheckupDate?: string;
}

export interface Barn {
  id: string;
  name: string;
  species: Species;
  capacity: number;
  currentCount: number;
  temperature: number; // in °C
  humidity: number; // in %
  ventilationOn: boolean;
  cleanliness: 'Tốt' | 'Cần dọn' | 'Đang khử trùng';
  lastSanitized: string;
}

export interface CareTask {
  id: string;
  title: string;
  category: 'Vắc xin' | 'Cho ăn & Dinh dưỡng' | 'Vệ sinh chuồng' | 'Kiểm tra sức khỏe' | 'Điều trị' | 'Khác';
  dueDate: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  status: 'pending' | 'completed';
  assignedTo?: string;
  targetAnimalId?: string;
  targetBarnId?: string;
  notes?: string;
  isAiGenerated?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Thức ăn' | 'Thuốc & Vắc xin' | 'Thực phẩm bổ sung' | 'Vật tư chuồng trại';
  quantity: number;
  unit: string; // Bao, kg, lọ, lít...
  minThreshold: number;
  expiryDate?: string;
  costPerUnit: number; // VND
  supplier?: string;
}

export interface HealthLog {
  id: string;
  animalId: string;
  animalTag: string;
  animalName: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  veterinarian: string;
  status: 'Đang điều trị' | 'Đã khỏi' | 'Theo dõi thêm' | 'Chuyển cách ly';
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'Chủ trang trại' | 'Kỹ sư chăn nuôi' | 'Bác sĩ thú y';
  farmName: string;
  farmLocation: string;
  farmAreaHectares: number;
  phone: string;
}

export interface ProductionStat {
  date: string;
  milkLiters: number;
  eggCount: number;
  feedConsumedKg: number;
}

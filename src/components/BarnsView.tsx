import React, { useState } from 'react';
import {
  Warehouse,
  Plus,
  Thermometer,
  Droplets,
  Fan,
  Sparkles,
  ShieldCheck,
  Edit,
  Trash2,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Barn, Species } from '../types/farm';

export const BarnsView: React.FC = () => {
  const { barns, addBarn, updateBarn, deleteBarn, toggleBarnVentilation, sanitizeBarn } = useFarm();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBarn, setEditingBarn] = useState<Barn | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('Bò');
  const [capacity, setCapacity] = useState(50);
  const [currentCount, setCurrentCount] = useState(0);
  const [temperature, setTemperature] = useState(26.5);
  const [humidity, setHumidity] = useState(70);
  const [cleanliness, setCleanliness] = useState<'Tốt' | 'Cần dọn' | 'Đang khử trùng'>('Tốt');

  const handleOpenAdd = () => {
    setName('Chuồng Mới Khu E');
    setSpecies('Bò');
    setCapacity(40);
    setCurrentCount(0);
    setTemperature(26.0);
    setHumidity(70);
    setCleanliness('Tốt');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (barn: Barn) => {
    setEditingBarn(barn);
    setName(barn.name);
    setSpecies(barn.species);
    setCapacity(barn.capacity);
    setCurrentCount(barn.currentCount);
    setTemperature(barn.temperature);
    setHumidity(barn.humidity);
    setCleanliness(barn.cleanliness);
  };

  const handleSaveBarn = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBarn) {
      updateBarn(editingBarn.id, {
        name,
        species,
        capacity: Number(capacity),
        currentCount: Number(currentCount),
        temperature: Number(temperature),
        humidity: Number(humidity),
        cleanliness,
      });
      setEditingBarn(null);
    } else {
      addBarn({
        name,
        species,
        capacity: Number(capacity),
        currentCount: Number(currentCount),
        temperature: Number(temperature),
        humidity: Number(humidity),
        ventilationOn: true,
        cleanliness,
        lastSanitized: new Date().toISOString().split('T')[0],
      });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-emerald-600" />
            Quản Lý Chuồng Trại & Môi Trường
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Giám sát nhiệt độ, độ ẩm, quạt thông gió và vệ sinh an toàn sinh học các khu nuôi
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Thêm Chuồng Trại Mới
        </button>
      </div>

      {/* Barns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {barns.map((barn) => {
          const occupancyPercent = Math.min(100, Math.round((barn.currentCount / barn.capacity) * 100));
          const isOvercrowded = occupancyPercent >= 90;

          return (
            <div
              key={barn.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              {/* Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Khu nuôi {barn.species}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(barn)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      title="Chỉnh sửa chuồng"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn muốn xóa ${barn.name}?`)) deleteBarn(barn.id);
                      }}
                      className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                      title="Xóa chuồng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-stone-900">{barn.name}</h3>
              </div>

              {/* Occupancy Progress */}
              <div className="space-y-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-500">Mật độ nuôi:</span>
                  <span className="font-bold text-stone-800">
                    {barn.currentCount} / {barn.capacity} con ({occupancyPercent}%)
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOvercrowded ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>

              {/* Climate Sensors */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Nhiệt độ</span>
                    <span className="font-bold text-stone-800 text-sm">{barn.temperature}°C</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Độ ẩm</span>
                    <span className="font-bold text-stone-800 text-sm">{barn.humidity}%</span>
                  </div>
                </div>
              </div>

              {/* Ventilation & Sanitization Controls */}
              <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600 flex items-center gap-1.5 font-medium">
                    <Fan className={`w-4 h-4 ${barn.ventilationOn ? 'text-emerald-600 animate-spin' : 'text-stone-400'}`} />
                    Quạt thông gió:
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBarnVentilation(barn.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                      barn.ventilationOn
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {barn.ventilationOn ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 block">Tình trạng vệ sinh:</span>
                    <span className={`font-bold ${barn.cleanliness === 'Tốt' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {barn.cleanliness} (Khử trùng: {barn.lastSanitized})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => sanitizeBarn(barn.id)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Phun khử trùng
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Barn Modal */}
      {(isAddModalOpen || editingBarn) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingBarn ? 'Cập Nhật Chuồng Trại' : 'Thêm Khu Chuồng Mới'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingBarn(null);
                }}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBarn} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Tên chuồng trại *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Chuồng A1, Khu Heo Thịt B2..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Loài nuôi chính</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as Species)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Bò">Bò</option>
                    <option value="Heo">Heo</option>
                    <option value="Gà">Gà</option>
                    <option value="Dê">Dê</option>
                    <option value="Vịt">Vịt</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Sức chứa tối đa (con)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Nhiệt độ hiện tại (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Độ ẩm không khí (%)</label>
                  <input
                    type="number"
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Tình trạng vệ sinh</label>
                <select
                  value={cleanliness}
                  onChange={(e) => setCleanliness(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Tốt">Tốt (Đã tiêu độc khử trùng)</option>
                  <option value="Cần dọn">Cần dọn dẹp vệ sinh</option>
                  <option value="Đang khử trùng">Đang trong thời gian khử trùng trống chuồng</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingBarn(null);
                  }}
                  className="px-4 py-2 border border-stone-300 rounded-xl hover:bg-stone-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {editingBarn ? 'Cập Nhật' : 'Lưu Chuồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

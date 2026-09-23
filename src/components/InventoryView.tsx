import React, { useState } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  CheckCircle2,
  TrendingDown,
  Trash2,
  Edit,
  X,
  Save,
  Syringe,
  Wheat,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { InventoryItem } from '../types/farm';

export const InventoryView: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, adjustInventoryStock } = useFarm();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Thức ăn');
  const [quantity, setQuantity] = useState(20);
  const [unit, setUnit] = useState('Bao (40kg)');
  const [minThreshold, setMinThreshold] = useState(10);
  const [costPerUnit, setCostPerUnit] = useState(300000);
  const [expiryDate, setExpiryDate] = useState('2027-01-01');
  const [supplier, setSupplier] = useState('');

  const handleOpenAdd = () => {
    setName('');
    setCategory('Thức ăn');
    setQuantity(20);
    setUnit('Bao (40kg)');
    setMinThreshold(10);
    setCostPerUnit(320000);
    setExpiryDate('2027-01-01');
    setSupplier('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setMinThreshold(item.minThreshold);
    setCostPerUnit(item.costPerUnit);
    setExpiryDate(item.expiryDate || '');
    setSupplier(item.supplier || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        name,
        category,
        quantity: Number(quantity),
        unit,
        minThreshold: Number(minThreshold),
        costPerUnit: Number(costPerUnit),
        expiryDate,
        supplier,
      });
      setEditingItem(null);
    } else {
      addInventoryItem({
        name,
        category,
        quantity: Number(quantity),
        unit,
        minThreshold: Number(minThreshold),
        costPerUnit: Number(costPerUnit),
        expiryDate,
        supplier,
      });
      setIsAddModalOpen(false);
    }
  };

  const lowStockItems = inventory.filter((item) => item.quantity <= item.minThreshold);

  const filteredItems = inventory.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Kho Thức Ăn & Dược Phẩm Thú Y
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Quản lý tồn kho thức ăn chăn nuôi, vắc xin, kháng sinh và hóa chất sát trùng
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nhập Mặt Hàng Mới
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Cảnh báo tồn kho xuống dưới mức an toàn!</h4>
            <p className="mt-0.5 text-amber-800">
              Có {lowStockItems.length} mặt hàng sắp hết:{' '}
              {lowStockItems.map((i) => `${i.name} (còn ${i.quantity} ${i.unit})`).join(', ')}.
              Xin hãy lên kế hoạch nhập hàng để không làm gián đoạn chăn nuôi.
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              categoryFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Tất cả kho
          </button>
          <button
            onClick={() => setCategoryFilter('Thức ăn')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              categoryFilter === 'Thức ăn'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🌾 Thức ăn & Cám
          </button>
          <button
            onClick={() => setCategoryFilter('Thuốc & Vắc xin')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              categoryFilter === 'Thuốc & Vắc xin'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            💉 Thuốc & Vắc xin
          </button>
          <button
            onClick={() => setCategoryFilter('Thực phẩm bổ sung')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              categoryFilter === 'Thực phẩm bổ sung'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🧪 Điện giải & Men tiêu hóa
          </button>
          <button
            onClick={() => setCategoryFilter('Vật tư chuồng trại')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              categoryFilter === 'Vật tư chuồng trại'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            🧼 Hóa chất sát trùng
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên vật tư, nhà cung cấp..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isLow = item.quantity <= item.minThreshold;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                isLow ? 'border-amber-300 shadow-xs bg-amber-50/20' : 'border-stone-200 shadow-xs'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                    {item.category}
                  </span>
                  {isLow ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Sắp hết hàng
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Đủ dự trữ
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-stone-900 line-clamp-1">{item.name}</h3>

                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-2xl font-extrabold text-stone-900">{item.quantity}</span>
                  <span className="text-xs text-stone-500 font-medium">{item.unit}</span>
                </div>

                <div className="text-[11px] text-stone-500 space-y-0.5 pt-1">
                  <p>Mức an toàn tối thiểu: <strong>{item.minThreshold} {item.unit}</strong></p>
                  {item.expiryDate && <p>Hạn sử dụng: <strong>{item.expiryDate}</strong></p>}
                  {item.supplier && <p>Nhà cung ứng: <strong>{item.supplier}</strong></p>}
                </div>
              </div>

              {/* Adjust Stock Controls */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustInventoryStock(item.id, -1)}
                    className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                    title="Xuất dùng 1 đơn vị"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => adjustInventoryStock(item.id, -5)}
                    className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                    title="Xuất dùng 5 đơn vị"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => adjustInventoryStock(item.id, 5)}
                    className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs"
                    title="Nhập thêm 5 đơn vị"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => adjustInventoryStock(item.id, 20)}
                    className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs"
                    title="Nhập thêm 20 đơn vị"
                  >
                    +20
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                  title="Chỉnh sửa chi tiết"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Inventory Modal */}
      {(isAddModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingItem ? 'Cập Nhật Mặt Hàng Kho' : 'Nhập Mặt Hàng Kho Mới'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Tên mặt hàng *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cám heo De Heus, Vắc xin LMLM, Benkocid..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Phân loại</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Thức ăn">Thức ăn</option>
                    <option value="Thuốc & Vắc xin">Thuốc & Vắc xin</option>
                    <option value="Thực phẩm bổ sung">Thực phẩm bổ sung</option>
                    <option value="Vật tư chuồng trại">Vật tư chuồng trại</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Bao (40kg), Lọ, Can (1L), Tấn..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Số lượng tồn kho</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Ngưỡng báo động tối thiểu</label>
                  <input
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Hạn sử dụng</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Nhà cung cấp / Đại lý</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="CP, Cargill, Marphavet..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
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
                  {editingItem ? 'Cập Nhật' : 'Lưu Mặt Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

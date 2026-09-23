import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Milk,
  Egg,
  Scale,
  DollarSign,
  Sparkles,
  PieChart,
  Download,
  Calendar,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export const ReportsView: React.FC = () => {
  const { animals, productionStats, inventory, tasks } = useFarm();
  const [reportPeriod, setReportPeriod] = useState('7 ngày qua');

  // Breakdown by species
  const speciesCounts: Record<string, number> = {};
  animals.forEach((a) => {
    speciesCounts[a.species] = (speciesCounts[a.species] || 0) + 1;
  });

  // Health breakdown
  const healthyCount = animals.filter((a) => a.status === 'healthy').length;
  const monitoringCount = animals.filter((a) => a.status === 'monitoring').length;
  const sickCount = animals.filter((a) => a.status === 'sick' || a.status === 'isolated').length;
  const pregnantCount = animals.filter((a) => a.status === 'pregnant').length;

  const totalValueInventory = inventory.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Báo Cáo Hiệu Suất & Thống Kê Trang Trại
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Theo dõi sản lượng sữa, trứng, chi phí thức ăn và biến động sức khỏe đàn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="7 ngày qua">7 ngày qua</option>
            <option value="30 ngày qua">30 ngày qua</option>
            <option value="Quý này">Quý này</option>
          </select>

          <button
            onClick={() => alert('Đang xuất báo cáo định dạng PDF/Excel...')}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Sản lượng sữa hôm nay</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Milk className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-stone-900">540</span>
            <span className="text-xs font-semibold text-stone-500">Lít/ngày</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +12.5% so với tuần trước
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Thu hoạch trứng gà</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Egg className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-stone-900">990</span>
            <span className="text-xs font-semibold text-stone-500">Quả/ngày</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> Tỷ lệ đẻ 88%
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Tiêu thụ thức ăn / ngày</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-stone-900">875</span>
            <span className="text-xs font-semibold text-stone-500">kg thức ăn</span>
          </div>
          <span className="text-[11px] font-semibold text-stone-500">Hệ số FCR đạt chuẩn tối ưu</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Giá trị kho vật tư</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-stone-900">
              {(totalValueInventory / 1000000).toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-stone-500">Triệu VNĐ</span>
          </div>
          <span className="text-[11px] font-semibold text-stone-500">{inventory.length} mặt hàng lưu kho</span>
        </div>
      </div>

      {/* Production Chart & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Trends */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Biểu Đồ Năng Suất Sản Phẩm Chăn Nuôi</h3>
              <p className="text-xs text-stone-500">Sản lượng sữa (Lít) & Trứng (Quả) 7 ngày gần nhất</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-stone-600">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                Sữa (Lít)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-stone-600">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                Trứng (Quả)
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 h-64 flex items-end justify-between gap-4 border-b border-stone-200 pb-3">
            {productionStats.map((stat, idx) => {
              const milkHeight = Math.round((stat.milkLiters / 600) * 100);
              const eggHeight = Math.round((stat.eggCount / 1100) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Milk bar */}
                    <div
                      className="w-1/2 max-w-[20px] bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all relative"
                      style={{ height: `${milkHeight}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none transition-opacity">
                        {stat.milkLiters}L
                      </span>
                    </div>

                    {/* Egg bar */}
                    <div
                      className="w-1/2 max-w-[20px] bg-amber-400 hover:bg-amber-500 rounded-t-md transition-all relative"
                      style={{ height: `${eggHeight}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none transition-opacity">
                        {stat.eggCount}q
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-600">{stat.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Herd Structure & Health Pie */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5 text-xs">
          <div>
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              Cơ Cấu Đàn & Sức Khỏe
            </h3>
            <p className="text-stone-500 text-[11px]">Tỷ lệ phân bổ vật nuôi tại cơ sở</p>
          </div>

          {/* Health Status breakdown */}
          <div className="space-y-2">
            <span className="font-semibold text-stone-700 block">Tỷ lệ tình trạng sức khỏe:</span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-emerald-700 font-semibold">Khỏe mạnh</span>
                <span className="font-bold text-stone-800">{healthyCount} con</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(healthyCount / animals.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-amber-700 font-semibold">Cần theo dõi</span>
                <span className="font-bold text-stone-800">{monitoringCount} con</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${(monitoringCount / animals.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-red-700 font-semibold">Đang điều trị / Cách ly</span>
                <span className="font-bold text-stone-800">{sickCount} con</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{ width: `${(sickCount / animals.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-pink-700 font-semibold">Đang mang thai</span>
                <span className="font-bold text-stone-800">{pregnantCount} con</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-pink-400 h-full rounded-full"
                  style={{ width: `${(pregnantCount / animals.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Species distribution */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <span className="font-semibold text-stone-700 block">Phân loại theo loài nuôi:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {Object.entries(speciesCounts).map(([species, count]) => (
                <div
                  key={species}
                  className="p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between"
                >
                  <span className="text-stone-600 font-medium">{species}</span>
                  <span className="font-bold text-stone-900">{count} cá thể/đàn</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

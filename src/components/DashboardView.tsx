import React, { useState } from 'react';
import {
  PawPrint,
  HeartPulse,
  CalendarCheck,
  Package,
  Sparkles,
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  Plus,
  Thermometer,
  Droplets,
  ShieldCheck,
  Activity,
  Fan,
  ChevronRight,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { useToast } from '../context/ToastContext';
import { HealthBadge } from './ui/HealthBadge';
import { Skeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';

interface DashboardViewProps {
  onOpenAddAnimal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddAnimal }) => {
  const {
    user,
    animals,
    isLoadingAnimals,
    barns,
    tasks,
    inventory,
    toggleTaskCompleted,
    updateAnimal,
    setActiveTab,
    quickDiagnoseAnimal,
  } = useFarm();
  const { success } = useToast();

  const sickAnimals = animals.filter(
    (a) => a.status === 'sick' || a.status === 'isolated' || a.status === 'monitoring'
  );
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const lowStock = inventory.filter((i) => i.quantity <= i.minThreshold);
  const healthyCount = animals.filter((a) => a.status === 'healthy').length;
  const healthRate = Math.round((healthyCount / Math.max(1, animals.length)) * 100);

  // Group livestock by species
  const speciesCounts = animals.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const speciesList = Object.entries(speciesCounts).map(([species, count]) => ({
    species,
    count,
    percentage: Math.round((count / Math.max(1, animals.length)) * 100),
  }));

  const handleMarkRecovered = (animalId: string, animalName: string) => {
    updateAnimal(animalId, { status: 'healthy', notes: 'Đã hồi phục sau liệu trình chăm sóc' });
    success('Cập nhật trạng thái', `${animalName} đã được chuyển sang trạng thái Khỏe mạnh.`);
  };

  if (isLoadingAnimals && animals.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-28 w-full rounded-3xl" />
          <Skeleton className="h-28 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & AI Advisor Spotlight */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background ambient pattern */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-48 h-48 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-emerald-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            Hệ Thống Trực Tuyến 24/7 • Bác Sĩ Thú Y AI
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {user ? user.name : 'Chủ trang trại'}!
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Hôm nay trang trại ghi nhận <strong>{animals.length}</strong> vật nuôi đang theo dõi trong đàn.{' '}
            {sickAnimals.length > 0 ? (
              <span className="text-amber-300 font-bold">
                Có {sickAnimals.length} cá thể cần can thiệp y tế hoặc theo dõi biểu hiện bất thường.
              </span>
            ) : (
              <span>Toàn bộ đàn vật nuôi đang trong trạng thái sức khỏe ổn định!</span>
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('ai-advisor')}
              className="px-4 py-2.5 bg-white text-emerald-900 text-xs font-bold rounded-xl shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2 group active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-700 group-hover:rotate-12 transition-transform" />
              <span>Chẩn Đoán Bệnh Bằng AI</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {onOpenAddAnimal && (
              <button
                onClick={onOpenAddAnimal}
                className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-500/40 backdrop-blur-xs transition-colors flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Vật Nuôi Mới</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('animals')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-colors"
            >
              Danh sách đàn ({animals.length})
            </button>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl lg:w-84 text-xs space-y-2.5 shadow-inner">
          <div className="flex items-center gap-2 text-emerald-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Khuyến cáo dịch tễ hôm nay:</span>
          </div>
          <p className="text-emerald-50 text-[11px] leading-relaxed">
            "Thời tiết giao mùa có độ ẩm cao ({barns[0]?.humidity || 72}%), chú ý nguy cơ nhiễm khuẩn E.coli gây tiêu chảy ở heo con và hô hấp ở gà đẻ. Duy trì quạt thông gió và phun sát trùng chuồng định kỳ."
          </p>
          <button
            onClick={() => setActiveTab('ai-advisor')}
            className="text-[11px] text-amber-300 font-bold hover:underline flex items-center gap-1 pt-1"
          >
            Nhận phác đồ chi tiết từ AI →
          </button>
        </div>
      </div>

      {/* Quick Action Shortcuts Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenAddAnimal}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Thêm vật nuôi</p>
            <p className="text-[10px] text-slate-500">Mã thẻ, loài, chuồng</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('ai-advisor')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Chụp ảnh chẩn đoán</p>
            <p className="text-[10px] text-slate-500">AI phân tích triệu chứng</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Lịch tiêm phòng</p>
            <p className="text-[10px] text-slate-500">{pendingTasks.length} việc cần làm</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Kho dược & Cám</p>
            <p className="text-[10px] text-slate-500">{lowStock.length} mặt hàng cạn</p>
          </div>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Animals */}
        <div
          onClick={() => setActiveTab('animals')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs hover:border-emerald-400 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng đàn vật nuôi</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{animals.length}</span>
            <span className="text-xs font-semibold text-slate-500">cá thể trong đàn</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Tỷ lệ khỏe mạnh</span>
              <span className="font-bold text-emerald-700">{healthRate}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${healthRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sick / Monitoring */}
        <div
          onClick={() => setActiveTab('animals')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs hover:border-amber-400 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cần chăm sóc / Cách ly</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">{sickAnimals.length}</span>
            <span className="text-xs font-semibold text-slate-500">cá thể</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {sickAnimals.length > 0
              ? 'Có ca bệnh cần kiểm tra triệu chứng'
              : 'Đàn gia súc an toàn, không có ca bệnh'}
          </p>
        </div>

        {/* Tasks due */}
        <div
          onClick={() => setActiveTab('schedule')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs hover:border-blue-400 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Lịch trình chăm sóc</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{pendingTasks.length}</span>
            <span className="text-xs font-semibold text-slate-500">việc cần xử lý</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {pendingTasks[0] ? `Ưu tiên: ${pendingTasks[0].title}` : 'Đã hoàn thành hết công việc'}
          </p>
        </div>

        {/* Inventory low alerts */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs hover:border-rose-400 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cảnh báo kho dược</span>
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700">{lowStock.length}</span>
            <span className="text-xs font-semibold text-slate-500">mặt hàng cạn</span>
          </div>
          <p className="text-[11px] text-rose-700 font-medium">
            {lowStock.length > 0
              ? `Cần nhập thêm: ${lowStock[0]?.name.slice(0, 24)}...`
              : 'Dự trữ kho đảm bảo định mức'}
          </p>
        </div>
      </div>

      {/* Main Grid: Animals Needing Attention + Herd & Barn Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Animals Needing Attention (Quick Action) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-amber-600" />
                Vật Nuôi Đang Có Dấu Hiệu Bất Thường Cần Xử Lý Ngay
              </h3>
              <p className="text-xs text-slate-500">
                Các cá thể ghi nhận sốt, giảm ăn, hô hấp hoặc đang cách ly y tế
              </p>
            </div>
            <button
              onClick={() => setActiveTab('animals')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Xem tất cả ({animals.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sickAnimals.length > 0 ? (
            <div className="space-y-3">
              {sickAnimals.map((animal) => {
                const barn = barns.find((b) => b.id === animal.barnId);
                return (
                  <div
                    key={animal.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {animal.tagId}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{animal.name}</span>
                        <span className="text-slate-500">({animal.species} • {animal.breed})</span>
                        <HealthBadge status={animal.status} size="sm" />
                      </div>

                      <p className="text-slate-600 leading-snug">
                        <strong>Triệu chứng:</strong> {animal.notes || 'Cần kiểm tra thân nhiệt và phân'}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <span>Chuồng: <strong className="text-slate-700">{barn ? barn.name : 'Chưa phân chuồng'}</strong></span>
                        <span>Trọng lượng: <strong className="text-slate-700">{animal.weightKg} kg</strong></span>
                        {animal.lastCheckupDate && (
                          <span>Khám gần nhất: <strong className="text-slate-700">{animal.lastCheckupDate}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleMarkRecovered(animal.id, animal.name)}
                        className="px-3 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-xl border border-emerald-200 transition-colors text-[11px]"
                      >
                        Khỏi bệnh
                      </button>
                      <button
                        onClick={() => quickDiagnoseAnimal(animal)}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-all text-xs active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Chẩn Đoán AI
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm text-slate-800">Không có vật nuôi nào đang bị bệnh!</p>
              <p className="text-xs text-slate-500">
                Tất cả cá thể trong trang trại đều đang khỏe mạnh và đạt chỉ tiêu phát triển.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Herd Structure by Species & Climate */}
        <div className="space-y-6">
          {/* Species Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-emerald-600" />
                Cơ Cấu Đàn Vật Nuôi
              </span>
              <span className="text-xs font-semibold text-slate-400">{animals.length} con</span>
            </h3>

            <div className="space-y-3 text-xs">
              {speciesList.map((item, idx) => {
                const colors = [
                  'bg-emerald-500',
                  'bg-teal-500',
                  'bg-blue-500',
                  'bg-amber-500',
                  'bg-purple-500',
                ];
                const color = colors[idx % colors.length];

                return (
                  <div key={item.species} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{item.species}</span>
                      <span className="font-mono text-slate-500">
                        <strong>{item.count}</strong> con ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barns Environmental Glance */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-teal-600" />
                Giám Sát Chuồng Trại
              </h3>
              <button
                onClick={() => setActiveTab('barns')}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                Chi tiết →
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {barns.slice(0, 3).map((barn) => (
                <div
                  key={barn.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{barn.name}</p>
                    <p className="text-[10px] text-slate-500">
                      Sức chứa: {barn.currentCount}/{barn.capacity} con ({Math.round((barn.currentCount / barn.capacity) * 100)}%)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-700">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                      {barn.temperature}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      {barn.humidity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

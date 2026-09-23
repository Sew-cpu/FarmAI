import React from 'react';
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
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface DashboardViewProps {
  onOpenAddAnimal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = () => {
  const {
    user,
    animals,
    barns,
    tasks,
    inventory,
    toggleTaskCompleted,
    setActiveTab,
    quickDiagnoseAnimal,
  } = useFarm();

  const sickAnimals = animals.filter(
    (a) => a.status === 'sick' || a.status === 'isolated' || a.status === 'monitoring'
  );
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const lowStock = inventory.filter((i) => i.quantity <= i.minThreshold);
  const healthyCount = animals.filter((a) => a.status === 'healthy').length;
  const healthRate = Math.round((healthyCount / Math.max(1, animals.length)) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome & AI Advisor Spotlight */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-emerald-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            Hệ Thống Trực Tuyến 24/7
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Xin chào, {user ? user.name : 'Chủ trang trại'}!
          </h2>
          <p className="text-emerald-100 text-xs leading-relaxed">
            Hôm nay trang trại ghi nhận <strong>{animals.length}</strong> vật nuôi,{' '}
            {sickAnimals.length > 0 ? (
              <span className="text-amber-300 font-bold">
                có {sickAnimals.length} cá thể cần theo dõi hoặc điều trị y tế.
              </span>
            ) : (
              <span>toàn bộ đàn đang có sức khỏe ổn định.</span>
            )}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('ai-advisor')}
              className="px-4 py-2.5 bg-white text-emerald-900 text-xs font-bold rounded-xl shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-emerald-700 group-hover:rotate-12 transition-transform" />
              <span>Hỏi Bác Sĩ Thú Y AI Ngay</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('animals')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-colors"
            >
              Xem danh sách đàn ({animals.length})
            </button>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl md:w-80 text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Khuyến cáo dịch tễ hôm nay:
          </div>
          <p className="text-emerald-50 text-[11px] leading-relaxed">
            "Thời tiết chuyển mùa có độ ẩm cao ({barns[0]?.humidity || 72}%), chú ý nguy cơ nhiễm khuẩn E.coli gây tiêu chảy ở heo con và hô hấp ở gà đẻ. Hãy duy trì quạt thông gió và phun sát trùng chuồng định kỳ."
          </p>
          <button
            onClick={() => setActiveTab('ai-advisor')}
            className="text-[11px] text-amber-300 font-bold hover:underline flex items-center gap-1"
          >
            Nhận phác đồ chi tiết từ AI →
          </button>
        </div>
      </div>

      {/* Quick KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Animals */}
        <div
          onClick={() => setActiveTab('animals')}
          className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs hover:border-emerald-400 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Tổng đàn vật nuôi</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
              <PawPrint className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{animals.length}</span>
            <span className="text-xs font-semibold text-stone-500">cá thể/đàn</span>
          </div>
          <p className="text-[11px] text-stone-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{healthRate}%</span> tỷ lệ khỏe mạnh
          </p>
        </div>

        {/* Sick / Monitoring */}
        <div
          onClick={() => setActiveTab('animals')}
          className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Cần chăm sóc / Cách ly</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">{sickAnimals.length}</span>
            <span className="text-xs font-semibold text-stone-500">con</span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium">
            {sickAnimals.length > 0 ? 'Có ca bệnh cần tiêm & cách ly' : 'Không có ca bệnh nguy hiểm'}
          </p>
        </div>

        {/* Tasks due */}
        <div
          onClick={() => setActiveTab('schedule')}
          className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Lịch trình chăm sóc</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{pendingTasks.length}</span>
            <span className="text-xs font-semibold text-stone-500">việc cần làm</span>
          </div>
          <p className="text-[11px] text-stone-500">Gồm tiêm vắc xin, vệ sinh, khẩu phần</p>
        </div>

        {/* Inventory low alerts */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs hover:border-red-400 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Cảnh báo kho thức ăn</span>
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-700 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-700">{lowStock.length}</span>
            <span className="text-xs font-semibold text-stone-500">mặt hàng cạn</span>
          </div>
          <p className="text-[11px] text-red-700 font-medium">Cần bổ sung dự trữ cám & vắc xin</p>
        </div>
      </div>

      {/* Main Grid: Sick Animals Attention + Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Animals Needing Attention */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-amber-600" />
                Vật Nuôi Cần Chăm Sóc Sức Khỏe & Hội Chẩn
              </h3>
              <p className="text-xs text-stone-500">
                Các cá thể đang ốm, theo dõi lâm sàng hoặc đang cách ly
              </p>
            </div>
            <button
              onClick={() => setActiveTab('animals')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Xem tất cả ({animals.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sickAnimals.length > 0 ? (
            <div className="space-y-3">
              {sickAnimals.map((animal) => (
                <div
                  key={animal.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-white hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                        {animal.tagId}
                      </span>
                      <span className="font-bold text-stone-900 text-sm">{animal.name}</span>
                      <span className="text-stone-400">({animal.breed})</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          animal.status === 'sick'
                            ? 'bg-red-100 text-red-800'
                            : animal.status === 'isolated'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {animal.status === 'sick'
                          ? 'Đang điều trị'
                          : animal.status === 'isolated'
                          ? 'Cách ly'
                          : 'Đang theo dõi'}
                      </span>
                    </div>

                    <p className="text-stone-600 leading-snug">
                      {animal.notes || 'Cần theo dõi thân nhiệt và phân'}
                    </p>
                  </div>

                  <button
                    onClick={() => quickDiagnoseAnimal(animal)}
                    className="shrink-0 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Khám Bệnh Cùng AI
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold">Đàn gia súc gia cầm 100% khỏe mạnh!</p>
              <p className="text-stone-500">Không có con nào đang trong chế độ cách ly hoặc điều trị.</p>
            </div>
          )}
        </div>

        {/* Right: Urgent Schedule Tasks */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                Việc Cần Làm Hôm Nay
              </h3>
              <p className="text-[11px] text-stone-500">Đánh dấu tích để hoàn thành</p>
            </div>
            <button
              onClick={() => setActiveTab('schedule')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Xem lịch →
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.slice(0, 5).map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                    isDone ? 'bg-stone-50 opacity-60 border-stone-200' : 'bg-white border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <button
                    onClick={() => toggleTaskCompleted(task.id)}
                    className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center ${
                      isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-stone-900 truncate ${isDone ? 'line-through text-stone-400' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                      <span className="font-medium text-stone-600">{task.category}</span>
                      <span>•</span>
                      <span>Hạn: {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setActiveTab('ai-advisor')}
            className="w-full py-2.5 px-3 bg-stone-50 hover:bg-emerald-50 text-emerald-800 border border-dashed border-emerald-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Nhờ AI Tạo Thêm Lịch Trình Chăm Sóc
          </button>
        </div>
      </div>

      {/* Live Barns Climate Snapshot */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-emerald-600" />
              Môi Trường Chuồng Trại & Khí Hậu Trực Quan
            </h3>
            <p className="text-xs text-stone-500">Giám sát các khu chuồng và mật độ đàn</p>
          </div>
          <button
            onClick={() => setActiveTab('barns')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Quản lý chi tiết chuồng →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 text-xs">
          {barns.slice(0, 6).map((b) => (
            <div
              key={b.id}
              className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-colors space-y-2"
            >
              <span className="font-bold text-stone-900 truncate block text-[11px]">{b.name}</span>
              <div className="flex items-center justify-between text-[11px] text-stone-600">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" /> {b.temperature}°C
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" /> {b.humidity}%
                </span>
              </div>
              <div className="text-[10px] text-stone-500 flex justify-between">
                <span>Số lượng:</span>
                <strong className="text-stone-800">{b.currentCount}/{b.capacity}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

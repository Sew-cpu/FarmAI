import React from 'react';
import {
  LayoutDashboard,
  PawPrint,
  Bot,
  CalendarCheck,
  Warehouse,
  Package,
  FileHeart,
  BarChart3,
  Sparkles,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, animals, tasks, inventory } = useFarm();

  const sickCount = animals.filter((a) => a.status === 'sick' || a.status === 'isolated').length;
  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;
  const lowStockCount = inventory.filter((i) => i.quantity <= i.minThreshold).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan trang trại',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'animals',
      label: 'Quản lý đàn vật nuôi',
      icon: PawPrint,
      badge: sickCount > 0 ? `${sickCount} ốm` : `${animals.length} con`,
      badgeColor: sickCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600',
    },
    {
      id: 'ai-advisor',
      label: 'AgroVet AI Cố vấn',
      icon: Bot,
      highlight: true,
      badge: 'Trợ lý AI',
      badgeColor: 'bg-emerald-500 text-white font-bold',
    },
    {
      id: 'schedule',
      label: 'Lịch trình chăm sóc',
      icon: CalendarCheck,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'barns',
      label: 'Chuồng trại & Khí hậu',
      icon: Warehouse,
      badge: null,
    },
    {
      id: 'inventory',
      label: 'Kho thức ăn & Thuốc',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} cạn` : null,
      badgeColor: 'bg-red-100 text-red-800',
    },
    {
      id: 'health-logs',
      label: 'Hồ sơ bệnh án & Thú y',
      icon: FileHeart,
      badge: null,
    },
    {
      id: 'reports',
      label: 'Báo cáo & Thống kê',
      icon: BarChart3,
      badge: null,
    },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-stone-200 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with Close */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <PawPrint className="w-4 h-4" />
            </div>
            <span className="font-bold text-stone-900">FarmPro AI</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Menu chức năng
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20'
                      : 'bg-emerald-50 text-emerald-800 font-semibold'
                    : item.highlight
                    ? 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70 font-semibold border border-emerald-200/80'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? item.highlight
                          ? 'text-white'
                          : 'text-emerald-700'
                        : item.highlight
                        ? 'text-emerald-600'
                        : 'text-stone-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                      isActive && item.highlight ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* AI Quick Banner at bottom of sidebar */}
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/60 border border-emerald-200/80">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-emerald-950">AgroVet AI Thông Minh</h5>
              <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-snug">
                Chẩn đoán bệnh, lập lịch tiêm phòng và tư vấn dinh dưỡng 24/7.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSelectTab('ai-advisor')}
            className="mt-2.5 w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            Mở Trợ Lý Thú Y AI
          </button>
        </div>

        {/* Biosafety badge */}
        <div className="px-4 py-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            An toàn sinh học
          </span>
          <span className="font-semibold text-emerald-600">Đạt chuẩn VietGAP</span>
        </div>
      </aside>
    </>
  );
};

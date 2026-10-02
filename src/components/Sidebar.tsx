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
  ShieldCheck,
  Activity,
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

  const navSections = [
    {
      title: 'TỔNG QUAN & AI',
      items: [
        {
          id: 'dashboard',
          label: 'Tổng quan trang trại',
          icon: LayoutDashboard,
          badge: null,
          badgeColor: '',
          highlight: false,
        },
        {
          id: 'ai-advisor',
          label: 'Tư Vấn Thú Y (Bác Sĩ AI)',
          icon: Bot,
          badge: 'Trợ lý AI',
          badgeColor: 'bg-emerald-500 text-white font-bold',
          highlight: true,
        },
      ],
    },
    {
      title: 'QUẢN LÝ CHĂN NUÔI',
      items: [
        {
          id: 'animals',
          label: 'Quản lý đàn vật nuôi',
          icon: PawPrint,
          badge: sickCount > 0 ? `${sickCount} ốm` : `${animals.length} con`,
          badgeColor: sickCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600',
          highlight: false,
        },
        {
          id: 'schedule',
          label: 'Lịch trình chăm sóc',
          icon: CalendarCheck,
          badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
          badgeColor: 'bg-blue-100 text-blue-800',
          highlight: false,
        },
        {
          id: 'barns',
          label: 'Chuồng trại & Khí hậu',
          icon: Warehouse,
          badge: null,
          badgeColor: '',
          highlight: false,
        },
      ],
    },
    {
      title: 'KHO & BÁO CÁO',
      items: [
        {
          id: 'inventory',
          label: 'Kho thức ăn & Thuốc',
          icon: Package,
          badge: lowStockCount > 0 ? `${lowStockCount} cạn` : null,
          badgeColor: 'bg-red-100 text-red-800',
          highlight: false,
        },
        {
          id: 'health-logs',
          label: 'Hồ sơ bệnh án & Thú y',
          icon: FileHeart,
          badge: null,
          badgeColor: '',
          highlight: false,
        },
        {
          id: 'reports',
          label: 'Báo cáo & Thống kê',
          icon: BarChart3,
          badge: null,
          badgeColor: '',
          highlight: false,
        },
      ],
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

      {/* Redesigned Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-stone-200 flex flex-col transition-transform duration-300 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-20 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with Close */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 lg:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs">
              <PawPrint className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-900 text-sm">FarmPro AI</span>
              <span className="block text-[10px] text-stone-500">Quản Lý Trang Trại</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold text-stone-400 tracking-wider">
                {section.title}
              </div>

              {section.items.map((item) => {
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
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? item.highlight
                              ? 'text-white'
                              : 'text-emerald-700'
                            : item.highlight
                            ? 'text-emerald-600'
                            : 'text-stone-500'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full shrink-0 font-medium ${
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
          ))}
        </div>

        {/* Compact AI Quick Card */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-200/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-[11px] font-bold text-emerald-950 truncate">Bác Sĩ Thú Y AI</h5>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-700 font-medium">Sẵn sàng 24/7</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleSelectTab('ai-advisor')}
            className="mt-2 w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Hỏi Tư Vấn Ngay
          </button>
        </div>

        {/* Bottom Biosafety & Status Bar */}
        <div className="px-3.5 py-2.5 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between text-[11px] text-stone-500 shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            VietGAP
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
            <Activity className="w-2.5 h-2.5 text-emerald-600" />
            Vận hành tốt
          </span>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, animals, tasks, inventory } = useFarm();
  const [collapsed, setCollapsed] = useState(false);

  const sickCount = animals.filter(
    (a) => a.status === 'sick' || a.status === 'isolated' || a.status === 'monitoring'
  ).length;
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
          label: 'Phòng Khám & Bác Sĩ AI',
          icon: Bot,
          badge: 'AI Smart',
          badgeColor: 'bg-emerald-600 text-white font-extrabold',
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
          badge: sickCount > 0 ? `${sickCount} theo dõi` : `${animals.length} con`,
          badgeColor: sickCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700',
          highlight: false,
        },
        {
          id: 'schedule',
          label: 'Lịch trình chăm sóc',
          icon: CalendarCheck,
          badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
          badgeColor: 'bg-emerald-100 text-emerald-800',
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
          badgeColor: 'bg-rose-100 text-rose-800 font-bold',
          highlight: false,
        },
        {
          id: 'health-logs',
          label: 'Hồ sơ bệnh án số',
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container - Sticky on Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:self-start lg:z-20 shrink-0 ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <PawPrint className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-slate-900">FarmPro AI</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex items-center justify-end px-3 py-2 border-b border-slate-100/80">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                      isActive
                        ? item.highlight
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20'
                          : 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive
                          ? item.highlight
                            ? 'text-white'
                            : 'text-emerald-700'
                          : 'text-slate-500 group-hover:scale-110 group-hover:text-slate-800'
                      }`}
                    />

                    {!collapsed && (
                      <span className="flex-1 text-left truncate tracking-tight">{item.label}</span>
                    )}

                    {!collapsed && item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')
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

        {/* Bottom Biosafety Status Badge */}
        {!collapsed && (
          <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>An toàn sinh học</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              Trang trại duy trì quy trình kiểm soát dịch tễ chuẩn VietGAHP.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

import React from 'react';
import { LayoutDashboard, PawPrint, Stethoscope, Bot, PlusCircle } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface MobileBottomNavProps {
  onQuickAddAnimal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onQuickAddAnimal }) => {
  const { activeTab, setActiveTab, animals } = useFarm();

  const sickCount = animals.filter(
    (a) => a.status === 'sick' || a.status === 'isolated' || a.status === 'monitoring'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'animals',
      label: 'Đàn vật nuôi',
      icon: PawPrint,
      badge: sickCount > 0 ? sickCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'quick-action',
      label: 'Thêm mới',
      icon: PlusCircle,
      isCenterAction: true,
    },
    {
      id: 'ai-diagnose',
      label: 'Khám bệnh AI',
      icon: Stethoscope,
      badge: 'AI',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'ai-advisor',
      label: 'Trợ lý AI',
      icon: Bot,
      badge: null,
    },
  ];

  return (
    <nav
      aria-label="Điều hướng di động chuồng trại"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.isCenterAction) {
            return (
              <button
                key={item.id}
                onClick={onQuickAddAnimal}
                className="relative -top-3 flex flex-col items-center justify-center group focus:outline-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 group-active:scale-95 transition-transform">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold text-emerald-800 mt-0.5">Thêm nhanh</span>
              </button>
            );
          }

          const isActive =
            item.id === 'ai-diagnose'
              ? activeTab === 'ai-advisor'
              : activeTab === item.id;

          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'ai-diagnose') {
                  setActiveTab('ai-advisor');
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-xl py-1 transition-all ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-600' : ''}`} />
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                      item.badgeColor || 'bg-emerald-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 line-clamp-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

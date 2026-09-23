import React, { useState } from 'react';
import {
  PawPrint,
  HeartPulse,
  Sparkles,
  User,
  LogOut,
  Settings,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  toggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenProfile,
  toggleMobileSidebar,
}) => {
  const { user, logout, animals, tasks, setActiveTab } = useFarm();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Statistics for top bar
  const sickAnimals = animals.filter(
    (a) => a.status === 'sick' || a.status === 'isolated' || a.status === 'monitoring'
  );
  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <PawPrint className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-stone-900 tracking-tight">FarmPro</span>
                  <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    AI
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium truncate max-w-[180px] sm:max-w-xs">
                  {user ? user.farmName : 'Quản Lý Trang Trại Chăn Nuôi'}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Health & Task Badges */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setActiveTab('animals')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                sickAnimals.length > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <HeartPulse className={`w-3.5 h-3.5 ${sickAnimals.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
              <span>
                {sickAnimals.length > 0
                  ? `${sickAnimals.length} vật nuôi cần chăm sóc`
                  : 'Đàn vật nuôi 100% khỏe mạnh'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{pendingTasks.length} việc cần làm hôm nay</span>
            </button>
          </div>

          {/* Right: AI Quick Action + Notifications + User Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('ai-advisor')}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 transition-all hover:shadow"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Hỏi Bác Sĩ AI</span>
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Thông báo trang trại"
              >
                <Bell className="w-5 h-5" />
                {sickAnimals.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
                {sickAnimals.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                    <h4 className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      Cảnh báo trang trại
                    </h4>
                    <span className="text-xs text-stone-400">Thời gian thực</span>
                  </div>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
                    {sickAnimals.map((animal) => (
                      <div
                        key={animal.id}
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveTab('animals');
                        }}
                        className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100 transition-colors flex items-start gap-2.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{animal.name} ({animal.tagId})</p>
                          <p className="text-[11px] text-amber-800 line-clamp-1">
                            {animal.notes || 'Cần theo dõi sức khỏe'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {pendingTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveTab('schedule');
                        }}
                        className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-800 cursor-pointer hover:bg-stone-100 transition-colors flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-[11px] text-stone-500">Hạn: {task.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-stone-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-stone-500 leading-tight">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden xl:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900">{user.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenProfile();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-stone-500" />
                      Thông tin trang trại & Tài khoản
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuth();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      Chuyển đổi tài khoản demo
                    </button>

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

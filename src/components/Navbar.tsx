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
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { useToast } from '../context/ToastContext';

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
  const { user, logout, animals, tasks, setActiveTab, serverStatus, checkServerConnection } = useFarm();
  const { info } = useToast();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDbStatus, setShowDbStatus] = useState(false);
  const [isRefreshingDb, setIsRefreshingDb] = useState(false);

  // Statistics for top bar
  const sickAnimals = animals.filter(
    (a) => a.status === 'sick' || a.status === 'isolated' || a.status === 'monitoring'
  );
  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  const handleRefreshConnection = async () => {
    setIsRefreshingDb(true);
    await checkServerConnection();
    setIsRefreshingDb(false);
    info('Kiểm tra kết nối', 'Đã cập nhật trạng thái kết nối máy chủ & CSDL.');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <PawPrint className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">FarmPro</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1 border border-emerald-200/60">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    AI AgriTech
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[160px] sm:max-w-xs">
                  {user ? `${user.farmName} • ${user.farmLocation || 'Khu Chăn Nuôi'}` : 'Hệ Thống Quản Lý Trang Trại'}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Live Server/Database Indicator & Health Pill */}
          <div className="hidden md:flex items-center gap-3">
            {/* Server / DB Status Indicator Pill */}
            <div className="relative">
              <button
                onClick={() => setShowDbStatus(!showDbStatus)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  serverStatus.connected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : serverStatus.mode === 'in_memory_simulation'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
                title="Trạng thái kết nối Server & Cơ sở dữ liệu"
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      serverStatus.connected
                        ? 'bg-emerald-500'
                        : serverStatus.mode === 'in_memory_simulation'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      serverStatus.connected
                        ? 'bg-emerald-600'
                        : serverStatus.mode === 'in_memory_simulation'
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                    }`}
                  />
                </span>
                <span className="truncate max-w-[170px]">
                  {serverStatus.connected
                    ? 'MySQL Live Connected'
                    : serverStatus.mode === 'in_memory_simulation'
                    ? 'In-Memory Simulation'
                    : 'Server Offline'}
                </span>
                {serverStatus.latencyMs !== undefined && (
                  <span className="text-[10px] opacity-75 font-mono">{serverStatus.latencyMs}ms</span>
                )}
              </button>

              {/* Status Popover */}
              {showDbStatus && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-600" />
                      Trạng thái hạ tầng
                    </span>
                    <button
                      onClick={handleRefreshConnection}
                      disabled={isRefreshingDb}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="Kiểm tra lại kết nối"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDb ? 'animate-spin text-emerald-600' : ''}`} />
                    </button>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Máy chủ CSDL:</span>
                      <strong className="text-slate-900">{serverStatus.host}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tên Database:</span>
                      <strong className="text-slate-900">{serverStatus.database}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Chế độ:</span>
                      <span className="font-semibold text-emerald-700">{serverStatus.mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Độ trễ phản hồi:</span>
                      <span className="font-mono">{serverStatus.latencyMs ?? '--'} ms</span>
                    </div>
                    <p className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 leading-normal">
                      {serverStatus.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Health Status Pill */}
            <button
              onClick={() => setActiveTab('animals')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                sickAnimals.length > 0
                  ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200/80'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200/80'
              }`}
            >
              <HeartPulse
                className={`w-3.5 h-3.5 ${sickAnimals.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}
              />
              <span>
                {sickAnimals.length > 0
                  ? `${sickAnimals.length} cá thể cần theo dõi`
                  : 'Đàn 100% khỏe mạnh'}
              </span>
            </button>
          </div>

          {/* Right: AI Quick Action + Notifications + User Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('ai-advisor')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm hover:from-emerald-700 hover:to-teal-800 transition-all hover:shadow active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Hỏi Bác Sĩ Thú Y AI</span>
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Thông báo trang trại"
              >
                <Bell className="w-5 h-5" />
                {sickAnimals.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
                {sickAnimals.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      Cảnh báo trang trại
                    </h4>
                    <span className="text-[11px] text-slate-400">Thời gian thực</span>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
                    {sickAnimals.length === 0 && pendingTasks.length === 0 && (
                      <p className="text-center py-6 text-slate-400">Không có cảnh báo nào hôm nay.</p>
                    )}
                    {sickAnimals.map((animal) => (
                      <div
                        key={animal.id}
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveTab('animals');
                        }}
                        className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 cursor-pointer hover:bg-amber-100 transition-colors flex items-start gap-2.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{animal.name} ({animal.tagId})</p>
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
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-[11px] text-slate-500">Hạn: {task.dueDate}</p>
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
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenProfile();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      Thông tin trang trại & Tài khoản
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuth();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      Chuyển đổi tài khoản demo
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
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

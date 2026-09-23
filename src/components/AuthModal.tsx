import React, { useState } from 'react';
import { X, User, Lock, Mail, Building, MapPin, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { DEMO_USERS } from '../data/mockData';
import { UserProfile } from '../types/farm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useFarm();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [role, setRole] = useState<'Chủ trang trại' | 'Kỹ sư chăn nuôi' | 'Bác sĩ thú y'>('Chủ trang trại');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDemoSelect = (demoUser: UserProfile) => {
    login(demoUser);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email || !password) {
        setError('Vui lòng nhập đầy đủ email và mật khẩu');
        return;
      }

      // Check if matches demo user
      const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        login(matched);
      } else {
        // Create user from login
        login({
          id: `usr-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'Chủ trang trại',
          farmName: 'Trang Trại Gia Đình',
          farmLocation: 'Hà Nội, Việt Nam',
          farmAreaHectares: 2.0,
          phone: '0900 000 000',
        });
      }
      onClose();
    } else {
      // Register
      if (!name || !email || !password || !farmName) {
        setError('Vui lòng điền đủ các thông tin bắt buộc');
        return;
      }

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        name,
        role,
        farmName,
        farmLocation: farmLocation || 'Việt Nam',
        farmAreaHectares: 3.5,
        phone: phone || '0988 888 888',
      };

      login(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {mode === 'login' ? 'Đăng Nhập Quản Trị Trang Trại' : 'Đăng Ký Tài Khoản Mới'}
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Hệ thống điều hành và cố vấn thú y FarmPro AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Demo Accounts Selection */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Đăng nhập nhanh (1 chạm không cần gõ mật khẩu):
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_USERS.map((du) => (
                <button
                  key={du.id}
                  type="button"
                  onClick={() => handleDemoSelect(du)}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all text-xs group"
                >
                  <p className="font-semibold text-stone-900 group-hover:text-emerald-700 truncate">
                    {du.name}
                  </p>
                  <p className="text-[10px] text-stone-500">{du.role}</p>
                  <div className="mt-1 flex items-center text-[10px] font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Vào ngay <ArrowRight className="w-3 h-3 ml-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-stone-200"></div>
            <span className="shrink mx-3 text-stone-400 text-xs uppercase tracking-wider font-semibold">
              Hoặc nhập thông tin
            </span>
            <div className="grow border-t border-stone-200"></div>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Họ và tên *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Vai trò</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="Chủ trang trại">Chủ trang trại</option>
                      <option value="Bác sĩ thú y">Bác sĩ thú y</option>
                      <option value="Kỹ sư chăn nuôi">Kỹ sư chăn nuôi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Tên trang trại *</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="Trang trại Bình Minh"
                        className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Địa điểm</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={farmLocation}
                        onChange={(e) => setFarmLocation(e.target.value)}
                        placeholder="Đồng Nai, VN"
                        className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-medium text-stone-700 mb-1">Email đăng nhập *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@farmpro.vn"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Mật khẩu *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {mode === 'login' ? 'Đăng Nhập Hệ Thống' : 'Hoàn Tất Đăng Ký'}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="text-center text-xs text-stone-500 pt-1">
            {mode === 'login' ? (
              <p>
                Chưa có tài khoản trang trại?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-emerald-600 hover:underline"
                >
                  Đăng nhập lại
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

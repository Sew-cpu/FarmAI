import React from 'react';
import { AnimalStatus } from '../../types/farm';
import { HeartPulse, ShieldCheck, AlertTriangle, AlertCircle, Baby } from 'lucide-react';

interface HealthBadgeProps {
  status: AnimalStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  let label = 'Khỏe mạnh';
  let badgeStyles = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let IconComponent = ShieldCheck;

  switch (status) {
    case 'healthy':
      label = 'Khỏe mạnh';
      badgeStyles = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      IconComponent = ShieldCheck;
      break;
    case 'monitoring':
      label = 'Cần theo dõi';
      badgeStyles = 'bg-amber-100 text-amber-800 border-amber-200';
      IconComponent = AlertTriangle;
      break;
    case 'sick':
      label = 'Đang điều trị';
      badgeStyles = 'bg-rose-100 text-rose-800 border-rose-200';
      IconComponent = HeartPulse;
      break;
    case 'isolated':
      label = 'Cách ly y tế';
      badgeStyles = 'bg-rose-100 text-rose-800 border-rose-200';
      IconComponent = AlertCircle;
      break;
    case 'pregnant':
      label = 'Mang thai';
      badgeStyles = 'bg-purple-100 text-purple-800 border-purple-200';
      IconComponent = Baby;
      break;
    default:
      label = status;
      badgeStyles = 'bg-slate-100 text-slate-800 border-slate-200';
      IconComponent = ShieldCheck;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3 py-1.5 text-xs font-bold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs font-medium tracking-tight ${sizeClasses} ${badgeStyles}`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
};

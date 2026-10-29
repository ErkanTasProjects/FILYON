import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'emerald' | 'amber' | 'crimson' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  trend,
}) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/30',
      bgIcon: 'bg-cyan-500/15',
      textIcon: 'text-cyan-400',
      glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    },
    emerald: {
      border: 'border-emerald-500/30',
      bgIcon: 'bg-emerald-500/15',
      textIcon: 'text-emerald-400',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    },
    amber: {
      border: 'border-amber-500/30',
      bgIcon: 'bg-amber-500/15',
      textIcon: 'text-amber-400',
      glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    },
    crimson: {
      border: 'border-rose-500/40',
      bgIcon: 'bg-rose-500/20',
      textIcon: 'text-rose-400',
      glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]',
    },
    purple: {
      border: 'border-purple-500/30',
      bgIcon: 'bg-purple-500/15',
      textIcon: 'text-purple-400',
      glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    },
  };

  const style = colorMap[variant];

  return (
    <div
      className={`glass-panel p-5 rounded-2xl border ${style.border} transition-all duration-300 ${style.glow} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${style.bgIcon} ${style.textIcon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center text-xs">
          <span className="text-slate-400">{trend}</span>
        </div>
      )}
    </div>
  );
};

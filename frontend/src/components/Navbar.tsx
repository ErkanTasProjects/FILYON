import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Bell, ShieldCheck, Activity, Users, LogOut } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ onLogout }) => {
  const { user, role, switchRole } = useAuth();

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    ADMIN: { label: 'Sistem Yöneticisi', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    MANAGER: { label: 'Filo Müdürü', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    CHIEF: { label: 'Atölye Şefi', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    MECHANIC: { label: 'Baş Usta / Teknisyen', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    STOREKEEPER: { label: 'Ambar Sorumlusu', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    DRIVER: { label: 'Sürücü / Operatör', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-xl px-6 flex items-center justify-between">
      {/* Sol: Sistem Statüsü ve Canlı Ağ Göstergesi */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-emerald-400">FILYON Canlı Telemetri Aktif</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kurum: <strong className="text-slate-200">FILYON Makine İkmal</strong></span>
        </div>
      </div>

      {/* Sağ: Rol Değiştirici, Bildirimler ve Profil */}
      <div className="flex items-center gap-4">
        {/* Hızlı Rol Değiştirici (Simülasyon Kolaylığı) */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 hidden lg:inline">Aktif Rol:</span>
          <select
            value={role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-bold text-cyan-400 border-none focus:outline-none cursor-pointer"
          >
            <option value="ADMIN" className="bg-slate-900 text-white">Yönetici (Admin)</option>
            <option value="MANAGER" className="bg-slate-900 text-white">Filo Müdürü (Manager)</option>
            <option value="CHIEF" className="bg-slate-900 text-white">Atölye Şefi (Chief)</option>
            <option value="MECHANIC" className="bg-slate-900 text-white">Usta (Mechanic)</option>
            <option value="STOREKEEPER" className="bg-slate-900 text-white">Ambarcı (Storekeeper)</option>
            <option value="DRIVER" className="bg-slate-900 text-white">Şoför / Operatör (Driver)</option>
          </select>
        </div>

        {/* Rol Rozeti */}
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleLabels[role].color}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {roleLabels[role].label}
        </span>

        {/* Bildirim Çanı */}
        <button
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Bildirimler"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#090d16]" />
        </button>

        {/* Kullanıcı Profili ve Çıkış */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <p className="font-bold text-white leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-slate-400 text-[10px]">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            title="Oturumu Kapat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

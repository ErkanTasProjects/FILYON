import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Truck, ShieldCheck, Lock, Mail, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export const AuthPage: React.FC<Props> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('admin@filyon.gov.tr');
  const [password, setPassword] = useState('demo123');
  const [tenantCode, setTenantCode] = useState('FILYON-DEMO-2026');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, selectedRole);
    onSuccess();
  };

  const handleQuickDemo = (role: UserRole, demoEmail: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    login(demoEmail, role);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel w-full max-w-xl rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl relative z-10">
        {/* Banner */}
        <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-slate-950 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-3">
            <Truck className="w-6 h-6 text-slate-950 font-black" />
          </div>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            FILYON
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kapsamlı Filo & Makine İkmal Yönetim Bilgi Sistemi
          </p>

          {/* Login / Register Tab switcher */}
          <div className="flex items-center justify-center gap-2 mt-6 p-1 bg-slate-900 rounded-2xl border border-slate-800 max-w-xs mx-auto text-xs">
            <button
              onClick={() => setIsLoginTab(true)}
              className={`flex-1 py-2 rounded-xl font-bold transition ${
                isLoginTab
                  ? 'bg-cyan-500 text-slate-950 glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Giriş Yap (Login)
            </button>
            <button
              onClick={() => setIsLoginTab(false)}
              className={`flex-1 py-2 rounded-xl font-bold transition ${
                !isLoginTab
                  ? 'bg-cyan-500 text-slate-950 glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kayıt Ol (Register)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Kurum / Kiracı Kodu</label>
              <input
                type="text"
                required
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Kurumsal E-Posta</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {!isLoginTab && (
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Yetki Rolü</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ADMIN">Sistem Yöneticisi (Admin)</option>
                  <option value="MANAGER">Filo Müdürü (Manager)</option>
                  <option value="CHIEF">Atölye Şefi (Chief)</option>
                  <option value="MECHANIC">Mekanikçi / Usta (Mechanic)</option>
                  <option value="STOREKEEPER">Ambar Yetkilisi (Storekeeper)</option>
                  <option value="DRIVER">Sürücü / Operatör (Driver)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition glow-cyan flex items-center justify-center gap-2 text-xs"
            >
              {isLoginTab ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Sisteme Güvenli Giriş Yap
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Hesap Oluştur ve Giriş Yap
                </>
              )}
            </button>
          </form>

          {/* Hızlı Demo Girişi (Tüm Roller) */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Hızlı Rol Simülasyonu (Tek Tıkla Giriş)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN', 'admin@filyon.gov.tr')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-medium text-left transition"
              >
                <span className="block font-bold text-rose-400">Yönetici</span>
                Kemal Öztürk
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CHIEF', 'seffuat@filyon.gov.tr')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-medium text-left transition"
              >
                <span className="block font-bold text-amber-400">Atölye Şefi</span>
                Fuat Yılmaz
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('MECHANIC', 'usta.mehmet@filyon.gov.tr')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-medium text-left transition"
              >
                <span className="block font-bold text-purple-400">Baş Usta</span>
                Mehmet Demir
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('STOREKEEPER', 'ambar.ahmet@filyon.gov.tr')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-medium text-left transition"
              >
                <span className="block font-bold text-blue-400">Ambarcı</span>
                Ahmet Çelik
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('DRIVER', 'sofor.ali@filyon.gov.tr')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-medium text-left transition"
              >
                <span className="block font-bold text-emerald-400">Şoför</span>
                Ali Kaya
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('MANAGER', 'mudur@filyon.gov.tr')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-medium text-left transition"
              >
                <span className="block font-bold text-cyan-400">Filo Müdürü</span>
                Selim Aksoy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

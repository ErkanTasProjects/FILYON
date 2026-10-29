import React from 'react';
import { Vehicle } from '../types';
import { Calendar, Bell, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
}

export const CalendarPage: React.FC<Props> = ({ vehicles }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Yasal Süreler & Planlı Bakım Takvimi</h2>
          <p className="text-xs text-slate-400">
            Periyodik TÜVTÜRK muayeneleri, zorunlu trafik sigortası, kasko ve kilometre bakımları.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Bell className="w-4 h-4 animate-bounce" />
          Günlük Cron-job Hatırlatıcısı Aktif (08:00)
        </div>
      </div>

      {/* Timeline Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vehicles.map((v) => {
          const isExpired = v.isInspectionLocked || v.status === 'INSPECTION_EXPIRED';

          return (
            <div
              key={v.id}
              className={`glass-panel p-5 rounded-3xl border transition-all duration-300 ${
                isExpired ? 'border-rose-500/40 glow-crimson bg-rose-950/10' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-base font-bold text-white">{v.plateNumber}</span>
                  <p className="text-xs text-cyan-300 font-semibold">{v.brand} {v.model}</p>
                </div>
                {isExpired ? (
                  <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </span>
                ) : (
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                {/* Muayene */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>TÜVTÜRK Muayene:</span>
                    <span className={`font-mono font-bold ${isExpired ? 'text-rose-400' : 'text-slate-200'}`}>
                      {v.nextInspectionDate}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 font-semibold ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isExpired ? '⚠️ Süresi Geçti - Muayene Kilidi Devrede' : '✓ Yasal Süresi Geçerli'}
                  </p>
                </div>

                {/* Trafik Sigortası */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Zorunlu Trafik Sigortası:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {v.insuranceExpiryDate || 'Kayıt Yok'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Poliçe Yenileme Takipte</p>
                </div>

                {/* Son Bakım */}
                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span>Mevcut Sayaç:</span>
                  <span className="font-mono font-bold text-white">
                    {v.currentMeter.toLocaleString('tr-TR')} {v.meterType}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

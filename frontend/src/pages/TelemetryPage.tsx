import React, { useState } from 'react';
import { FuelTelemetry } from '../types';
import { Fuel, AlertTriangle, Gauge, Activity, Radio, MapPin, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Props {
  telemetries: FuelTelemetry[];
}

export const TelemetryPage: React.FC<Props> = ({ telemetries }) => {
  const [selectedTelemetry, setSelectedTelemetry] = useState<FuelTelemetry>(telemetries[0]);

  const fuelTheftAlerts = telemetries.filter((t) => t.isFuelTheftSuspected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            Canlı Telemetri, CAN-Bus & Akaryakıt İzleme
          </h2>
          <p className="text-xs text-slate-400">
            IoT telemetri sensörleri, depo şamandırası, ani mazot düşüşü (hırsızlık) tespiti ve rölanti analizi.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          CAN-Bus Veri Akışı: 100 Hz
        </div>
      </div>

      {/* Şüpheli Yakıt Düşüşü (Mazot Hırsızlığı) Alarm Bannerı */}
      {fuelTheftAlerts.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/60 via-rose-900/40 to-slate-900 border border-rose-500/50 glow-crimson space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  🚨 ŞÜPHELİ ANİ YAKIT DÜŞÜŞÜ ALARMI (MAZOT HIRSIZLIĞI ŞÜPHESİ)
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {fuelTheftAlerts.length} ARAÇ ETKİLENDİ
                  </span>
                </h3>
                <p className="text-xs text-rose-300">
                  Sensör verisi: Motor kapalıyken depodan kısa sürede anormal seviyede yakıt tahliyesi saptandı.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-rose-500/20 space-y-2">
            {fuelTheftAlerts.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-white text-sm">{item.vehiclePlate}</span>
                  <span className="text-slate-400 ml-2">({item.vehicleModel})</span>
                  <p className="text-rose-400 font-semibold mt-0.5">{item.theftAnomalyDetails}</p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {item.gpsLocation.locationName}
                  </span>
                  <button
                    onClick={() => window.alert(`Güvenlik ve Atölye Şefliğine ${item.vehiclePlate} için resmi hırsızlık tutanağı iletildi.`)}
                    className="px-3 py-1.5 rounded-xl font-bold bg-rose-500 hover:bg-rose-400 text-white text-[11px] transition glow-crimson"
                  >
                    Resmi Tutanak Aç
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}

      {/* Ana Telemetri Görünümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Liste: Araç Telemetri Kartları */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Canlı Telemetri Cihazları ({telemetries.length})
          </h3>
          {telemetries.map((item) => {
            const isSelected = selectedTelemetry.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedTelemetry(item)}
                className={`p-4 rounded-2xl cursor-pointer transition border ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 glow-cyan'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">{item.vehiclePlate}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isFuelTheftSuspected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.isFuelTheftSuspected ? 'ŞÜPHELİ YAKIT' : 'CAN-BUS AKTİF'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.vehicleModel}</p>

                {/* Yakıt Çubuğu */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Depo: {item.currentFuelLiters} / {item.tankCapacityLiters} L</span>
                    <span className="font-bold text-cyan-400 font-mono">%{item.fuelPercentage}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.fuelPercentage < 30 ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${item.fuelPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sağ Panel: Seçili Araç Canlı Göstergeleri (CAN-Bus Gauge Ekranı) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xl font-black text-white">{selectedTelemetry.vehiclePlate}</span>
                <span className="text-xs text-cyan-300 font-semibold">{selectedTelemetry.vehicleModel}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Mevcut Konum: <strong className="text-slate-200">{selectedTelemetry.gpsLocation.locationName}</strong>
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
              {selectedTelemetry.lastTelemetryPing}
            </span>
          </div>

          {/* Göstergeler Izgarası */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Hız */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <Gauge className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Anlık Hız</p>
              <p className="text-2xl font-black font-mono text-white mt-1">
                {selectedTelemetry.speedKmH} <span className="text-xs font-normal text-slate-400">km/h</span>
              </p>
            </div>

            {/* Devir */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Motor Devri</p>
              <p className="text-2xl font-black font-mono text-white mt-1">
                {selectedTelemetry.engineRpm} <span className="text-xs font-normal text-slate-400">RPM</span>
              </p>
            </div>

            {/* Hararet */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <Activity className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Hararet</p>
              <p className="text-2xl font-black font-mono text-white mt-1">
                {selectedTelemetry.engineTemperatureC}°C
              </p>
            </div>

            {/* Rölanti Süresi */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <Fuel className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Gereksiz Rölanti</p>
              <p className={`text-2xl font-black font-mono mt-1 ${
                selectedTelemetry.idleHours > 5 ? 'text-amber-400' : 'text-white'
              }`}>
                {selectedTelemetry.idleHours} <span className="text-xs font-normal text-slate-400">Saat</span>
              </p>
            </div>
          </div>

          {/* Yakıt Detay Kartı */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-cyan-400" />
                Akaryakıt Depo ve Sarfiyat Analizi
              </h4>
              <span className="text-xs font-mono font-bold text-cyan-400">
                Ortalama: {selectedTelemetry.averageConsumptionPer100Km} L / 100km
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400">Kalan Mazot:</span>
                <p className="text-base font-bold font-mono text-white mt-0.5">
                  {selectedTelemetry.currentFuelLiters} Litre
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400">Depo Hacmi:</span>
                <p className="text-base font-bold font-mono text-white mt-0.5">
                  {selectedTelemetry.tankCapacityLiters} Litre
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400">Depo Doluluk:</span>
                <p className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                  %{selectedTelemetry.fuelPercentage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

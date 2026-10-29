import React from 'react';
import { Vehicle, WorkOrder, SparePart } from '../types';
import { StatCard } from '../components/StatCard';
import { Truck, ShieldAlert, Wrench, AlertTriangle, Boxes, CheckCircle2, QrCode } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface Props {
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  spareParts: SparePart[];
  onOpenQr: (vehicle: Vehicle) => void;
  onOpenWorkOrderScrap: (wo: WorkOrder) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<Props> = ({
  vehicles,
  workOrders,
  spareParts,
  onOpenQr,
  onOpenWorkOrderScrap,
  onNavigateTab,
}) => {
  const expiredVehicles = vehicles.filter((v) => v.isInspectionLocked || v.status === 'INSPECTION_EXPIRED');
  const activeZimmets = vehicles.filter((v) => v.status === 'ASSIGNED');
  const inMaintenance = vehicles.filter((v) => v.status === 'UNDER_MAINTENANCE');
  const scrapWaitingOrders = workOrders.filter((w) => w.status === 'WAITING_SCRAP_CONFIRMATION');
  const criticalParts = spareParts.filter((p) => p.isCriticalStock || p.stockQuantity <= p.minStockLevel);

  // Recharts Chart Data
  const fleetDistributionData = [
    { name: 'Görevde', count: activeZimmets.length, color: '#06b6d4' },
    { name: 'Boşta / Hazır', count: vehicles.filter((v) => v.status === 'AVAILABLE').length, color: '#10b981' },
    { name: 'Atölyede', count: inMaintenance.length, color: '#f59e0b' },
    { name: 'Muayene Kilitli', count: expiredVehicles.length, color: '#ef4444' },
  ];

  const maintenanceCostData = [
    { ay: 'Mayıs', parca: 42000, iscilik: 18000 },
    { ay: 'Haziran', parca: 58000, iscilik: 24000 },
    { ay: 'Temmuz', parca: 39000, iscilik: 16000 },
    { ay: 'Ağustos', parca: 71000, iscilik: 29000 },
    { ay: 'Eylül', parca: 64000, iscilik: 27000 },
    { ay: 'Ekim', parca: 82500, iscilik: 34000 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Visual Banner (image_0.png Reference) */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 glass-panel shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-[#090d16]/70 to-transparent z-10" />
        <img
          src="/src/assets/image_0.png"
          alt="FILYON Komuta Merkezi"
          className="w-full h-56 lg:h-64 object-cover object-center filter brightness-90"
          onError={(e) => {
            // Fallback if local asset is loading
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 z-20 p-6 lg:p-8 flex flex-col justify-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold w-fit mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Sıradaki Nesil Filo & Makine İkmal Yönetimi
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Canlı Operasyon & Sayıştay Denetim Paneli
          </h2>
          <p className="text-xs lg:text-sm text-slate-300 mt-2 leading-relaxed">
            Araç zimmetleri QR kod ile kabin içinde doğrulanır, muayenesi geçen araçlar anında kilitlenir,
            parça değişimlerinde Sayıştay hurda kilidi otomatik devreye girer.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => onNavigateTab('zimmet')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition glow-cyan flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Kabin QR Okut & Zimmetle
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Sayıştay Raporu Çıkar
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Filo & Makine"
          value={vehicles.length}
          subtitle={`${activeZimmets.length} araç sahada aktif görevde`}
          icon={Truck}
          variant="cyan"
          trend="Filo Kullanım Oranı: %75"
        />
        <StatCard
          title="Muayene Kilidi Devrede"
          value={expiredVehicles.length}
          subtitle="Yasal süresi dolan, sefere çıkamaz"
          icon={ShieldAlert}
          variant="crimson"
          trend="🚨 Yasal Risk: Acil Muayene Gerekli"
        />
        <StatCard
          title="Sayıştay Hurda Kilidi"
          value={scrapWaitingOrders.length}
          subtitle="Hurda fotoğrafı / Ambar onayı bekleyen"
          icon={Wrench}
          variant="amber"
          trend="🔒 Sayıştay Denetim Şartı"
        />
        <StatCard
          title="Kritik Ambar Stoğu"
          value={criticalParts.length}
          subtitle="Asgari stok altına inen parçalar"
          icon={Boxes}
          variant="purple"
          trend="İkmal Talep Emri Oluşturuldu"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aylık Maliyet Grafiği */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Bakım & Yedek Parça Harcama Eğrisi</h3>
              <p className="text-xs text-slate-400">Son 6 aylık parça ve işçilik harcama kırılımı (TL)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Parça
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> İşçilik
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceCostData}>
                <XAxis dataKey="ay" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="parca" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Parça Maliyeti (₺)" />
                <Bar dataKey="iscilik" fill="#10b981" radius={[6, 6, 0, 0]} name="İşçilik Maliyeti (₺)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filo Statü Dağılımı */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Filo Durum Dağılımı</h3>
            <p className="text-xs text-slate-400">Anlık araç ve makine kullanılabilirlik oranı</p>
          </div>
          <div className="h-44 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {fleetDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            {fleetDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold text-white">{item.count} Araç</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kritik Bildirimler & Sayıştay Hurda Kilidi Bekleyenler Tablosu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hurda Kilidi Tablosu */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sayıştay Hurda Kilidinde Bekleyen İş Emirleri</h3>
                <p className="text-xs text-slate-400">Hurda fotoğrafı veya ambar onayı eksik</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('work-orders')}
              className="text-xs font-semibold text-cyan-400 hover:underline"
            >
              Tümünü Gör
            </button>
          </div>

          <div className="space-y-3">
            {scrapWaitingOrders.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Şu anda hurda onayı bekleyen iş emri bulunmuyor.
              </div>
            ) : (
              scrapWaitingOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{wo.workOrderNumber}</span>
                      <span className="text-xs font-bold text-cyan-400">{wo.vehiclePlate}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-1">{wo.title}</p>
                    <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Usta fotoğrafı yükledi, Ambarcı onayı bekleniyor
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenWorkOrderScrap(wo)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition glow-amber"
                  >
                    Hurdayı İncele & Onayla
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Muayene Kilidi & Yasal Uyarılar */}
        <div className="glass-panel p-6 rounded-3xl border border-rose-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Yasal Muayene & Trafik İkazları</h3>
                <p className="text-xs text-slate-400">Muayene kilidi aktif ve yaklaşan araçlar</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs font-semibold text-cyan-400 hover:underline"
            >
              Takvimi Aç
            </button>
          </div>

          <div className="space-y-3">
            {expiredVehicles.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{v.plateNumber}</span>
                    <span className="text-xs text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded-full">
                      MUAYENE KİLİDİ AKTİF
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{v.brand} {v.model} • {v.assignedDepartment}</p>
                  <p className="text-[11px] text-rose-300 mt-1 font-mono">
                    Muayene Bitiş: {v.nextInspectionDate} (Süresi Doldu)
                  </p>
                </div>
                <button
                  onClick={() => onOpenQr(v)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  title="Kabin QR Kodu"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

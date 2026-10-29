import React, { useState } from 'react';
import { WorkOrder, SparePart, Vehicle } from '../types';
import { Wrench, Plus, Lock, CheckCircle2, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  workOrders: WorkOrder[];
  spareParts: SparePart[];
  vehicles: Vehicle[];
  onOpenScrapModal: (wo: WorkOrder) => void;
  onCreateWorkOrder: (newWo: Partial<WorkOrder>) => void;
}

export const WorkOrdersPage: React.FC<Props> = ({
  workOrders,
  spareParts,
  vehicles,
  onOpenScrapModal,
  onCreateWorkOrder,
}) => {
  const { role } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New work order form
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mechanicName, setMechanicName] = useState('Mehmet Demir (Baş Usta)');
  const [selectedPartId, setSelectedPartId] = useState(spareParts[0]?.id || '');
  const [partQty, setPartQty] = useState('1');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === vehicleId);
    const part = spareParts.find((p) => p.id === selectedPartId);
    if (!veh || !title) return;

    const qty = parseInt(partQty, 10) || 1;
    const partTotal = (part ? part.unitPrice * qty : 0);

    const newWo: Partial<WorkOrder> = {
      id: `wo-${Date.now()}`,
      workOrderNumber: `WO-2026-${String(workOrders.length + 1).padStart(5, '0')}`,
      vehicleId: veh.id,
      vehiclePlate: veh.plateNumber,
      vehicleBrandModel: `${veh.brand} ${veh.model}`,
      chiefName: 'Fuat Yılmaz (Atölye Şefi)',
      assignedMechanicName: mechanicName,
      title,
      description,
      priority: 'HIGH',
      status: part ? 'WAITING_SCRAP_CONFIRMATION' : 'ASSIGNED',
      startedAt: new Date().toLocaleString('tr-TR'),
      laborHours: 2.5,
      laborHourlyRate: 600,
      laborCost: 1500,
      partsCost: partTotal,
      totalCost: 1500 + partTotal,
      usedParts: part
        ? [
            {
              sparePartId: part.id,
              name: part.name,
              quantity: qty,
              unitPrice: part.unitPrice,
              totalPrice: partTotal,
            },
          ]
        : [],
      scrapRecords: part
        ? [
            {
              id: `scrap-${Date.now()}`,
              workOrderId: `wo-${Date.now()}`,
              sparePartId: part.id,
              sparePartName: part.name,
              oemCode: part.oemCode,
              scrapPhotoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
              status: 'PENDING_WAREHOUSE_APPROVAL',
              warehouseNotes: 'Yeni parça takıldı. Sökülen hurda parça için ambar teslim onayı bekleniyor.',
              createdAt: new Date().toLocaleString('tr-TR'),
            },
          ]
        : [],
    };

    onCreateWorkOrder(newWo);
    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Atölye İş Emirleri & Sayıştay Hurda Kilidi</h2>
          <p className="text-xs text-slate-400">
            Parça kullanılan iş emirlerinde çıkan hurda parçanın fotoğrafı ve ambar onayı olmadan iş emri kapatılamaz.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition glow-cyan flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yeni İş Emri Aç (Atölye Şefi)
        </button>
      </div>

      {/* Sayıştay Kuralı İkaz Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-amber-300">
              Sayıştay ve İç Denetim Standartları (5018 Sayılı Kanun Uyumu):
            </p>
            <p className="text-slate-300 mt-0.5">
              Harcama yetkilisi ve atölye şefleri, hurda teslimatı onaylanmamış hiçbir onarımı tamamlanmış sayamaz.
            </p>
          </div>
        </div>
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          <ShieldCheck className="w-3.5 h-3.5" />
          Kural Motoru Devrede
        </span>
      </div>

      {/* İş Emirleri Listesi */}
      <div className="space-y-4">
        {workOrders.map((wo) => {
          const hasScrapPending = wo.status === 'WAITING_SCRAP_CONFIRMATION';
          const isCompleted = wo.status === 'COMPLETED';

          return (
            <div
              key={wo.id}
              className={`glass-panel p-6 rounded-3xl border transition-all duration-300 ${
                hasScrapPending ? 'border-amber-500/40 glow-amber' : isCompleted ? 'border-emerald-500/30' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Sol: Başlık ve Araç */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                      {wo.workOrderNumber}
                    </span>
                    <span className="font-mono text-base font-extrabold text-white">
                      {wo.vehiclePlate}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">({wo.vehicleBrandModel})</span>

                    {/* Statü Rozeti */}
                    {hasScrapPending && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        <Lock className="w-3 h-3" />
                        HURDA KİLİDİ DEVREDE
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" />
                        TAMAMLANDI & KAPATILDI
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1">{wo.title}</h4>
                  <p className="text-xs text-slate-300 max-w-3xl">{wo.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      Atölye Şefi: <strong className="text-slate-200">{wo.chiefName}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      Görevli Usta: <strong className="text-slate-200">{wo.assignedMechanicName}</strong>
                    </span>
                    <span>•</span>
                    <span>Başlangıç: {wo.startedAt}</span>
                  </div>
                </div>

                {/* Sağ: Maliyet & Kapatma Butonu */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-slate-400">Toplam Bakım Maliyeti</p>
                    <p className="text-lg font-mono font-bold text-white">
                      {wo.totalCost.toLocaleString('tr-TR')} ₺
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Parça: {wo.partsCost.toLocaleString('tr-TR')} ₺ • İşçilik: {wo.laborCost.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenScrapModal(wo)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      hasScrapPending
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 glow-amber'
                        : isCompleted
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {hasScrapPending ? 'Hurda Kilidi & Onay' : isCompleted ? 'Detay & Sayıştay Fişi' : 'İşlemleri Yönet'}
                  </button>
                </div>
              </div>

              {/* Kullanılan Parçalar ve Hurda Önizleme Barı */}
              {wo.usedParts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-slate-400">Kullanılan Parçalar:</span>
                  {wo.usedParts.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 text-[11px]"
                    >
                      {p.name} ({p.quantity} Adet)
                    </span>
                  ))}

                  {wo.scrapRecords.map((s, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
                        s.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {s.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      Hurda: {s.status === 'APPROVED' ? 'Ambar Onayladı' : 'Onay Bekliyor'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Yeni İş Emri Açma Modalı */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-cyan-500/30 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-cyan-400" />
              Atölye İş Emri Aç
            </h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Bakıma Alınacak Araç</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} — {v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">İş Emri Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ön Fren Balata Takımı ve Yağ Değişimi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Arıza & Yapılacak İş Detayı</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detaylı arıza tespiti ve işlem açıklaması..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Atanan Usta</label>
                  <input
                    type="text"
                    value={mechanicName}
                    onChange={(e) => setMechanicName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Ambardan Talep Edilen Parça</label>
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {spareParts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unitPrice.toLocaleString('tr-TR')} ₺)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                ℹ️ Seçilen parça kullanıldığında Sayıştay Hurda Kilidi devreye girecek, eski parçanın fotoğrafı ve ambar onayı zorunlu kılınacaktır.
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan"
                >
                  İş Emrini Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

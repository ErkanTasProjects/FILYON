import React, { useState } from 'react';
import { Vehicle } from '../types';
import { MuayeneKilidiBadge } from '../components/MuayeneKilidiBadge';
import { Truck, QrCode, Search, Plus, Calendar, Gauge, ShieldAlert } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  onOpenQr: (vehicle: Vehicle) => void;
  onAddVehicle: (newVeh: Partial<Vehicle>) => void;
}

export const VehiclesPage: React.FC<Props> = ({ vehicles, onOpenQr, onAddVehicle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New vehicle form state
  const [newPlate, setNewPlate] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('2023');
  const [newCategory, setNewCategory] = useState('Ağır Vasıta');
  const [newMeterType, setNewMeterType] = useState<'KM' | 'WORKING_HOUR'>('KM');
  const [newMeter, setNewMeter] = useState('0');
  const [newInspectionDate, setNewInspectionDate] = useState('2027-01-01');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.assignedDepartment || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterCategory === 'ALL') return matchesSearch;
    if (filterCategory === 'LOCKED') return matchesSearch && (v.isInspectionLocked || v.status === 'INSPECTION_EXPIRED');
    if (filterCategory === 'ASSIGNED') return matchesSearch && v.status === 'ASSIGNED';
    if (filterCategory === 'AVAILABLE') return matchesSearch && v.status === 'AVAILABLE';
    return matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newBrand || !newModel) return;

    onAddVehicle({
      id: `veh-${Date.now()}`,
      plateNumber: newPlate.toUpperCase(),
      brand: newBrand,
      model: newModel,
      year: parseInt(newYear, 10),
      category: newCategory,
      meterType: newMeterType,
      currentMeter: parseFloat(newMeter),
      status: 'AVAILABLE',
      nextInspectionDate: newInspectionDate,
      qrCodeToken: `qr-filyon-${newPlate.toLowerCase().replace(/\s+/g, '-')}`,
      assignedDepartment: 'Genel Makine İkmal',
    });

    setIsAddModalOpen(false);
    setNewPlate('');
    setNewBrand('');
    setNewModel('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Araç & İş Makinesi Envanteri</h2>
          <p className="text-xs text-slate-400">
            Kabin QR entegrasyonu, sayaç takibi (KM/Çalışma Saati) ve yasal muayene kilit yönetimi.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition glow-cyan flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Yeni Araç / Makine Tanımla
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Plaka, marka, model veya birim ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterCategory === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            Tüm Filo ({vehicles.length})
          </button>
          <button
            onClick={() => setFilterCategory('AVAILABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterCategory === 'AVAILABLE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            Boşta / Hazır
          </button>
          <button
            onClick={() => setFilterCategory('ASSIGNED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterCategory === 'ASSIGNED'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            Görevde (Zimmetli)
          </button>
          <button
            onClick={() => setFilterCategory('LOCKED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              filterCategory === 'LOCKED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Muayene Kilitli
          </button>
        </div>
      </div>

      {/* Vehicle Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map((vehicle) => {
          const isLocked = vehicle.isInspectionLocked || vehicle.status === 'INSPECTION_EXPIRED';

          return (
            <div
              key={vehicle.id}
              className={`glass-panel p-5 rounded-3xl border transition-all duration-300 ${
                isLocked ? 'border-rose-500/40 glow-crimson bg-rose-950/10' : 'border-slate-800 glass-panel-hover'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-white tracking-wider">
                      {vehicle.plateNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {vehicle.year}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-cyan-300 mt-1">
                    {vehicle.brand} {vehicle.model}
                  </h4>
                </div>
                <button
                  onClick={() => onOpenQr(vehicle)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 transition"
                  title="Kabin QR Kodunu Görüntüle"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-3">
                <MuayeneKilidiBadge status={vehicle.status} isLocked={isLocked} />
              </div>

              {/* Vehicle Specs */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    Sayaç Durumu:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {vehicle.currentMeter.toLocaleString('tr-TR')} {vehicle.meterType === 'KM' ? 'KM' : 'Çalışma Saati'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Muayene Bitiş:
                  </span>
                  <span className={`font-mono font-semibold ${isLocked ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                    {vehicle.nextInspectionDate || 'Kayıt Yok'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Atanan Birim:</span>
                  <span className="text-slate-300 text-right truncate max-w-[150px]">
                    {vehicle.assignedDepartment}
                  </span>
                </div>

                {vehicle.activeDriverName && (
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-medium flex items-center justify-between">
                    <span>Zimmetli Sürücü:</span>
                    <span className="font-bold">{vehicle.activeDriverName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Yeni Araç Ekleme Modalı */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-cyan-500/30 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-400" />
              Yeni Araç veya İş Makinesi Tanımla
            </h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Plaka / Araç Kodu</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 06 FLN 505"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Model Yılı</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Marka</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Mercedes-Benz"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Actros 1845"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Sayaç Türü</label>
                  <select
                    value={newMeterType}
                    onChange={(e) => setNewMeterType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="KM">Kilometre (KM)</option>
                    <option value="WORKING_HOUR">Çalışma Saati (İş Makinesi)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Mevcut Sayaç Değeri</label>
                  <input
                    type="number"
                    value={newMeter}
                    onChange={(e) => setNewMeter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Sonraki Zorunlu Muayene Tarihi</label>
                <input
                  type="date"
                  value={newInspectionDate}
                  onChange={(e) => setNewInspectionDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

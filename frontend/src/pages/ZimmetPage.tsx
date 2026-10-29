import React, { useState } from 'react';
import { Vehicle, ZimmetRecord } from '../types';
import { QrCode, ShieldAlert, CheckCircle2, UserCheck, ArrowRight, Ban, Clock } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  zimmets: ZimmetRecord[];
  onAssignZimmet: (newZimmet: ZimmetRecord) => void;
  onReturnZimmet: (zimmetId: string, returnMeter: number) => void;
}

export const ZimmetPage: React.FC<Props> = ({
  vehicles,
  zimmets,
  onAssignZimmet,
  onReturnZimmet,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [driverName, setDriverName] = useState('Ali Kaya');
  const [driverPhone, setDriverPhone] = useState('+90 532 100 0006');
  const [checkoutNotes, setCheckoutNotes] = useState('Kabin içi QR okutularak teslim alındı.');
  
  // Alert states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Return modal state
  const [returningZimmet, setReturningZimmet] = useState<ZimmetRecord | null>(null);
  const [returnMeterInput, setReturnMeterInput] = useState('');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const handleAttemptCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedVehicle) return;

    // 🚨 PROFESYONEL İŞ KURALI TESTİ: MUAYENE KİLİDİ
    // Yasal süresi geçen araç "Göreve Uygun Değil" statüsündedir ve ZİMMETLENEMEZ!
    if (selectedVehicle.isInspectionLocked || selectedVehicle.status === 'INSPECTION_EXPIRED') {
      setErrorMessage(
        `🚨 MUAYENE KİLİDİ DEVREDE! ${selectedVehicle.plateNumber} plakalı aracın zorunlu muayene tarihi ` +
        `(${selectedVehicle.nextInspectionDate}) dolmuştur. Yasal olarak göreve çıkamaz ve sürücüye zimmetlenemez!`
      );
      return;
    }

    if (selectedVehicle.status === 'ASSIGNED') {
      setErrorMessage('Bu araç şu anda başka bir sürücüde zimmetlidir. Önce mevcut zimmet sonlandırılmalıdır.');
      return;
    }

    if (selectedVehicle.status === 'UNDER_MAINTENANCE') {
      setErrorMessage('Bu araç atölyede bakımda olduğu için sefere çıkartılamaz.');
      return;
    }

    // Başarılı Zimmet Oluştur
    const newZimmet: ZimmetRecord = {
      id: `zim-${Date.now()}`,
      vehicleId: selectedVehicle.id,
      vehiclePlate: selectedVehicle.plateNumber,
      vehicleModel: `${selectedVehicle.brand} ${selectedVehicle.model}`,
      driverId: `usr-${Date.now()}`,
      driverName,
      driverPhone,
      assignedAt: new Date().toLocaleString('tr-TR'),
      startingMeter: selectedVehicle.currentMeter,
      qrScanVerified: true,
      status: 'ACTIVE',
      checkoutNotes,
    };

    onAssignZimmet(newZimmet);
    setSuccessMessage(
      `✅ ZİMMET ONAYLANDI! ${selectedVehicle.plateNumber} aracı ${driverName} adına ${selectedVehicle.currentMeter} ${selectedVehicle.meterType} ile teslim edildi.`
    );
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningZimmet) return;

    const meterVal = parseFloat(returnMeterInput);
    if (isNaN(meterVal) || meterVal < returningZimmet.startingMeter) {
      alert(`Dönüş sayacı, çıkış sayacından (${returningZimmet.startingMeter}) küçük olamaz!`);
      return;
    }

    onReturnZimmet(returningZimmet.id, meterVal);
    setReturningZimmet(null);
    setReturnMeterInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">Sürücü Zimmet & Kabin QR Entegrasyonu</h2>
        <p className="text-xs text-slate-400">
          Sürücü araç kabinindeki QR kodu okutarak teslim alır. Muayenesi geçen araçlar için zimmet engeli uygulanır.
        </p>
      </div>

      {/* QR Zimmet Simülasyon Paneli */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Alanı */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kabin QR Kod Okutma & Teslim Alma</h3>
              <p className="text-xs text-slate-400">Aracı ve sürücüyü seçerek teslimat kuralını test edin</p>
            </div>
          </div>

          {/* Hata Uyarısı: Muayene Kilidi */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-start gap-3 glow-crimson animate-pulse">
              <Ban className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-200">İş Kuralı İhlali Engellendi:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Başarı Mesajı */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-3 glow-emerald">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleAttemptCheckout} className="space-y-4 text-xs">
            {/* Araç Seçici */}
            <div>
              <label className="text-slate-300 block mb-1.5 font-semibold">
                Teslim Edilecek Araç (Kabin QR Kodu):
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs font-medium"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.brand} {v.model} ({v.status === 'INSPECTION_EXPIRED' ? '🚨 MUAYENE KİLİTLİ' : v.status})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                İpucu: <strong className="text-rose-400">06 FLN 303</strong> aracını seçerek "Muayene Kilidi" kuralının teslimatı nasıl kilitlediğini test edebilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Teslim Alan Sürücü / Operatör</label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Sürücü Telefon</label>
                <input
                  type="text"
                  required
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Teslimat Notu & Kontrol Durumu</label>
              <input
                type="text"
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition glow-cyan flex items-center justify-center gap-2 text-xs"
            >
              <UserCheck className="w-4 h-4" />
              Kabin QR Kodunu Doğrula ve Aracı Zimmetle
            </button>
          </form>
        </div>

        {/* Seçili Araç Canlı Bilgi Kartı */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Seçili Araç Parametreleri
            </h4>
            {selectedVehicle ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-lg font-black text-white font-mono">{selectedVehicle.plateNumber}</p>
                  <p className="text-cyan-300 font-semibold">{selectedVehicle.brand} {selectedVehicle.model}</p>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Çıkış Sayacı:</span>
                    <span className="font-mono font-bold text-white">
                      {selectedVehicle.currentMeter} {selectedVehicle.meterType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Muayene Bitiş:</span>
                    <span className={`font-mono font-bold ${
                      selectedVehicle.isInspectionLocked || selectedVehicle.status === 'INSPECTION_EXPIRED'
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}>
                      {selectedVehicle.nextInspectionDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mevcut Durum:</span>
                    <span className="font-semibold text-white">{selectedVehicle.status}</span>
                  </div>
                </div>

                {selectedVehicle.isInspectionLocked || selectedVehicle.status === 'INSPECTION_EXPIRED' ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] leading-tight">
                    🔒 <strong>Kilitli:</strong> Muayene tarihi geçmiştir. Sistem yasal olarak teslimatı engeller.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] leading-tight">
                    ✅ <strong>Uygun:</strong> Yasal muayenesi ve sigortası tam. Sürücüye zimmetlenebilir.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-xs">Araç seçilmedi</p>
            )}
          </div>
        </div>
      </div>

      {/* Aktif & Geçmiş Zimmet Kayıtları Tablosu */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Zimmet Geçmişi ve Aktif Görevler ({zimmets.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Araç / Plaka</th>
                <th className="pb-3 font-semibold">Sürücü & İletişim</th>
                <th className="pb-3 font-semibold">Teslim Tarihi</th>
                <th className="pb-3 font-semibold">Çıkış / Dönüş Sayacı</th>
                <th className="pb-3 font-semibold">QR Doğrulama</th>
                <th className="pb-3 font-semibold">Durum</th>
                <th className="pb-3 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {zimmets.map((z) => (
                <tr key={z.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5">
                    <p className="font-mono font-bold text-white">{z.vehiclePlate}</p>
                    <p className="text-[11px] text-slate-400">{z.vehicleModel}</p>
                  </td>
                  <td className="py-3.5">
                    <p className="font-semibold text-slate-200">{z.driverName}</p>
                    <p className="text-[11px] text-slate-400">{z.driverPhone}</p>
                  </td>
                  <td className="py-3.5 text-slate-300">{z.assignedAt}</td>
                  <td className="py-3.5 font-mono text-slate-300">
                    Başlangıç: <span className="font-bold text-white">{z.startingMeter}</span>
                    {z.returnMeter && <span> • Bitiş: <strong className="text-cyan-400">{z.returnMeter}</strong></span>}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Kabin QR Doğrulandı
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      z.status === 'ACTIVE'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {z.status === 'ACTIVE' ? 'GÖREVDE' : 'İADE EDİLDİ'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    {z.status === 'ACTIVE' ? (
                      <button
                        onClick={() => {
                          setReturningZimmet(z);
                          setReturnMeterInput((z.startingMeter + 120).toString());
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition"
                      >
                        Aracı İade Al
                      </button>
                    ) : (
                      <span className="text-slate-500 text-xs">Tamamlandı</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aracı İade Alma Modalı */}
      {returningZimmet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-cyan-500/30 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Aracı İade Al & Zimmeti Kapat</h3>
            <p className="text-xs text-slate-400 mb-4">
              Araç: <strong className="text-white">{returningZimmet.vehiclePlate}</strong> • Sürücü: {returningZimmet.driverName}
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Çıkış Sayacı</label>
                <input
                  type="text"
                  disabled
                  value={returningZimmet.startingMeter}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Dönüş Sayacı (Yeni KM / Çalışma Saati)</label>
                <input
                  type="number"
                  required
                  value={returnMeterInput}
                  onChange={(e) => setReturnMeterInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturningZimmet(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan"
                >
                  İadeyi Onayla & Aracı Boşa Çıkar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

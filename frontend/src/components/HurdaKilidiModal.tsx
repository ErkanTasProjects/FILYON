import React, { useState } from 'react';
import { WorkOrder, ScrapRecord } from '../types';
import { ShieldAlert, CheckCircle2, Camera, Upload, X, AlertTriangle, FileCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
  onApproveScrap: (workOrderId: string, scrapId: string) => void;
  onUploadScrapPhoto: (workOrderId: string, photoUrl: string) => void;
  onCompleteWorkOrder: (workOrderId: string) => void;
}

export const HurdaKilidiModal: React.FC<Props> = ({
  workOrder,
  isOpen,
  onClose,
  onApproveScrap,
  onUploadScrapPhoto,
  onCompleteWorkOrder,
}) => {
  const { role } = useAuth();
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasPartsUsed = workOrder.usedParts.length > 0;
  const allScrapsApproved =
    hasPartsUsed &&
    workOrder.scrapRecords.length >= workOrder.usedParts.length &&
    workOrder.scrapRecords.every((s) => s.status === 'APPROVED');

  const handleAttemptComplete = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (hasPartsUsed && !allScrapsApproved) {
      setErrorMessage(
        '🚨 SAYIŞTAY VE İÇ DENETİM HURDA KİLİDİ DEVREDE! Bu iş emrinde yeni yedek parça kullanılmıştır. ' +
        'Sökülen hurda parçanın fotoğrafı yüklenmeden ve Ambar Sorumlusu tarafından fiziksel teslimatı onaylanmadan iş emri kapatılamaz!'
      );
      return;
    }

    onCompleteWorkOrder(workOrder.id);
    setSuccessMessage('✅ İş emri başarıyla kapatıldı ve araç göreve uygun (AVAILABLE) statüsüne alındı!');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleUploadSamplePhoto = (sampleUrl: string) => {
    onUploadScrapPhoto(workOrder.id, sampleUrl);
    setPhotoUrlInput('');
    setSuccessMessage('📸 Hurda parça fotoğrafı sisteme yüklendi! Ambar Yetkilisi onayı bekleniyor.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Sayıştay Uyumlu Hurda Parça Kilidi</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300">
                  {workOrder.workOrderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Araç: <span className="font-semibold text-white">{workOrder.vehiclePlate}</span> ({workOrder.vehicleBrandModel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Sayıştay Bilgilendirme Kutusu */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200 mb-1">Sayıştay & İç Denetim Yasal Hurda Şartı:</p>
              Kurum envanterinden çıkan her yeni parça için, araçtan sökülen eski (hurda) parçanın fotoğraflanması ve
              Ambar Şefliğine teslim edilerek barkod onayı verilmesi zorunludur. Onay alınmadan iş emri kesinlikle kapatılamaz.
            </div>
          </div>

          {/* Hata veya Başarı Bildirimleri */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex gap-2.5 glow-crimson animate-pulse">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex gap-2.5 glow-emerald">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Kullanılan Parçalar Listesi */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              İş Emrinde Kullanılan Yeni Parçalar ({workOrder.usedParts.length})
            </h4>
            <div className="space-y-2">
              {workOrder.usedParts.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-xs text-slate-400">
                      Miktar: {p.quantity} Adet • Birim Fiyat: {p.unitPrice.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    {p.totalPrice.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hurda Parça Durumu ve Fotoğraf Doğrulaması */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sökülen Hurda Parça Delilleri & Ambar Onayı
              </h4>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                allScrapsApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {allScrapsApproved ? 'TÜM HURDALAR ONAYLI' : 'ONAY BEKLENİYOR'}
              </span>
            </div>

            {workOrder.scrapRecords.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center">
                <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">Henüz hurda parça fotoğrafı yüklenmemiş</p>
                <p className="text-xs text-slate-500 mt-1">Usta sökülen eski parçayı fotoğraflamalıdır.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workOrder.scrapRecords.map((scrap) => (
                  <div
                    key={scrap.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center gap-4"
                  >
                    <img
                      src={scrap.scrapPhotoUrl}
                      alt="Hurda Parça"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold text-white">{scrap.sparePartName}</p>
                      <p className="text-xs text-slate-400">OEM: {scrap.oemCode}</p>
                      <p className="text-xs text-slate-400 italic">"{scrap.warehouseNotes || 'Açıklama girilmedi'}"</p>
                      <div className="pt-1">
                        {scrap.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <FileCheck className="w-3.5 h-3.5" />
                            Ambar Tarafından Onaylandı: {scrap.warehouseStaffName || 'Ahmet Çelik'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Ambar Yetkilisinin Fiziksel Teslimat Onayı Bekleniyor
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ambarcı veya Şef için Onay Butonu */}
                    {scrap.status !== 'APPROVED' && (
                      <button
                        onClick={() => onApproveScrap(workOrder.id, scrap.id)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition glow-emerald shrink-0 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Ambara Teslim Alındı (Onayla)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usta İçin: Hurda Fotoğrafı Yükleme Simülasyonu */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              Usta Paneli: Sökülen Parçanın Hurda Fotoğrafını Sisteme Aktar
            </h5>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  handleUploadSamplePhoto(
                    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'
                  )
                }
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Örnek Sökülen Balata Fotoğrafını Yükle
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Toplam Maliyet:{' '}
            <span className="font-mono font-bold text-white text-sm">
              {workOrder.totalCost.toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Vazgeç
            </button>
            <button
              onClick={handleAttemptComplete}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                allScrapsApproved
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-emerald'
                  : 'bg-rose-500/30 text-rose-300 border border-rose-500/50 hover:bg-rose-500/40 glow-crimson'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              İş Emrini Tamamla ve Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

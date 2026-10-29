import React from 'react';
import { Vehicle, WorkOrder } from '../types';
import { FileText, Printer, Download, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
}

export const ReportsPage: React.FC<Props> = ({ vehicles, workOrders }) => {
  // Araç başı maliyet hesaplaması
  const reportData = vehicles.map((v) => {
    const relatedOrders = workOrders.filter((w) => w.vehicleId === v.id);
    const completedOrders = relatedOrders.filter((w) => w.status === 'COMPLETED');

    const totalParts = completedOrders.reduce((acc, curr) => acc + curr.partsCost, 0);
    const totalLabor = completedOrders.reduce((acc, curr) => acc + curr.laborCost, 0);
    const totalCost = totalParts + totalLabor;

    const meter = v.currentMeter > 0 ? v.currentMeter : 1;
    const costPerMeter = (totalCost / meter).toFixed(2);

    // Hurda uyumluluğu: Tüm kullanılan parçalar için onaylı hurda var mı?
    const allScrapsValid = relatedOrders.every((wo) =>
      wo.usedParts.every((up) =>
        wo.scrapRecords.some((sr) => sr.sparePartId === up.sparePartId && sr.status === 'APPROVED')
      )
    );

    return {
      id: v.id,
      plate: v.plateNumber,
      brandModel: `${v.brand} ${v.model}`,
      category: v.category,
      meterType: v.meterType,
      currentMeter: v.currentMeter,
      orderCount: relatedOrders.length,
      partsSpend: totalParts,
      laborSpend: totalLabor,
      totalSpend: totalCost,
      costPerUnit: `${costPerMeter} ₺ / ${v.meterType === 'KM' ? 'KM' : 'Saat'}`,
      isAuditCompliant: allScrapsValid,
    };
  });

  const totalSpendAll = reportData.reduce((acc, curr) => acc + curr.totalSpend, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Print Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Sayıştay & İç Denetim Resmi Maliyet Raporu</h2>
          <p className="text-xs text-slate-400">
            5018 Sayılı Kamu Malî Yönetimi Kanunu Uyumlu Araç Başına Harcama ve Hurda Denetim Cetveli.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition glow-cyan flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Resmi PDF Çıktısı Al
          </button>
          <button
            onClick={() => alert('Excel denetim cetveli (.xlsx) indirildi.')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel'e Aktar
          </button>
        </div>
      </div>

      {/* Official Audit Document Preview */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-700 space-y-6 bg-[#0b1120]">
        {/* Antet / Başlık */}
        <div className="text-center border-b border-slate-800 pb-6 space-y-1">
          <h3 className="text-base font-extrabold tracking-wider text-white uppercase">
            T.C. FİLYON MAKİNE İKMAL VE FİLO İŞLETMELERİ
          </h3>
          <p className="text-xs font-semibold text-cyan-400">
            İÇ DENETİM BİRİMİ BAŞKANLIĞI — SAYIŞTAY DENETİMİNE ESAS ARAÇ MALİYET VE HURDA CETVELİ
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')} • Mali Dönem: 2026/04
          </p>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="pb-3">Araç / Plaka</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3 text-right">Sayaç (KM/Saat)</th>
                <th className="pb-3 text-right">Yedek Parça Harcaması</th>
                <th className="pb-3 text-right">İşçilik Harcaması</th>
                <th className="pb-3 text-right">Toplam Maliyet</th>
                <th className="pb-3 text-right">Birim Maliyet</th>
                <th className="pb-3 text-center">Sayıştay Hurda Uyumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {reportData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 font-sans">
                    <p className="font-mono font-bold text-white text-xs">{row.plate}</p>
                    <p className="text-[11px] text-slate-400">{row.brandModel}</p>
                  </td>
                  <td className="py-3 font-sans text-slate-300">{row.category}</td>
                  <td className="py-3 text-right font-bold text-slate-200">
                    {row.currentMeter.toLocaleString('tr-TR')}
                  </td>
                  <td className="py-3 text-right text-cyan-400">
                    {row.partsSpend.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="py-3 text-right text-emerald-400">
                    {row.laborSpend.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="py-3 text-right font-bold text-white">
                    {row.totalSpend.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="py-3 text-right font-bold text-cyan-300">
                    {row.costPerUnit}
                  </td>
                  <td className="py-3 text-center font-sans">
                    {row.isAuditCompliant ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        TAM UYUMLU (%100)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        EKSİK HURDA ONAYI
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-700 text-xs font-bold text-white">
                <td colSpan={5} className="py-4 text-right uppercase tracking-wider font-sans">
                  Genel Toplam Harcama:
                </td>
                <td className="py-4 text-right font-mono text-cyan-400 text-sm">
                  {totalSpendAll.toLocaleString('tr-TR')} ₺
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mühür & Yetkili İmzalar */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6 text-center text-xs text-slate-400">
          <div>
            <p className="font-bold text-white">Fuat Yılmaz</p>
            <p className="text-[11px]">Atölye & Bakım Şefi</p>
            <p className="text-[10px] text-slate-500 mt-6">[İmza & Paraf]</p>
          </div>
          <div>
            <p className="font-bold text-white">Ahmet Çelik</p>
            <p className="text-[11px]">Ambar & Hurda Yetkilisi</p>
            <p className="text-[10px] text-slate-500 mt-6">[İmza & Mühür]</p>
          </div>
          <div>
            <p className="font-bold text-white">Selim Aksoy</p>
            <p className="text-[11px]">Makine İkmal Daire Başkanı</p>
            <p className="text-[10px] text-slate-500 mt-6">[Onay & Kaşe]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

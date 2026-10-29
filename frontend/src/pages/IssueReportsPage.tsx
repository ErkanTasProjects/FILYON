import React, { useState } from 'react';
import { IssueReport } from '../types';
import { AlertTriangle, Mic, Image, MapPin, Wrench, CheckCircle2, Sparkles, Brain, Check } from 'lucide-react';

interface Props {
  issueReports: IssueReport[];
  onConvertToWorkOrder: (issue: IssueReport) => void;
}

export const IssueReportsPage: React.FC<Props> = ({ issueReports, onConvertToWorkOrder }) => {
  const [aiAnalysisVisible, setAiAnalysisVisible] = useState<Record<string, boolean>>({
    'iss-1': true, // açık gelsin
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">Saha & Şoför Arıza Bildirimleri</h2>
        <p className="text-xs text-slate-400">
          Mobil uygulamadan fotoğraf ve ses kaydı zorunluluğu ile açılan anlık saha arıza kayıtları.
        </p>
      </div>

      <div className="space-y-4">
        {issueReports.map((report) => (
          <div
            key={report.id}
            className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-base font-extrabold text-white">{report.vehiclePlate}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    ÖNCELİK: {report.priority}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Bildiren: {report.driverName}
                  </span>
                </div>
                <h3 className="text-base font-bold text-cyan-300 mt-2">{report.title}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl">{report.description}</p>
              </div>

              <div className="flex items-center gap-3">
                {report.status === 'WORK_ORDER_CREATED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                    İş Emrine Dönüştürüldü
                  </span>
                ) : (
                  <button
                    onClick={() => onConvertToWorkOrder(report)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition glow-cyan flex items-center gap-1.5"
                  >
                    <Wrench className="w-4 h-4" />
                    İş Emrine Dönüştür
                  </button>
                )}
              </div>
            </div>

            {/* Medya Ekleri: Sesli Not ve Fotoğraflar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
              {/* Ses Kaydı Simülatörü */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Mic className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Şoför Sesli Anlatımı (0:24)</span>
                    <span className="text-[10px] text-cyan-400 font-mono">128 kbps</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    "{report.voiceTranscript}"
                  </p>
                </div>
              </div>

              {/* Saha Konumu */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">GPS Konumu ve Bildirim Saati</p>
                  <p className="text-slate-400 mt-0.5">
                    Koordinat: {report.latitude}, {report.longitude} • Tarih: {report.createdAt}
                  </p>
                </div>
              </div>
            </div>

            {/* FILYON AI Otomatik Arıza & Sayıştay Teşhis Motoru */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/30 glow-cyan space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                  FILYON AI Akıllı Teşhis & Parça Öneri Motoru
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  Güven Oranı: %98.4
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Tespit Edilen Kök Neden:</span>
                  <p className="font-bold text-white mt-1">Fren Kaliper Kilitlenmesi & Balata Aşınması</p>
                  <p className="text-[10px] text-rose-400 mt-0.5">Öncelik: Kritik - Sefere Çıkamaz</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Önerilen Yedek Parça:</span>
                  <p className="font-bold text-cyan-300 mt-1 font-mono">FLN-BRK-001 (OEM: A0004202220)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ambar Mevcut: 18 Takım (Raf A-02)</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Sayıştay Denetim Zorunluluğu:</span>
                  <p className="font-bold text-amber-300 mt-1">Hurda Balata İadesi Şarttır</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">İş emrinde hurda kilidi otomatik aktifleşir.</p>
                </div>
              </div>
            </div>


            {/* Arıza Fotoğrafları */}
            {report.photoUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" />
                  Saha Arıza Fotoğrafları ({report.photoUrls.length})
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {report.photoUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Arıza Fotoğrafı"
                      className="w-40 h-28 object-cover rounded-xl border border-slate-700 hover:scale-105 transition shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

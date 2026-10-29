import React from 'react';
import { Vehicle } from '../types';
import { QrCode, X, Printer, CheckCircle } from 'lucide-react';

interface Props {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<Props> = ({ vehicle, isOpen, onClose }) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Araç Kabin QR Kodu</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="inline-block p-4 rounded-2xl bg-white shadow-xl border-4 border-cyan-500/30">
            {/* SVG QR Code Simulation */}
            <svg
              className="w-48 h-48 mx-auto"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white" />
              <rect x="10" y="10" width="30" height="30" fill="#090d16" />
              <rect x="15" y="15" width="20" height="20" fill="white" />
              <rect x="20" y="20" width="10" height="10" fill="#090d16" />

              <rect x="60" y="10" width="30" height="30" fill="#090d16" />
              <rect x="65" y="15" width="20" height="20" fill="white" />
              <rect x="70" y="20" width="10" height="10" fill="#090d16" />

              <rect x="10" y="60" width="30" height="30" fill="#090d16" />
              <rect x="15" y="65" width="20" height="20" fill="white" />
              <rect x="20" y="70" width="10" height="10" fill="#090d16" />

              <rect x="45" y="15" width="10" height="25" fill="#090d16" />
              <rect x="45" y="45" width="10" height="10" fill="#090d16" />
              <rect x="15" y="45" width="25" height="10" fill="#090d16" />
              <rect x="60" y="45" width="30" height="10" fill="#090d16" />
              <rect x="45" y="60" width="10" height="30" fill="#090d16" />
              <rect x="60" y="60" width="15" height="15" fill="#090d16" />
              <rect x="75" y="75" width="15" height="15" fill="#090d16" />
            </svg>
          </div>

          <div>
            <h4 className="text-xl font-bold text-white tracking-wide">{vehicle.plateNumber}</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {vehicle.brand} {vehicle.model} • {vehicle.category}
            </p>
            <p className="text-xs font-mono text-cyan-400 mt-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 inline-block">
              Token: {vehicle.qrCodeToken}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Sürücü mobil uygulamadan bu kodu okutarak aracı zimmetine alabilir.
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition glow-cyan"
          >
            <Printer className="w-4 h-4" />
            Kabin Etiketini Yazdır
          </button>
        </div>
      </div>
    </div>
  );
};

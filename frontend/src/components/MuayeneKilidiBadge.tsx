import React from 'react';
import { ShieldAlert, ShieldCheck, Wrench, Clock, Ban } from 'lucide-react';
import { VehicleStatus } from '../types';

interface Props {
  status: VehicleStatus;
  isLocked?: boolean;
}

export const MuayeneKilidiBadge: React.FC<Props> = ({ status, isLocked }) => {
  if (isLocked || status === 'INSPECTION_EXPIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 glow-crimson animate-pulse">
        <Ban className="w-3.5 h-3.5 text-rose-400" />
        MUAYENE KİLİDİ DEVREDE
      </span>
    );
  }

  switch (status) {
    case 'AVAILABLE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Göreve Uygun (Boşta)
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Clock className="w-3.5 h-3.5" />
          Zimmetli (Görevde)
        </span>
      );
    case 'UNDER_MAINTENANCE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Wrench className="w-3.5 h-3.5" />
          Atölyede / Bakımda
        </span>
      );
    case 'OUT_OF_SERVICE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-600">
          <ShieldAlert className="w-3.5 h-3.5" />
          Gayrifaal / Servis Dışı
        </span>
      );
    default:
      return null;
  }
};

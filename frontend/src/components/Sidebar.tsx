import React from 'react';
import {
  LayoutDashboard,
  Truck,
  QrCode,
  Wrench,
  Boxes,
  AlertTriangle,
  FileText,
  Calendar,
  Lock,
  Radio,
} from 'lucide-react';


interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Komuta Merkezi', icon: LayoutDashboard },
    { id: 'telemetry', label: 'Canlı Telemetri & Yakıt', icon: Radio, badge: 'IoT Sensör' },
    { id: 'vehicles', label: 'Araç & İş Makineleri', icon: Truck },
    { id: 'zimmet', label: 'Zimmet & QR Teslim', icon: QrCode },
    { id: 'work-orders', label: 'İş Emirleri & Hurda', icon: Wrench, badge: 'Hurda Kilidi' },
    { id: 'spare-parts', label: 'Ambar & Yedek Parça', icon: Boxes },
    { id: 'issue-reports', label: 'Arıza Bildirimleri', icon: AlertTriangle },
    { id: 'reports', label: 'Sayıştay Denetim Raporu', icon: FileText },
    { id: 'calendar', label: 'Yasal Muayene Takvimi', icon: Calendar },
  ];


  return (
    <aside className="w-64 border-r border-slate-800 bg-[#090d16] flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Truck className="w-5 h-5 text-slate-950 font-black" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            FILYON
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">
            MAKİNE İKMAL & FİLO BİLGİ SİSTEMİ
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="p-3 space-y-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-400 border border-cyan-500/30 glow-cyan'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Lock className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <p className="text-white font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Sayıştay & İç Denetim Uyumlu
        </p>
        <p className="text-slate-500 leading-tight">
          Hurda Parça Kilidi & Muayene Engeli aktif olarak işletilmektedir.
        </p>
      </div>
    </aside>
  );
};

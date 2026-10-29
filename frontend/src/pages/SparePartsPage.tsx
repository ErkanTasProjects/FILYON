import React, { useState } from 'react';
import { SparePart } from '../types';
import { Boxes, Search, Plus, AlertCircle, Barcode, MapPin, ArrowUpRight, Edit3, DollarSign, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  spareParts: SparePart[];
  onStockIn: (partId: string, addedQty: number) => void;
  onAddPart: (newPart: Partial<SparePart>) => void;
  onUpdatePart?: (partId: string, updatedFields: Partial<SparePart>) => void;
}

export const SparePartsPage: React.FC<Props> = ({ spareParts, onStockIn, onAddPart, onUpdatePart }) => {
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isPriceEditModalOpen, setIsPriceEditModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [stockQtyInput, setStockQtyInput] = useState('5');
  const [newPriceInput, setNewPriceInput] = useState('');
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  const canEditPrice = role === 'ADMIN' || role === 'MANAGER';

  const filteredParts = spareParts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.partCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.oemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode || '').includes(searchTerm);

    if (selectedCategory === 'ALL') return matchesSearch;
    if (selectedCategory === 'CRITICAL') return matchesSearch && (p.isCriticalStock || p.stockQuantity <= p.minStockLevel);
    return matchesSearch && p.category === selectedCategory;
  });

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    const qty = parseInt(stockQtyInput, 10);
    if (isNaN(qty) || qty <= 0) return;

    onStockIn(selectedPart.id, qty);
    setIsStockInModalOpen(false);
    setSuccessNotification(`✅ ${selectedPart.name} için ambara +${qty} ${selectedPart.unit} eklendi.`);
    setTimeout(() => setSuccessNotification(null), 3000);
  };

  const handlePriceUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || !onUpdatePart) return;
    const price = parseFloat(newPriceInput);
    if (isNaN(price) || price < 0) return;

    onUpdatePart(selectedPart.id, { unitPrice: price });
    setIsPriceEditModalOpen(false);
    setSuccessNotification(`⚡ Fiyat Güncellendi! ${selectedPart.name} yeni birim fiyatı: ${price.toLocaleString('tr-TR')} ₺ olarak tüm atölye, ambar ve şef ekranlarında anında güncellendi.`);
    setTimeout(() => setSuccessNotification(null), 4500);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Ambar & Yedek Parça İkmal Yönetimi</h2>
          <p className="text-xs text-slate-400">
            OEM kodları, raf/göz konumları, asgari stok seviyeleri ve barkodlu çıkış takip sistemi.
          </p>
        </div>
      </div>

      {/* Başarı ve Güncelleme Bildirimi */}
      {successNotification && (
        <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-2.5 glow-cyan animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{successNotification}</span>
        </div>
      )}


      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Parça adı, OEM kodu, stok kodu veya barkod ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            Tüm Parçalar ({spareParts.length})
          </button>
          <button
            onClick={() => setSelectedCategory('CRITICAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              selectedCategory === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Kritik Stok Uyarısı
          </button>
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredParts.map((part) => {
          const isLow = part.isCriticalStock || part.stockQuantity <= part.minStockLevel;

          return (
            <div
              key={part.id}
              className={`glass-panel p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                isLow ? 'border-amber-500/40 glow-amber bg-amber-950/10' : 'border-slate-800 glass-panel-hover'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {part.partCode}
                  </span>
                  {isLow && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      KRİTİK STOK
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mt-2.5 leading-snug">{part.name}</h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">OEM: {part.oemCode}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      Raf Konumu:
                    </span>
                    <span className="font-mono font-semibold text-slate-200">{part.shelfLocation}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Barcode className="w-3.5 h-3.5 text-cyan-400" />
                      Barkod:
                    </span>
                    <span className="font-mono text-[11px] text-slate-300">{part.barcode}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Birim Fiyat:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-white text-sm">
                        {part.unitPrice.toLocaleString('tr-TR')} ₺
                      </span>
                      {canEditPrice && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPart(part);
                            setNewPriceInput(part.unitPrice.toString());
                            setIsPriceEditModalOpen(true);
                          }}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-slate-700 transition"
                          title="Yönetici: Birim Fiyatı Güncelle"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stok Durumu & Aksiyon */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Mevcut Stok</p>
                  <p className={`text-xl font-black font-mono ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {part.stockQuantity} <span className="text-xs text-slate-400">{part.unit}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Asgari: {part.minStockLevel} {part.unit}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedPart(part);
                      setIsStockInModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition glow-cyan flex items-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Giriş Yap
                  </button>
                </div>
              </div>
            </div>

          );
        })}
      </div>

      {/* Ambara Giriş Modalı */}
      {isStockInModalOpen && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-cyan-500/30 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Ambara Stok Girişi (Satın Alma / İkmal)</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedPart.name} ({selectedPart.partCode})</p>

            <form onSubmit={handleStockInSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Giriş Yapılacak Miktar ({selectedPart.unit})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockQtyInput}
                  onChange={(e) => setStockQtyInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan"
                >
                  Stok Artışını Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin / Müdür: Fiyat Güncelleme Modalı */}
      {isPriceEditModalOpen && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-cyan-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Birim Fiyat Güncelleme (Yönetici)</h3>
                <p className="text-xs text-slate-400">{selectedPart.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Yapacağınız fiyat güncellemesi, ambar stoğunda, atölye iş emirlerinde ve resmi Sayıştay raporlarında anında otomatik olarak güncellenecektir.
            </p>

            <form onSubmit={handlePriceUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Yeni Birim Fiyat (₺ / {selectedPart.unit})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPriceEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 glow-cyan"
                >
                  Fiyatı Anında Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


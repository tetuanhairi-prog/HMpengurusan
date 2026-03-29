
import React, { useState, useRef } from 'react';
import { ServiceItem } from '../types';
import { exportToCSV, parseCSV } from '../utils/csvUtils';

interface InventoryPageProps {
  services: ServiceItem[];
  onAdd: (service: Omit<ServiceItem, 'id'>) => void;
  onDelete: (id: string) => void;
  // Fix for error in App.tsx on line 121: Property 'onImport' does not exist on type 'IntrinsicAttributes & InventoryPageProps'
  onImport: (data: ServiceItem[]) => void;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ services, onAdd, onDelete, onImport }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return alert("Sila isi butiran perkhidmatan!");
    onAdd({
      name: name.toUpperCase(),
      price: parseFloat(price)
    });
    setName('');
    setPrice('');
  };

  const handleExport = () => {
    const headers = ["Name", "Price"];
    const data = services.map(s => ({
      name: s.name,
      price: s.price.toFixed(2)
    }));
    exportToCSV("HMA_Services", headers, data);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rawData = await parseCSV(file);
      const imported: ServiceItem[] = rawData.map(row => ({
        id: crypto.randomUUID(),
        name: (row.name || "UNNAMED").toUpperCase(),
        price: parseFloat(row.price) || 0
      }));
      if (confirm(`Import ${imported.length} rekod? Data sedia ada akan diganti.`)) {
        onImport(imported);
      }
    } catch (err) {
      alert("Ralat membaca fail CSV.");
    }
  };

  return (
    <div className="animate-fadeIn space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-lg">Senarai Perkhidmatan</h2>
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mt-2">Katalog Harga & Servis Firma</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="px-5 py-2.5 bg-[#111] text-gray-400 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:text-[#FFD700] hover:border-[#FFD700]/30 transition-all shadow-lg flex items-center gap-2 group">
            <i className="fas fa-file-export group-hover:-translate-y-1 transition-transform"></i> Export Data
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-[#111] text-gray-400 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:text-[#FFD700] hover:border-[#FFD700]/30 transition-all shadow-lg flex items-center gap-2 group">
            <i className="fas fa-file-import group-hover:-translate-y-1 transition-transform"></i> Import CSV
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <h3 className="text-[#FFD700] text-xs font-black uppercase tracking-[0.3em] mb-8 border-b border-[#FFD700]/10 pb-4 italic">Tambah Perkhidmatan Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Nama Perkhidmatan</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800" 
              placeholder="Contoh: Permohonan Faraid"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Harga Standard (RM)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800" 
              placeholder="250.00"
            />
          </div>
        </div>
        <button type="submit" className="w-full md:w-auto px-12 py-4 bg-[#FFD700] text-black font-black rounded-full hover:bg-white transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-95 text-xs">
          Simpan Perkhidmatan
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-600 font-bold italic uppercase tracking-widest text-xs bg-[#0a0a0a] rounded-3xl border border-white/5">Tiada perkhidmatan didaftarkan.</div>
        ) : (
          services.map((svc) => (
            <div key={svc.id} className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 flex flex-col justify-between group hover:border-[#FFD700]/30 transition-all shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-bl-full -z-10 group-hover:bg-[#FFD700]/10 transition-colors"></div>
              <div className="mb-6">
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2 italic">Perkhidmatan</p>
                <h3 className="text-white font-black text-lg uppercase tracking-tight leading-tight group-hover:text-[#FFD700] transition-colors">{svc.name}</h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1 italic">Harga Standard</p>
                  <p className="text-2xl font-black tabular-nums tracking-tighter text-white">RM {svc.price.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
                </div>
                <button 
                  onClick={() => { if(confirm('Padam perkhidmatan?')){ onDelete(svc.id); }}}
                  className="w-10 h-10 flex items-center justify-center bg-[#111] text-gray-500 rounded-full hover:bg-rose-600 hover:text-white transition-all border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                >
                  <i className="fas fa-trash-can text-sm"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryPage;

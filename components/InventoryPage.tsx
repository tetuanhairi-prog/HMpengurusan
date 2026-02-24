
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
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-black text-[#FFD700] uppercase tracking-tighter">Senarai Perkhidmatan & Harga</h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-[#111] text-[#FFD700] border border-[#333] rounded font-bold text-xs hover:bg-[#222]">
            <i className="fas fa-file-export mr-2"></i> EXPORT
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[#111] text-[#FFD700] border border-[#333] rounded font-bold text-xs hover:bg-[#222]">
            <i className="fas fa-file-import mr-2"></i> IMPORT
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] p-6 rounded-lg border border-[#333] mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[#FFD700] text-xs font-bold uppercase mb-2">Nama Perkhidmatan</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-black border border-[#333] text-white p-3 rounded-md focus:outline-none focus:border-[#FFD700]" 
              placeholder="Contoh: Permohonan Faraid"
            />
          </div>
          <div>
            <label className="block text-[#FFD700] text-xs font-bold uppercase mb-2">Harga Standard (RM)</label>
            <input 
              type="number" 
              value={price} 
              onChange={e => setPrice(e.target.value)} 
              className="w-full bg-black border border-[#333] text-white p-3 rounded-md focus:outline-none focus:border-[#FFD700]" 
              placeholder="250.00"
            />
          </div>
        </div>
        <button type="submit" className="w-full md:w-auto px-10 py-3 bg-[#FFD700] text-black font-black rounded-md hover:bg-[#FFA500] transition-colors uppercase shadow-lg">
          TAMBAH PERKHIDMATAN
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-500">Tiada perkhidmatan didaftarkan.</div>
        ) : (
          services.map((svc) => (
            <div key={svc.id} className="bg-[#0a0a0a] p-4 rounded-lg border border-[#333] flex justify-between items-center group">
              <div>
                <p className="text-[#FFD700] text-xs font-bold uppercase tracking-wider">Perkhidmatan</p>
                <h3 className="text-white font-bold">{svc.name}</h3>
                <p className="text-gray-400 text-lg font-black">RM {svc.price.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => { if(confirm('Padam perkhidmatan?')){ onDelete(svc.id); }}}
                className="w-10 h-10 flex items-center justify-center bg-rose-600/10 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600/30"
              >
                <i className="fas fa-trash-can"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryPage;

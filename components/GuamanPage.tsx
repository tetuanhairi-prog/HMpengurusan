
import React, { useState, useRef } from 'react';
import { Client, ThemeMode } from '../types';
import { exportToCSV, parseCSV } from '../utils/csvUtils';

interface GuamanPageProps {
  clients: Client[];
  theme: ThemeMode;
  onAdd: (client: { name: string; detail: string; phone?: string; address?: string }, fee: number) => void;
  onDelete: (id: string) => void;
  onOpenLedger: (idx: number) => void;
  onImport: (data: Client[]) => void;
}

const GuamanPage: React.FC<GuamanPageProps> = ({ clients, theme, onAdd, onDelete, onOpenLedger, onImport }) => {
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [fee, setFee] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDarkMode = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Nama diperlukan!");
    onAdd({ 
      name: name.toUpperCase(), 
      detail: detail.toUpperCase(), 
      phone, 
      address: address.toUpperCase() 
    }, parseFloat(fee) || 0);
    setName(''); setDetail(''); setPhone(''); setAddress(''); setFee('');
  };

  const handleExport = () => {
    const headers = ["Name", "Detail", "Phone", "Address", "Balance"];
    const data = clients.map(c => ({
      name: c.name,
      detail: c.detail,
      phone: c.phone || "",
      address: c.address || "",
      balance: c.ledger.reduce((s, e) => s + e.amt, 0).toFixed(2)
    }));
    exportToCSV("HMA_Guaman", headers, data);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rawData = await parseCSV(file);
      const importedClients: Client[] = rawData.map(row => ({
        id: crypto.randomUUID(),
        name: (row.name || "UNNAMED").toUpperCase(),
        detail: (row.detail || "").toUpperCase(),
        phone: row.phone || "",
        address: row.address || "",
        ledger: [{
          date: new Date().toISOString().split('T')[0],
          desc: "IMPORTED BALANCE",
          amt: parseFloat(row.balance) || 0
        }]
      }));
      if (confirm(`Import ${importedClients.length} rekod? Data sedia ada akan diganti.`)) {
        onImport(importedClients);
      }
    } catch (err) {
      alert("Ralat membaca fail CSV.");
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-[#FFD700]">Pendaftaran Kes Guaman</h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 border rounded font-bold text-xs transition-colors bg-[#111] text-[#FFD700] border-[#333] hover:bg-[#222]">
            <i className="fas fa-file-export mr-2"></i> EXPORT
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border rounded font-bold text-xs transition-colors bg-[#111] text-[#FFD700] border-[#333] hover:bg-[#222]">
            <i className="fas fa-file-import mr-2"></i> IMPORT
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-lg border mb-8 transition-colors bg-[#0a0a0a] border-[#333]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-2 text-[#FFD700]">Nama Pelanggan</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full border p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition-colors text-white bg-black border-[#333]" 
              placeholder="Cth: ALI BIN ABU" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-2 text-[#FFD700]">No. Telefon</label>
            <input 
              type="text" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full border p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition-colors text-white bg-black border-[#333]" 
              placeholder="Cth: 0123456789" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-2 text-[#FFD700]">Butiran Kes</label>
            <input 
              type="text" 
              value={detail} 
              onChange={e => setDetail(e.target.value)} 
              className="w-full border p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition-colors text-white bg-black border-[#333]" 
              placeholder="Cth: Hak Jagaan Anak" 
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold uppercase mb-2 text-[#FFD700]">Alamat Penuh</label>
            <input 
              type="text" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              className="w-full border p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition-colors text-white bg-black border-[#333]" 
              placeholder="LOT 123, JALAN BALING..." 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-2 text-[#FFD700]">Fee Professional (RM)</label>
            <input 
              type="number" 
              value={fee} 
              onChange={e => setFee(e.target.value)} 
              className="w-full border p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition-colors text-white bg-black border-[#333]" 
              placeholder="Cth: 2500" 
            />
          </div>
        </div>
        <button type="submit" className="w-full md:w-auto px-10 py-3 bg-[#FFD700] text-black font-black rounded-md hover:bg-[#FFA500] transition-colors uppercase shadow-lg">
          DAFTAR KES BARU
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border transition-colors border-[#333]">
        <table className="w-full text-left">
          <thead className="bg-[#111]">
            <tr className="text-[10px] uppercase font-bold text-[#FFD700]">
              <th className="p-4">Nama Pelanggan</th>
              <th className="p-4">Kes / Butiran</th>
              <th className="p-4 text-right">Baki Tunggakan (RM)</th>
              <th className="p-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y transition-colors divide-[#333]">
            {clients.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-500">Tiada rekod dijumpai.</td></tr>
            ) : (
              clients.map((client, idx) => {
                const balance = client.ledger.reduce((sum, entry) => sum + entry.amt, 0);
                return (
                  <tr key={client.id} className="transition-colors hover:bg-[#111]">
                    <td className="p-4 font-bold uppercase text-white">{client.name}</td>
                    <td className="p-4 italic text-sm text-gray-400">
                      {client.detail}
                      {client.phone && <div className="text-[10px] not-italic opacity-60 font-black">Tel: {client.phone}</div>}
                    </td>
                    <td className={`p-4 text-right font-black text-lg ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {balance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => onOpenLedger(idx)} className="px-3 py-1 border rounded text-[10px] font-bold transition-colors bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/50 hover:bg-[#FFD700]/20">
                        LEDGER
                      </button>
                      <button onClick={() => { if(confirm('Padam pelanggan?')){ onDelete(client.id); }}} className="w-8 h-8 flex items-center justify-center bg-rose-600/20 text-rose-500 border border-rose-600/50 rounded hover:bg-rose-600/40">
                        <i className="fas fa-trash-can text-xs"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuamanPage;

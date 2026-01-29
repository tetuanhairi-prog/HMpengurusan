
import React, { useState, useRef } from 'react';
import { Client, ThemeMode } from '../types';
import { exportToCSV, parseCSV } from '../utils/csvUtils';

interface GuamanPageProps {
  clients: Client[];
  theme: ThemeMode;
  onAdd: (client: { name: string; detail: string }, fee: number) => void;
  onDelete: (id: string) => void;
  onOpenLedger: (idx: number) => void;
  onImport: (data: Client[]) => void;
}

const GuamanPage: React.FC<GuamanPageProps> = ({ clients, theme, onAdd, onDelete, onOpenLedger, onImport }) => {
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [fee, setFee] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDarkMode = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Nama diperlukan!");
    onAdd({ name: name.toUpperCase(), detail }, parseFloat(fee) || 0);
    setName(''); setDetail(''); setFee('');
  };

  const handleExport = () => {
    const headers = ["Name", "Detail", "Balance"];
    const data = clients.map(c => ({
      name: c.name,
      detail: c.detail,
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
        detail: row.detail || "",
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
        <h2 className={`text-2xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-900'}`}>Pendaftaran Kes Guaman</h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className={`px-4 py-2 border rounded font-bold text-xs transition-colors ${isDarkMode ? 'bg-[#333] text-[#FFD700] border-[#444] hover:bg-[#444]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
            <i className="fas fa-file-export mr-2"></i> EXPORT
          </button>
          <button onClick={() => fileInputRef.current?.click()} className={`px-4 py-2 border rounded font-bold text-xs transition-colors ${isDarkMode ? 'bg-[#333] text-[#FFD700] border-[#444] hover:bg-[#444]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
            <i className="fas fa-file-import mr-2"></i> IMPORT
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`p-6 rounded-lg border mb-8 transition-colors ${isDarkMode ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-50 border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className={`block text-[10px] font-bold uppercase mb-2 ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-500'}`}>Nama Pelanggan</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className={`w-full border p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition-colors ${isDarkMode ? 'bg-[#222] border-[#333] text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
              placeholder="Cth: ALI BIN ABU" 
            />
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase mb-2 ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-500'}`}>Butiran Kes</label>
            <input 
              type="text" 
              value={detail} 
              onChange={e => setDetail(e.target.value)} 
              className={`w-full border p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition-colors ${isDarkMode ? 'bg-[#222] border-[#333] text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
              placeholder="Cth: Hak Jagaan Anak" 
            />
          </div>
          <div>
            <label className={`block text-[10px] font-bold uppercase mb-2 ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-500'}`}>Fee Professional (RM)</label>
            <input 
              type="number" 
              value={fee} 
              onChange={e => setFee(e.target.value)} 
              className={`w-full border p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition-colors ${isDarkMode ? 'bg-[#222] border-[#333] text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
              placeholder="Cth: 2500" 
            />
          </div>
        </div>
        <button type="submit" className="w-full md:w-auto px-10 py-3 bg-[#FFD700] text-black font-black rounded-md hover:bg-[#FFA500] transition-colors uppercase shadow-lg">
          DAFTAR KES BARU
        </button>
      </form>

      <div className={`overflow-x-auto rounded-lg border transition-colors ${isDarkMode ? 'border-[#333]' : 'border-gray-200'}`}>
        <table className="w-full text-left">
          <thead className={isDarkMode ? 'bg-[#222]' : 'bg-gray-100'}>
            <tr className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-600'}`}>
              <th className="p-4">Nama Pelanggan</th>
              <th className="p-4">Kes / Butiran</th>
              <th className="p-4 text-right">Baki Tunggakan (RM)</th>
              <th className="p-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#333]' : 'divide-gray-100'}`}>
            {clients.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-500">Tiada rekod dijumpai.</td></tr>
            ) : (
              clients.map((client, idx) => {
                const balance = client.ledger.reduce((sum, entry) => sum + entry.amt, 0);
                return (
                  <tr key={client.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50'}`}>
                    <td className={`p-4 font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{client.name}</td>
                    <td className={`p-4 italic text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{client.detail}</td>
                    <td className={`p-4 text-right font-black text-lg ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {balance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => onOpenLedger(idx)} className={`px-3 py-1 border rounded text-[10px] font-bold transition-colors ${isDarkMode ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/50 hover:bg-[#FFD700]/20' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
                        LEDGER
                      </button>
                      <button onClick={() => { if(confirm('Padam pelanggan?')){ onDelete(client.id); }}} className="w-8 h-8 flex items-center justify-center bg-red-600/20 text-red-500 border border-red-600/50 rounded hover:bg-red-600/40">
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

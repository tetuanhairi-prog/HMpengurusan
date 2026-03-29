
import React, { useState, useRef } from 'react';
import { Client, ThemeMode, LedgerEntry } from '../types';
import { exportToCSV, parseCSV } from '../utils/csvUtils';
import { formatDate } from '../utils/dateUtils';

interface GuamanPageProps {
  clients: Client[];
  theme: ThemeMode;
  onAdd: (client: { name: string; detail: string; phone?: string; address?: string }, fee: number) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onImport: (data: Client[]) => void;
  onAddLedger: (clientIdx: number, entry: LedgerEntry) => void;
  onDeleteLedger: (clientIdx: number, entryIdx: number) => void;
  onPrintStatement: (clientIdx: number, notes: string, startDate: string, endDate: string) => void;
}

const GuamanPage: React.FC<GuamanPageProps> = ({ 
  clients, theme, onAdd, onDelete, onBulkDelete, onImport, onAddLedger, onDeleteLedger, onPrintStatement 
}) => {
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [fee, setFee] = useState('');
  const [selectedClientIdx, setSelectedClientIdx] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Ledger specific states
  const [ledgerNotes, setLedgerNotes] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');

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

  const handleBulkExport = () => {
    const headers = ["Name", "Detail", "Phone", "Address", "Balance"];
    const selectedClients = clients.filter(c => selectedIds.includes(c.id));
    const data = selectedClients.map(c => ({
      name: c.name,
      detail: c.detail,
      phone: c.phone || "",
      address: c.address || "",
      balance: c.ledger.reduce((s, e) => s + e.amt, 0).toFixed(2)
    }));
    exportToCSV("HMA_Guaman_Pilihan", headers, data);
  };

  const handleBulkDelete = () => {
    if (confirm(`Adakah anda pasti untuk memadam ${selectedIds.length} rekod fail yang dipilih?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
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

  if (selectedClientIdx !== null) {
    const client = clients[selectedClientIdx];
    const balance = client.ledger.reduce((s, t) => s + t.amt, 0);

    return (
      <div className="animate-fadeIn space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedClientIdx(null)}
              className="w-12 h-12 flex items-center justify-center bg-[#111] text-[#FFD700] rounded-full hover:bg-white hover:text-black transition-all border border-white/10 shadow-lg group"
            >
              <i className="fas fa-chevron-left group-hover:-translate-x-1 transition-transform"></i>
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white drop-shadow-md">{client.name}</h2>
              <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">{client.detail}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onPrintStatement(selectedClientIdx, ledgerNotes, ledgerStartDate, ledgerEndDate)}
              className="px-6 py-3 bg-[#FFD700] text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center gap-2 group"
            >
              <i className="fas fa-print group-hover:scale-110 transition-transform"></i> Cetak Penyata
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Entry Form & Filters */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl">
              <h3 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-b border-[#FFD700]/10 pb-4 italic">Rekod Transaksi Baru</h3>
              <LedgerForm onAdd={(entry) => onAddLedger(selectedClientIdx, entry)} />
            </div>

            <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl">
              <h3 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mb-6 border-b border-[#FFD700]/10 pb-4 italic">Konfigurasi Penyata</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Nota Tambahan</label>
                  <textarea 
                    value={ledgerNotes}
                    onChange={e => setLedgerNotes(e.target.value)}
                    placeholder="Nota untuk klien..."
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[#FFD700] h-24 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Tapis Tarikh</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={ledgerStartDate} onChange={e => setLedgerStartDate(e.target.value)} className="bg-black border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-[#FFD700] w-full" />
                    <input type="date" value={ledgerEndDate} onChange={e => setLedgerEndDate(e.target.value)} className="bg-black border border-white/10 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-[#FFD700] w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transaction List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black border-b border-white/5">
                    <th className="p-6 text-[9px] uppercase font-black tracking-[0.2em] text-gray-500">Tarikh</th>
                    <th className="p-6 text-[9px] uppercase font-black tracking-[0.2em] text-gray-500">Butiran Transaksi</th>
                    <th className="p-6 text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 text-right">Amaun (RM)</th>
                    <th className="p-6 text-[9px] uppercase font-black tracking-[0.2em] text-gray-500 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {client.ledger.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-gray-600 font-bold italic uppercase tracking-widest text-xs">Tiada transaksi direkodkan.</td></tr>
                  ) : (
                    client.ledger.map((t, i) => (
                      <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 text-gray-500 font-bold tabular-nums text-xs whitespace-nowrap">{formatDate(t.date)}</td>
                        <td className="p-6 text-white font-black uppercase tracking-tight leading-tight text-sm">{t.desc}</td>
                        <td className={`p-6 text-right font-black text-xl tabular-nums tracking-tighter ${t.amt < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {t.amt.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-6 text-center">
                          <button 
                            onClick={() => onDeleteLedger(selectedClientIdx, i)}
                            className="w-8 h-8 flex items-center justify-center text-gray-800 hover:text-rose-500 transition-colors"
                          >
                            <i className="fas fa-trash-can text-xs"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1 italic">Kedudukan Kewangan Fail</p>
                <div className={`text-5xl font-black tracking-tighter tabular-nums ${balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  RM {balance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="opacity-10">
                <i className="fas fa-gavel text-6xl text-[#FFD700]"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-lg">Pengurusan Fail Guaman</h2>
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mt-2">Sistem Pendaftaran & Rekod Kewangan Klien</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Form - Minimalist Sidebar Style */}
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl sticky top-8">
            <h3 className="text-[#FFD700] text-xs font-black uppercase tracking-[0.3em] mb-8 border-b border-[#FFD700]/10 pb-4 italic">Daftar Fail Baru</h3>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Nama Penuh Klien</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800" 
                  placeholder="Cth: MOHD BIN AHMAD" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">No. Telefon</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800" 
                    placeholder="012..." 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Fee (RM)</label>
                  <input 
                    type="number" 
                    value={fee} 
                    onChange={e => setFee(e.target.value)} 
                    className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800" 
                    placeholder="2500" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Butiran Kes</label>
                <input 
                  type="text" 
                  value={detail} 
                  onChange={e => setDetail(e.target.value)} 
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800" 
                  placeholder="Cth: Tuntutan Mutaah" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Alamat Kediaman</label>
                <textarea 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800 h-24 resize-none" 
                  placeholder="Alamat lengkap..." 
                />
              </div>
            </div>

            <button type="submit" className="w-full mt-8 py-4 bg-[#FFD700] text-black font-black rounded-full hover:bg-white transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-95 text-xs">
              Simpan Rekod Fail
            </button>
          </form>
        </div>

        {/* Client List - Minimalist Table Style */}
        <div className="lg:col-span-8">
          {selectedIds.length > 0 && (
            <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <span className="text-[#FFD700] text-xs font-black uppercase tracking-widest">{selectedIds.length} Rekod Dipilih</span>
              <div className="flex gap-3">
                <button 
                  onClick={handleBulkExport}
                  className="px-4 py-2 bg-[#111] text-[#FFD700] border border-[#FFD700]/30 rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-[#FFD700] hover:text-black transition-all"
                >
                  <i className="fas fa-file-export mr-2"></i> Export Pilihan
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                >
                  <i className="fas fa-trash-can mr-2"></i> Padam Pilihan
                </button>
              </div>
            </div>
          )}
          <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black border-b border-white/5">
                  <th className="p-6 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="accent-[#FFD700] w-4 h-4 cursor-pointer"
                      checked={clients.length > 0 && selectedIds.length === clients.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(clients.map(c => c.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Maklumat Klien & Kes</th>
                  <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 text-right">Baki Akaun</th>
                  <th className="p-6 text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-gray-600 font-bold italic uppercase tracking-widest text-xs">Tiada rekod fail aktif dijumpai.</td></tr>
                ) : (
                  clients.map((client, idx) => {
                    const balance = client.ledger.reduce((sum, entry) => sum + entry.amt, 0);
                    return (
                      <tr key={client.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 text-center">
                          <input 
                            type="checkbox" 
                            className="accent-[#FFD700] w-4 h-4 cursor-pointer"
                            checked={selectedIds.includes(client.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, client.id]);
                              } else {
                                setSelectedIds(selectedIds.filter(id => id !== client.id));
                              }
                            }}
                          />
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="text-white font-black text-lg uppercase tracking-tight leading-none mb-1 group-hover:text-[#FFD700] transition-colors">{client.name}</span>
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider italic">{client.detail}</span>
                            {client.phone && <span className="text-[10px] text-gray-600 mt-2 font-black tabular-nums tracking-widest"><i className="fas fa-phone-alt mr-2 text-[#FFD700]/30"></i>{client.phone}</span>}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`text-2xl font-black tabular-nums tracking-tighter ${balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                              RM {balance.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest mt-1 italic">Kedudukan Kewangan</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center gap-3">
                            <button 
                              onClick={() => setSelectedClientIdx(idx)} 
                              className="px-6 py-2.5 bg-[#111] border border-white/10 text-gray-300 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all shadow-lg"
                            >
                              Buka Ledger
                            </button>
                            <button 
                              onClick={() => { if(confirm('Padam rekod fail ini?')){ onDelete(client.id); }}} 
                              className="w-10 h-10 flex items-center justify-center bg-[#111] text-gray-500 rounded-full hover:bg-rose-600 hover:text-white transition-all border border-white/10 shadow-lg"
                            >
                              <i className="fas fa-trash-can text-sm"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const LedgerForm: React.FC<{ onAdd: (entry: LedgerEntry) => void }> = ({ onAdd }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amt) return alert("Isi butiran!");
    onAdd({ date, desc: desc.toUpperCase(), amt: parseFloat(amt) });
    setDesc(''); setAmt('');
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Tarikh</label>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          className="w-full bg-black border border-white/10 text-white rounded-2xl p-4 text-xs font-bold focus:border-[#FFD700] transition-all outline-none" 
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Keterangan</label>
        <input 
          type="text" 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
          placeholder="Cth: BAYARAN ANSURAN" 
          className="w-full bg-black border border-white/10 text-white rounded-2xl p-4 text-xs font-bold focus:border-[#FFD700] transition-all outline-none uppercase" 
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Amaun (+/-)</label>
        <div className="flex gap-2">
          <input 
            type="number" 
            step="0.01" 
            value={amt} 
            onChange={e => setAmt(e.target.value)} 
            placeholder="500 / -500" 
            className="w-full bg-black border border-white/10 text-white rounded-2xl p-4 text-xs font-bold focus:border-[#FFD700] transition-all outline-none" 
          />
        </div>
      </div>
      <button 
        type="submit" 
        className="w-full bg-[#FFD700] text-black py-4 rounded-2xl font-black text-xs hover:bg-[#FFA500] transition-all shadow-lg active:scale-95 uppercase tracking-widest"
      >
        Simpan Transaksi
      </button>
    </form>
  );
};

export default GuamanPage;

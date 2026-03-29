
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { PjsRecord, ThemeMode } from '../types';
import { exportToCSV, parseCSV } from '../utils/csvUtils';
import { formatDate } from '../utils/dateUtils';

interface PjsPageProps {
  records: PjsRecord[];
  theme: ThemeMode;
  onAdd: (record: Omit<PjsRecord, 'id'>) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onImport: (data: PjsRecord[]) => void;
}

type SortConfig = {
  key: keyof PjsRecord;
  direction: 'asc' | 'desc';
} | null;

const PjsPage: React.FC<PjsPageProps> = ({ records, theme, onAdd, onDelete, onBulkDelete, onImport }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDarkMode = theme === 'dark';

  const displayYear = useMemo(() => {
    if (records.length === 0) return new Date().getFullYear();
    const latestDate = [...records].sort((a, b) => b.date.localeCompare(a.date))[0].date;
    return new Date(latestDate).getFullYear();
  }, [records]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return alert("Sila isi nama dan amaun!");
    onAdd({
      date,
      name: name.toUpperCase(),
      detail: detail.toUpperCase(),
      amount: parseFloat(amount)
    });
    setName('');
    setDetail('');
    setAmount('');
  };

  const handleExport = () => {
    const headers = ["Date", "Name", "Detail", "Amount"];
    const data = records.map(r => ({
      date: r.date,
      name: r.name,
      detail: r.detail,
      amount: r.amount.toFixed(2)
    }));
    exportToCSV("HMA_PJS", headers, data);
  };

  const handleBulkExport = () => {
    const headers = ["Date", "Name", "Detail", "Amount"];
    const selectedRecords = records.filter(r => selectedIds.includes(r.id));
    const data = selectedRecords.map(r => ({
      date: r.date,
      name: r.name,
      detail: r.detail,
      amount: r.amount.toFixed(2)
    }));
    exportToCSV("HMA_PJS_Pilihan", headers, data);
  };

  const handleBulkDelete = () => {
    if (confirm(`Adakah anda pasti untuk memadam ${selectedIds.length} rekod PJS yang dipilih?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rawData = await parseCSV(file);
      const imported: PjsRecord[] = rawData.map(row => ({
        id: crypto.randomUUID(),
        date: row.date || new Date().toISOString().split('T')[0],
        name: (row.name || "UNNAMED").toUpperCase(),
        detail: (row.detail || "").toUpperCase(),
        amount: parseFloat(row.amount) || 0
      }));
      if (confirm(`Import ${imported.length} rekod? Data sedia ada akan diganti.`)) {
        onImport(imported);
      }
    } catch (err) {
      alert("Ralat membaca fail CSV.");
    }
  };

  const handleSort = (key: keyof PjsRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleShare = async (record: PjsRecord) => {
    try {
      const encoded = btoa(JSON.stringify(record));
      const shareUrl = `${window.location.origin}${window.location.pathname}#share-pjs=${encoded}`;
      const shareText = `Rekod PJS: ${record.name} - RM ${record.amount.toFixed(2)} (${record.detail})`;

      if (navigator.share) {
        await navigator.share({
          title: 'Rekod PJS - Hairi Mustafa Associates',
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback(`Pautan untuk ${record.name} telah disalin!`);
        setTimeout(() => setShareFeedback(null), 3000);
      }
    } catch (err) {
      console.error("Error sharing", err);
    }
  };

  const sortedRecords = useMemo(() => {
    let sortableRecords = [...records];
    if (sortConfig !== null) {
      sortableRecords.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRecords;
  }, [records, sortConfig]);

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
    const totals = new Array(12).fill(0);

    records.forEach(rec => {
      const d = new Date(rec.date);
      if (d.getFullYear() === displayYear) {
        totals[d.getMonth()] += rec.amount;
      }
    });

    return months.map((m, i) => ({ month: m, total: totals[i] }));
  }, [records, displayYear]);

  const maxTotal = Math.max(...monthlyData.map(d => d.total), 1);

  const getSortIcon = (key: keyof PjsRecord) => {
    if (!sortConfig || sortConfig.key !== key) return <i className="fas fa-sort ml-1 opacity-20"></i>;
    return sortConfig.direction === 'asc' 
      ? <i className="fas fa-sort-up ml-1"></i> 
      : <i className="fas fa-sort-down ml-1"></i>;
  };

  // Enhanced input class with strong gold focus state
  const inputClass = `w-full border-2 p-3.5 rounded-xl font-bold transition-all text-white bg-black border-[#333] focus:outline-none focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/30 outline-none`;

  return (
    <div className="animate-fadeIn space-y-8">
      {shareFeedback && (
        <div className="fixed top-4 right-4 z-[300] bg-[#FFD700] text-black px-6 py-3 rounded-full font-black shadow-2xl animate-slideUp flex items-center gap-3 border-2 border-white">
          <i className="fas fa-check-circle"></i>
          {shareFeedback}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
            Rekod Pesuruhjaya Sumpah
          </h2>
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mt-2">Sistem Pengurusan Dokumen PJS</p>
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

      <div className="p-8 rounded-3xl border mb-8 shadow-2xl transition-colors bg-[#0a0a0a] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-bl-full -z-10"></div>
        <div className="flex items-center gap-3 mb-8 border-b border-[#FFD700]/10 pb-4">
          <div className="w-1.5 h-6 bg-[#FFD700] rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD700] italic">
            Prestasi Bulanan {displayYear} (Kutipan RM)
          </h3>
        </div>
        
        <div className="relative h-48 flex items-end justify-between gap-1 md:gap-4 px-2">
          {monthlyData.map((d, i) => {
            const heightPercentage = (d.total / maxTotal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-[#FFD700] text-black text-[10px] font-black px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    RM {d.total.toFixed(2)}
                  </div>
                  <div className="w-2 h-2 bg-[#FFD700] rotate-45 mx-auto -mt-1"></div>
                </div>
                <div 
                  className="w-full bg-[#FFD700] rounded-t-sm transition-all duration-700 ease-out shadow-[0_-4px_10px_rgba(255,215,0,0.2)] group-hover:bg-[#FFA500] group-hover:scale-x-105"
                  style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                ></div>
                <span className="text-[10px] font-bold mt-3 transition-colors text-gray-500 group-hover:text-white">{d.month}</span>
              </div>
            );
          })}
          <div className="absolute bottom-6 left-0 right-0 h-px bg-[#333]"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl border mb-8 shadow-2xl transition-colors bg-[#0a0a0a] border-white/5">
        <h3 className="text-[#FFD700] text-xs font-black uppercase tracking-[0.3em] mb-8 border-b border-[#FFD700]/10 pb-4 italic">Tambah Rekod Baru</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Tarikh</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Nama Pelanggan</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800" 
              placeholder="NAMA PENUH"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Butiran</label>
            <input 
              type="text" 
              value={detail} 
              onChange={e => setDetail(e.target.value)} 
              className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800" 
              placeholder="Cth: AKUAN BERKANUN"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Amaun (RM)</label>
            <input 
              type="number" 
              step="0.01"
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold placeholder:text-gray-800" 
              placeholder="10.00"
            />
          </div>
        </div>
        <button type="submit" className="w-full md:w-auto px-12 py-4 bg-[#FFD700] text-black font-black rounded-full hover:bg-white transition-all uppercase shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-95 text-xs tracking-widest">
          SIMPAN REKOD PJS BARU
        </button>
      </form>

      <div className="overflow-x-auto rounded-3xl border shadow-2xl transition-colors border-white/5 bg-[#0a0a0a]">
        {selectedIds.length > 0 && (
          <div className="bg-[#FFD700]/10 border-b border-[#FFD700]/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
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
        <table className="w-full text-left border-collapse">
          <thead className="bg-black border-b border-white/5">
            <tr className="text-[9px] uppercase font-black tracking-[0.2em] text-gray-500">
              <th className="p-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="accent-[#FFD700] w-4 h-4 cursor-pointer"
                  checked={sortedRecords.length > 0 && selectedIds.length === sortedRecords.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(sortedRecords.map(r => r.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
              <th 
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors select-none"
                onClick={() => handleSort('date')}
              >
                Tarikh {getSortIcon('date')}
              </th>
              <th className="p-4">Nama Pelanggan</th>
              <th className="p-4">Butiran</th>
              <th 
                className="p-4 text-right cursor-pointer hover:bg-white/5 transition-colors select-none"
                onClick={() => handleSort('amount')}
              >
                Amaun (RM) {getSortIcon('amount')}
              </th>
              <th className="p-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y transition-colors divide-[#333]">
            {sortedRecords.length === 0 ? (
              <tr><td colSpan={6} className="p-20 text-center text-gray-600 font-bold uppercase italic tracking-tighter">Tiada rekod PJS ditemui dalam sistem.</td></tr>
            ) : (
              sortedRecords.map((rec) => (
                <tr key={rec.id} className="group transition-colors hover:bg-white/5">
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      className="accent-[#FFD700] w-4 h-4 cursor-pointer"
                      checked={selectedIds.includes(rec.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, rec.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== rec.id));
                        }
                      }}
                    />
                  </td>
                  <td className="p-4 text-xs font-bold tabular-nums text-gray-500">{formatDate(rec.date)}</td>
                  <td className="p-4 font-black uppercase tracking-tight text-white">{rec.name}</td>
                  <td className="p-4 text-xs italic text-gray-400">{rec.detail}</td>
                  <td className="p-4 text-right font-black tabular-nums text-lg text-[#FFD700]">
                    {rec.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleShare(rec)}
                        className="w-10 h-10 flex items-center justify-center border rounded-full transition-all bg-[#111] text-blue-500 border-white/10 hover:bg-blue-600 hover:text-white shadow-lg"
                        title="Kongsi Rekod"
                      >
                        <i className="fas fa-share-nodes text-sm"></i>
                      </button>
                      <button 
                        onClick={() => { if(confirm('Padam rekod ini kekal?')){ onDelete(rec.id); }}}
                        className="w-10 h-10 flex items-center justify-center border rounded-full transition-all bg-[#111] text-rose-500 border-white/10 hover:bg-rose-600 hover:text-white shadow-lg"
                        title="Padam Rekod"
                      >
                        <i className="fas fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PjsPage;

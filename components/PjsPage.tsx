
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { PjsRecord, ThemeMode } from '../types';
import { exportToCSV, parseCSV } from '../utils/csvUtils';

interface PjsPageProps {
  records: PjsRecord[];
  theme: ThemeMode;
  onAdd: (record: Omit<PjsRecord, 'id'>) => void;
  onDelete: (id: string) => void;
  onImport: (data: PjsRecord[]) => void;
}

type SortConfig = {
  key: keyof PjsRecord;
  direction: 'asc' | 'desc';
} | null;

const PjsPage: React.FC<PjsPageProps> = ({ records, theme, onAdd, onDelete, onImport }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
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
  const inputClass = `w-full border-2 p-3.5 rounded-xl font-bold transition-all text-black bg-white border-gray-300 focus:outline-none focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/30 outline-none`;

  return (
    <div className="animate-fadeIn">
      {shareFeedback && (
        <div className="fixed top-4 right-4 z-[300] bg-[#FFD700] text-black px-6 py-3 rounded-xl font-black shadow-2xl animate-slideUp flex items-center gap-3">
          <i className="fas fa-check-circle"></i>
          {shareFeedback}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-2xl font-black uppercase tracking-tighter leading-none ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-900'}`}>
          Rekod Pesuruhjaya Sumpah (PJS)
        </h2>
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

      <div className={`p-6 rounded-2xl border mb-8 shadow-xl transition-colors ${isDarkMode ? 'bg-[#111] border-[#333]' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-[#FFD700] rounded-full"></div>
          <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-900'}`}>
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
                <span className={`text-[10px] font-bold mt-3 transition-colors ${isDarkMode ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-900'}`}>{d.month}</span>
              </div>
            );
          })}
          <div className={`absolute bottom-6 left-0 right-0 h-px ${isDarkMode ? 'bg-[#333]' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`p-8 rounded-2xl border mb-8 shadow-lg transition-colors ${isDarkMode ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <label className={`block text-[10px] font-black uppercase mb-2 tracking-widest ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-500'}`}>Tarikh</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className={inputClass} 
            />
          </div>
          <div>
            <label className={`block text-[10px] font-black uppercase mb-2 tracking-widest ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-500'}`}>Nama Pelanggan</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className={inputClass} 
              placeholder="NAMA PENUH"
            />
          </div>
          <div>
            <label className={`block text-[10px] font-black uppercase mb-2 tracking-widest ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-500'}`}>Butiran</label>
            <input 
              type="text" 
              value={detail} 
              onChange={e => setDetail(e.target.value)} 
              className={inputClass} 
              placeholder="Cth: AKUAN BERKANUN"
            />
          </div>
          <div>
            <label className={`block text-[10px] font-black uppercase mb-2 tracking-widest ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-500'}`}>Amaun (RM)</label>
            <input 
              type="number" 
              step="0.01"
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className={inputClass} 
              placeholder="10.00"
            />
          </div>
        </div>
        <button type="submit" className="w-full md:w-auto px-12 py-4 bg-[#FFD700] text-black font-black rounded-xl hover:bg-[#FFA500] transition-all uppercase shadow-xl hover:-translate-y-0.5 active:translate-y-0">
          SIMPAN REKOD PJS BARU
        </button>
      </form>

      <div className={`overflow-x-auto rounded-2xl border shadow-xl transition-colors ${isDarkMode ? 'border-[#333] bg-[#111]' : 'border-gray-200 bg-white'}`}>
        <table className="w-full text-left">
          <thead className={isDarkMode ? 'bg-[#222]' : 'bg-gray-100'}>
            <tr className={`text-[10px] uppercase font-black tracking-widest ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-600'}`}>
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
          <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-[#333]' : 'divide-gray-100'}`}>
            {sortedRecords.length === 0 ? (
              <tr><td colSpan={5} className="p-20 text-center text-gray-600 font-bold uppercase italic tracking-tighter">Tiada rekod PJS ditemui dalam sistem.</td></tr>
            ) : (
              sortedRecords.map((rec) => (
                <tr key={rec.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <td className={`p-4 text-xs font-bold tabular-nums ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{rec.date}</td>
                  <td className={`p-4 font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rec.name}</td>
                  <td className={`p-4 text-xs italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{rec.detail}</td>
                  <td className={`p-4 text-right font-black tabular-nums text-lg ${isDarkMode ? 'text-[#FFD700]' : 'text-gray-800'}`}>
                    {rec.amount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleShare(rec)}
                        className={`w-10 h-10 flex items-center justify-center border rounded-full transition-all ${isDarkMode ? 'bg-blue-600/10 text-blue-500 border-blue-600/20 hover:bg-blue-600/40' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}
                        title="Kongsi Rekod"
                      >
                        <i className="fas fa-share-nodes text-sm"></i>
                      </button>
                      <button 
                        onClick={() => { if(confirm('Padam rekod ini kekal?')){ onDelete(rec.id); }}}
                        className={`w-10 h-10 flex items-center justify-center border rounded-full transition-all ${isDarkMode ? 'bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600/40' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
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

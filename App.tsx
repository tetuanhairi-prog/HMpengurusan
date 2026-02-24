
import React, { useState, useEffect } from 'react';
import { PageId, AppState, Client, PjsRecord, ServiceItem, LedgerEntry, ThemeMode } from './types';
import { loadFromStorage, saveToStorage } from './services/storageService';
import { syncToSheets } from './services/syncService';
import Navbar from './components/Navbar';
import Header from './components/Header';
import GuamanPage from './components/GuamanPage';
import PjsPage from './components/PjsPage';
import InventoryPage from './components/InventoryPage';
import InvoicePage from './components/InvoicePage';
import Receipt from './components/Receipt';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => loadFromStorage());
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isClosingLedger, setIsClosingLedger] = useState(false);
  const [sharedPjsRecord, setSharedPjsRecord] = useState<PjsRecord | null>(null);
  const [ledgerNotes, setLedgerNotes] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');

  useEffect(() => {
    saveToStorage(state);
    document.body.style.backgroundColor = '#000000';
  }, [state]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share-pjs=')) {
        try {
          const encodedData = hash.replace('#share-pjs=', '');
          const decodedData = JSON.parse(atob(encodedData));
          setSharedPjsRecord(decodedData);
        } catch (e) {
          console.error("Failed to decode shared record", e);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    updateState({ theme: state.theme === 'dark' ? 'light' : 'dark' });
  };

  const addClient = (client: Omit<Client, 'id' | 'ledger'>, initialFee: number) => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      ledger: [{
        date: new Date().toISOString().split('T')[0],
        desc: "FEE PROFESSIONAL DIPERSETUJUI",
        amt: initialFee
      }]
    };
    updateState({ clients: [...state.clients, newClient] });
    syncToSheets({ type: "GUAMAN", name: newClient.name, detail: newClient.detail, balance: initialFee });
  };

  const addPjsRecord = (record: Omit<PjsRecord, 'id'>) => {
    const newRecord: PjsRecord = { ...record, id: crypto.randomUUID() };
    updateState({ pjsRecords: [newRecord, ...state.pjsRecords] });
    syncToSheets({ type: "PJS", ...newRecord });
  };

  const deleteClient = (id: string) => {
    const newClients = state.clients.filter(c => c.id !== id);
    updateState({ 
      clients: newClients,
      activeClientIdx: null 
    });
  };

  const deletePjsRecord = (id: string) => updateState({ pjsRecords: state.pjsRecords.filter(r => r.id !== id) });
  const deleteService = (id: string) => updateState({ inventory: state.inventory.filter(s => s.id !== id) });

  const addService = (service: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = { ...service, id: crypto.randomUUID() };
    updateState({ inventory: [...state.inventory, newService] });
  };

  const updateLedger = (clientIdx: number, newEntry: LedgerEntry) => {
    const newClients = [...state.clients];
    if (newClients[clientIdx]) {
      newClients[clientIdx].ledger.push(newEntry);
      updateState({ clients: newClients });
    }
  };

  const deleteLedgerEntry = (clientIdx: number, entryIdx: number) => {
    const newClients = [...state.clients];
    if (newClients[clientIdx]) {
      newClients[clientIdx].ledger.splice(entryIdx, 1);
      updateState({ clients: newClients });
    }
  };

  const setCurrentPage = (page: PageId) => updateState({ currentPage: page });
  
  const handleCloseLedger = () => {
    setIsClosingLedger(true);
    setTimeout(() => {
      updateState({ activeClientIdx: null });
      setIsClosingLedger(false);
      setLedgerNotes('');
    }, 300);
  };

  const setOpenLedger = (idx: number) => {
    setIsClosingLedger(false);
    setLedgerStartDate('');
    setLedgerEndDate('');
    updateState({ activeClientIdx: idx });
  };

  const handleBackup = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `HMA_DATA_BACKUP_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Gagal melakukan backup data.");
      console.error(error);
    }
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.clients || !json.pjsRecords) {
          throw new Error("Format fail tidak sah.");
        }
        if (confirm("AMARAN: Semua data sedia ada akan dipadam dan diganti dengan data dari fail backup ini. Teruskan?")) {
          setState(json);
          alert("Data berjaya dipulihkan (Restore Complete).");
        }
      } catch (error) {
        alert("Ralat: Fail tidak sah atau rosak.");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const { currentPage, activeClientIdx, clients, pjsRecords, inventory, invCounter, firmLogo, theme } = state;
  const showLedger = currentPage === 'guaman' && activeClientIdx !== null && activeClientIdx < clients.length;
  const isDarkMode = theme === 'dark';

  return (
    <div className="min-h-screen pb-10 transition-colors duration-500 bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 no-print">
        <div className="rounded-xl border shadow-2xl overflow-hidden transition-all bg-[#0a0a0a] border-[#222]">
          <Header 
            logo={firmLogo} 
            theme={theme} 
            onLogoChange={(logo) => updateState({ firmLogo: logo })} 
            onToggleTheme={toggleTheme}
            onBackup={handleBackup}
            onRestore={handleRestore}
          />
          <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
          
          <main className="p-6 md:p-10">
            {currentPage === 'guaman' && (
              <GuamanPage 
                clients={clients} 
                theme={theme}
                onAdd={addClient} 
                onDelete={deleteClient}
                onOpenLedger={setOpenLedger}
                onImport={(data) => updateState({ clients: data, activeClientIdx: null })}
              />
            )}
            {currentPage === 'pjs' && (
              <PjsPage 
                records={pjsRecords} 
                theme={theme}
                onAdd={addPjsRecord} 
                onDelete={deletePjsRecord}
                onImport={(data) => updateState({ pjsRecords: data })}
              />
            )}
            {currentPage === 'inventory' && (
              <InventoryPage 
                services={inventory} 
                theme={theme}
                onAdd={addService} 
                onDelete={deleteService}
                onImport={(data) => updateState({ inventory: data })}
              />
            )}
            {currentPage === 'invoice' && (
              <InvoicePage 
                clients={clients} 
                services={inventory} 
                invCounter={invCounter}
                onProcessPayment={(receipt) => {
                  setReceiptData(receipt);
                  updateState({ invCounter: invCounter + 1 });
                }}
              />
            )}
          </main>
        </div>
      </div>

      {showLedger && activeClientIdx !== null && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300 ${isClosingLedger ? 'animate-fadeOut' : 'animate-fadeIn'} print:bg-white print:p-0 print:static print:z-auto`}
          onClick={handleCloseLedger}
        >
          <div 
            className={`bg-[#0a0a0a] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-[6px] border-[#FFD700] transition-all duration-300 ${isClosingLedger ? 'animate-slideDown' : 'animate-slideUp'} print:max-h-none print:shadow-none print:border-0 print:static print:w-full`}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 bg-black text-white flex justify-between items-center relative overflow-hidden print:bg-white print:text-black print:border-b-2 print:border-black">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rotate-45 translate-x-16 -translate-y-16 opacity-20 print:hidden"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.3em] mb-1 print:text-gray-500">Buku Penyata Akaun Fail</p>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none text-white">{clients[activeClientIdx].name}</h2>
                <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{clients[activeClientIdx].detail}</p>
              </div>
              <div className="flex gap-3 relative z-10 no-print">
                <button 
                  onClick={() => {
                    const client = clients[activeClientIdx!];
                    let filteredLedger = client.ledger;
                    
                    if (ledgerStartDate || ledgerEndDate) {
                      filteredLedger = client.ledger.filter(t => {
                        const tDate = t.date;
                        const start = ledgerStartDate || '0000-00-00';
                        const end = ledgerEndDate || '9999-99-99';
                        return tDate >= start && tDate <= end;
                      });
                    }

                    setReceiptData({
                      docType: 'STATEMENT',
                      title: "PENYATA AKAUN FAIL",
                      customer: client.name,
                      customerAddress: client.address,
                      customerPhone: client.phone,
                      docNo: `STMT-${Date.now().toString().slice(-6)}`,
                      date: new Date().toLocaleDateString('en-MY'),
                      notes: ledgerNotes,
                      items: filteredLedger.map(t => ({ 
                        name: `[${t.date}] - ${t.desc}`, 
                        price: t.amt 
                      })),
                      total: filteredLedger.reduce((s, t) => s + t.amt, 0),
                      isStatement: true,
                      autoPrint: true
                    });
                  }}
                  className="bg-[#FFD700] text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-[#FFA500] transition-all shadow-lg active:scale-95 border border-black/10"
                >
                  <i className="fas fa-print mr-2"></i> Jana & Cetak Penyata
                </button>
                <button 
                  onClick={handleCloseLedger} 
                  className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-700 transition-all shadow-lg active:scale-95 border border-red-800/20"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-[#0f0f0f] flex-grow print:bg-white print:overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
                <div className="bg-[#111] p-6 rounded-2xl shadow-sm border border-[#222] md:col-span-2">
                  <p className="text-[10px] font-black uppercase text-[#FFD700] mb-4 tracking-widest text-center italic">Masukkan Transaksi Baru</p>
                  <LedgerForm onAdd={(entry) => updateLedger(activeClientIdx!, entry)} />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-[#111] p-6 rounded-2xl shadow-sm border border-[#222] flex-grow">
                    <p className="text-[10px] font-black uppercase text-[#FFD700] mb-4 tracking-widest text-center italic">Nota Untuk Penyata Ini</p>
                    <textarea 
                      value={ledgerNotes}
                      onChange={e => setLedgerNotes(e.target.value)}
                      placeholder="Contoh: Sila bayar tunggakan segera."
                      className="w-full border-2 border-[#333] bg-black text-white rounded-xl p-3 text-sm font-bold focus:border-[#FFD700] transition-all outline-none h-20 resize-none"
                    ></textarea>
                  </div>
                  <div className="bg-black p-6 rounded-2xl shadow-sm border border-[#FFD700]/30">
                    <p className="text-[10px] font-black uppercase text-[#FFD700] mb-4 tracking-widest text-center italic">Tapis Tarikh Penyata</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] font-black uppercase text-gray-500 mb-1">Mula</label>
                        <input 
                          type="date" 
                          value={ledgerStartDate}
                          onChange={e => setLedgerStartDate(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-[10px] font-bold text-white outline-none focus:border-[#FFD700]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black uppercase text-gray-500 mb-1">Hingga</label>
                        <input 
                          type="date" 
                          value={ledgerEndDate}
                          onChange={e => setLedgerEndDate(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-[10px] font-bold text-white outline-none focus:border-[#FFD700]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden border-2 border-[#FFD700]/30 rounded-2xl bg-[#0a0a0a] shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black text-[#FFD700] text-[10px] uppercase font-black tracking-widest print:bg-gray-100 print:text-black">
                      <th className="p-4">Tarikh</th>
                      <th className="p-4">Butiran Transaksi</th>
                      <th className="p-4 text-right">Debit/Kredit (RM)</th>
                      <th className="p-4 w-12 no-print"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {clients[activeClientIdx].ledger.map((t, i) => (
                      <tr key={i} className="text-sm hover:bg-white/5 transition-colors group print:hover:bg-transparent">
                        <td className="p-4 text-gray-500 font-bold tabular-nums whitespace-nowrap print:text-black">{t.date}</td>
                        <td className="p-4 text-white font-black uppercase tracking-tight leading-tight">{t.desc}</td>
                        <td className={`p-4 text-right font-black text-lg tabular-nums tracking-tighter ${t.amt < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.amt.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center no-print">
                          <button 
                            onClick={() => deleteLedgerEntry(activeClientIdx!, i)} 
                            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"
                            title="Padam Rekod"
                          >
                            <i className="fas fa-trash-can text-xs"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-black border-t-4 border-[#FFD700] flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)] print:border-t-2 print:shadow-none">
              <div className="flex items-center gap-4 print:hidden">
                <div className="w-12 h-12 rounded-2xl bg-[#111] flex items-center justify-center text-[#FFD700] shadow-inner border border-[#222]">
                  <i className="fas fa-calculator text-xl"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ringkasan Fail</p>
                  <p className="text-xs font-bold text-gray-300 uppercase">{clients[activeClientIdx].ledger.length} Transaksi Direkod</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1 italic">Jumlah Baki Akhir</p>
                <div className={`text-4xl font-black tracking-tighter tabular-nums ${clients[activeClientIdx].ledger.reduce((s,t) => s + t.amt, 0) > 0 ? 'text-rose-400' : 'text-emerald-400'} print:text-black`}>
                  RM {clients[activeClientIdx].ledger.reduce((s,t) => s + t.amt, 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {receiptData && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl overflow-y-auto p-4 md:p-10 animate-fadeIn print:bg-white print:p-0 print:static print:overflow-visible">
           <div className="max-w-[148mm] mx-auto shadow-[0_0_100px_rgba(0,0,0,0.5)] print:shadow-none print:max-w-none print:mx-0">
            <Receipt data={receiptData} logo={firmLogo} onClose={() => setReceiptData(null)} />
           </div>
        </div>
      )}

      {sharedPjsRecord && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-6 animate-fadeIn">
          <div className="bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl max-w-md w-full animate-slideUp border-[8px] border-[#111]">
            <div className="bg-black text-[#FFD700] p-6 text-center border-b border-[#FFD700]/20">
              <i className="fas fa-stamp text-4xl mb-2"></i>
              <h2 className="text-xl font-black uppercase tracking-tighter">Rekod PJS Dikongsi</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="border-b border-[#222] pb-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nama Pelanggan</p>
                <p className="text-xl font-black text-white uppercase leading-none">{sharedPjsRecord.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tarikh</p>
                  <p className="font-bold text-gray-300">{sharedPjsRecord.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Amaun Bayaran</p>
                  <p className="text-xl font-black text-[#FFD700]">RM {sharedPjsRecord.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-black p-4 rounded-xl border border-[#222] italic">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 not-italic">Butiran Servis</p>
                <p className="text-gray-300 uppercase font-bold text-sm">{sharedPjsRecord.detail}</p>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => {
                    setSharedPjsRecord(null);
                    window.location.hash = '';
                  }}
                  className="w-full bg-[#FFD700] text-black py-4 rounded-xl font-black uppercase tracking-tighter hover:bg-[#FFA500] transition-all shadow-lg"
                >
                  Tutup Paparan
                </button>
              </div>
            </div>
            <div className="bg-[#111] p-2 text-center text-[8px] font-black uppercase tracking-widest text-[#FFD700]/50">
              Hairi Mustafa Associates - Sistem Pengurusan PJS
            </div>
          </div>
        </div>
      )}
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Tarikh</label>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          className="w-full border-2 border-[#333] bg-black text-white rounded-xl p-3 text-sm font-bold focus:border-[#FFD700] transition-all outline-none" 
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Keterangan</label>
        <input 
          type="text" 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
          placeholder="Cth: BAYARAN ANSURAN" 
          className="w-full border-2 border-[#333] bg-black text-white rounded-xl p-3 text-sm font-bold focus:border-[#FFD700] transition-all outline-none uppercase" 
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Amaun (+/-)</label>
        <div className="flex gap-2">
          <input 
            type="number" 
            step="0.01" 
            value={amt} 
            onChange={e => setAmt(e.target.value)} 
            placeholder="500 / -500" 
            className="w-full border-2 border-[#333] bg-black text-white rounded-xl p-3 text-sm font-bold focus:border-[#FFD700] transition-all outline-none" 
          />
          <button 
            type="submit" 
            className="bg-[#FFD700] text-black px-6 py-3 rounded-xl font-black text-sm hover:bg-[#FFA500] transition-all shadow-lg active:scale-95"
          >
            SIMPAN
          </button>
        </div>
      </div>
    </form>
  );
};

export default App;

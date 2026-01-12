
import React, { useState, useEffect } from 'react';
import { PageId, AppState, Client, PjsRecord, ServiceItem, LedgerEntry } from './types';
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
  // Use lazy initialization for performance and reliable persistence on refresh
  const [state, setState] = useState<AppState>(() => loadFromStorage());
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isClosingLedger, setIsClosingLedger] = useState(false);
  const [sharedPjsRecord, setSharedPjsRecord] = useState<PjsRecord | null>(null);

  // Automatically save state to storage whenever it changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Check for shared records in URL hash
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
    // Sync with index.html animation duration (0.3s)
    setTimeout(() => {
      updateState({ activeClientIdx: null });
      setIsClosingLedger(false);
    }, 300);
  };

  const setOpenLedger = (idx: number) => {
    setIsClosingLedger(false);
    updateState({ activeClientIdx: idx });
  };

  const { currentPage, activeClientIdx, clients, pjsRecords, inventory, invCounter, firmLogo } = state;
  
  const showLedger = currentPage === 'guaman' && activeClientIdx !== null && activeClientIdx < clients.length;

  return (
    <div className="min-h-screen pb-10">
      <div className="max-w-6xl mx-auto px-4 py-8 no-print">
        <div className="bg-[#111] rounded-xl border border-[#333] shadow-2xl overflow-hidden">
          <Header logo={firmLogo} onLogoChange={(logo) => updateState({ firmLogo: logo })} />
          <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
          
          <main className="p-6 md:p-10">
            {currentPage === 'guaman' && (
              <GuamanPage 
                clients={clients} 
                onAdd={addClient} 
                onDelete={deleteClient}
                onOpenLedger={setOpenLedger}
                onImport={(data) => updateState({ clients: data, activeClientIdx: null })}
              />
            )}
            {currentPage === 'pjs' && (
              <PjsPage 
                records={pjsRecords} 
                onAdd={addPjsRecord} 
                onDelete={deletePjsRecord}
                onImport={(data) => updateState({ pjsRecords: data })}
              />
            )}
            {currentPage === 'inventory' && (
              <InventoryPage 
                services={inventory} 
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
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 no-print transition-all duration-300 ${isClosingLedger ? 'animate-fadeOut' : 'animate-fadeIn'}`}
          onClick={handleCloseLedger}
        >
          <div 
            className={`bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-[6px] border-black transition-all duration-300 ${isClosingLedger ? 'animate-slideDown' : 'animate-slideUp'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-black text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rotate-45 translate-x-16 -translate-y-16 opacity-10"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.3em] mb-1">Penyata Akaun Fail</p>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">{clients[activeClientIdx].name}</h2>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{clients[activeClientIdx].detail}</p>
              </div>
              <div className="flex gap-3 relative z-10">
                <button 
                  onClick={() => {
                    const client = clients[activeClientIdx!];
                    setReceiptData({
                      title: "PENYATA AKAUN FAIL",
                      customer: client.name,
                      docNo: `STMT-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      items: client.ledger.map(t => ({ name: `${t.date} - ${t.desc}`, price: t.amt })),
                      total: client.ledger.reduce((s, t) => s + t.amt, 0),
                      isStatement: true
                    });
                  }}
                  className="bg-[#FFD700] text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-[#FFA500] transition-all shadow-lg active:scale-95"
                >
                  <i className="fas fa-print mr-2"></i> Cetak Penyata
                </button>
                <button 
                  onClick={handleCloseLedger} 
                  className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-700 transition-all shadow-lg active:scale-95 border border-red-800/20"
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50 flex-grow">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest text-center">Rekod Transaksi Baru</p>
                <LedgerForm onAdd={(entry) => updateLedger(activeClientIdx!, entry)} />
              </div>
              
              <div className="overflow-hidden border-2 border-black rounded-2xl bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black text-white text-[10px] uppercase font-black tracking-widest">
                      <th className="p-4">Tarikh</th>
                      <th className="p-4">Keterangan Transaksi</th>
                      <th className="p-4 text-right">Amaun (RM)</th>
                      <th className="p-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clients[activeClientIdx].ledger.map((t, i) => (
                      <tr key={i} className="text-sm hover:bg-gray-50 transition-colors group">
                        <td className="p-4 text-gray-400 font-bold tabular-nums whitespace-nowrap">{t.date}</td>
                        <td className="p-4 text-gray-900 font-black uppercase tracking-tight">{t.desc}</td>
                        <td className={`p-4 text-right font-black text-lg tabular-nums tracking-tighter ${t.amt < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {t.amt.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => deleteLedgerEntry(activeClientIdx!, i)} 
                            className="w-8 h-8 flex items-center justify-center text-gray-200 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
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

            {/* Modal Footer Summary */}
            <div className="p-6 bg-white border-t-4 border-black flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                  <i className="fas fa-calculator"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statistik Fail</p>
                  <p className="text-xs font-bold text-gray-600 uppercase">{clients[activeClientIdx].ledger.length} Transaksi Direkodkan</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 italic">Baki Tertunggak Keseluruhan</p>
                <div className={`text-4xl font-black tracking-tighter tabular-nums ${clients[activeClientIdx].ledger.reduce((s,t) => s + t.amt, 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  RM {clients[activeClientIdx].ledger.reduce((s,t) => s + t.amt, 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {receiptData && (
        <div id="receipt-print" className="fixed inset-0 z-[100] bg-white overflow-y-auto p-4 md:p-10 no-print-backdrop">
           <div className="max-w-[148mm] mx-auto">
            <Receipt data={receiptData} logo={firmLogo} onClose={() => setReceiptData(null)} />
           </div>
        </div>
      )}

      {sharedPjsRecord && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full animate-slideUp border-[8px] border-black">
            <div className="bg-black text-[#FFD700] p-6 text-center">
              <i className="fas fa-stamp text-4xl mb-2"></i>
              <h2 className="text-xl font-black uppercase tracking-tighter">Rekod PJS Dikongsi</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="border-b pb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nama Pelanggan</p>
                <p className="text-xl font-black text-black uppercase leading-none">{sharedPjsRecord.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tarikh</p>
                  <p className="font-bold text-gray-800">{sharedPjsRecord.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amaun Bayaran</p>
                  <p className="text-xl font-black text-black">RM {sharedPjsRecord.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 not-italic">Butiran Servis</p>
                <p className="text-gray-600 uppercase font-bold text-sm">{sharedPjsRecord.detail}</p>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => {
                    setSharedPjsRecord(null);
                    window.location.hash = '';
                  }}
                  className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-tighter hover:bg-gray-800 transition-all"
                >
                  Tutup Paparan
                </button>
              </div>
            </div>
            <div className="bg-[#FFD700] p-2 text-center text-[8px] font-black uppercase tracking-widest text-black">
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Tarikh</label>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-black transition-all outline-none" 
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Keterangan Caj / Bayaran</label>
        <input 
          type="text" 
          value={desc} 
          onChange={e => setDesc(e.target.value)} 
          placeholder="Cth: Bayaran Ansuran / Caj Tambahan Fail" 
          className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-black transition-all outline-none uppercase" 
        />
      </div>
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Amaun (RM)</label>
        <div className="flex gap-2">
          <input 
            type="number" 
            step="0.01" 
            value={amt} 
            onChange={e => setAmt(e.target.value)} 
            placeholder="Cth: 500 atau -500" 
            className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-black transition-all outline-none" 
          />
          <button 
            type="submit" 
            className="bg-black text-[#FFD700] px-6 py-3 rounded-xl font-black text-sm hover:bg-gray-800 transition-all shadow-lg active:scale-95"
          >
            SIMPAN
          </button>
        </div>
      </div>
    </form>
  );
};

export default App;

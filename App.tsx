
import React, { useState, useEffect, useRef } from 'react';
import { PageId, AppState, Client, PjsRecord, ServiceItem, LedgerEntry, ThemeMode } from './types';
import { loadFromStorage, saveToStorage } from './services/storageService';
import { syncToSheets } from './services/syncService';
import { formatDate } from './utils/dateUtils';
import Navbar from './components/Navbar';
import Header from './components/Header';
import GuamanPage from './components/GuamanPage';
import InvoicePage from './components/InvoicePage';
import Receipt from './components/Receipt';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => loadFromStorage());
  const [receiptData, setReceiptData] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveToStorage(state);
    document.body.style.backgroundColor = '#000000';
  }, [state]);

  useEffect(() => {
    if (receiptData && receiptRef.current) {
      receiptRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [receiptData]);

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

  const deleteClient = (id: string) => {
    const newClients = state.clients.filter(c => c.id !== id);
    updateState({ 
      clients: newClients,
      activeClientIdx: null 
    });
  };

  const deleteMultipleClients = (ids: string[]) => {
    const newClients = state.clients.filter(c => !ids.includes(c.id));
    updateState({ 
      clients: newClients,
      activeClientIdx: null 
    });
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
  
  const handlePrintStatement = (clientIdx: number, notes: string, startDate: string, endDate: string) => {
    const client = state.clients[clientIdx];
    let filteredLedger = client.ledger;
    
    if (startDate || endDate) {
      filteredLedger = client.ledger.filter(t => {
        const tDate = t.date;
        const s = startDate || '0000-00-00';
        const e = endDate || '9999-99-99';
        return tDate >= s && tDate <= e;
      });
    }

    setReceiptData({
      docType: 'STATEMENT',
      title: "PENYATA AKAUN FAIL",
      customer: client.name,
      customerAddress: client.address,
      customerPhone: client.phone,
      docNo: `STMT-${Date.now().toString().slice(-6)}`,
      date: formatDate(new Date().toISOString().split('T')[0]),
      notes: notes,
      customHeader: state.customHeader,
      customFooter: state.customFooter,
      items: filteredLedger.map(t => ({ 
        name: `[${formatDate(t.date)}] - ${t.desc}`, 
        price: t.amt 
      })),
      total: filteredLedger.reduce((s, t) => s + t.amt, 0),
      isStatement: true,
      autoPrint: true
    });
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
        <div className="rounded-3xl border shadow-2xl overflow-hidden transition-all bg-[#0a0a0a] border-white/5">
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
                onBulkDelete={deleteMultipleClients}
                onImport={(data) => updateState({ clients: data, activeClientIdx: null })}
                onAddLedger={updateLedger}
                onDeleteLedger={deleteLedgerEntry}
                onPrintStatement={handlePrintStatement}
              />
            )}
            {currentPage === 'invoice' && (
              <InvoicePage 
                clients={clients} 
                invCounter={invCounter}
                customHeader={state.customHeader}
                customFooter={state.customFooter}
                companyAddress={state.companyAddress}
                companyContact={state.companyContact}
                defaultPrintMode={state.defaultPrintMode || 'standard'}
                onUpdateSettings={(updates) => updateState(updates)}
                onProcessPayment={(receipt) => {
                  setReceiptData(receipt);
                  updateState({ invCounter: invCounter + 1 });
                }}
                onPreviewOnly={(receipt) => {
                  setReceiptData(receipt);
                }}
              />
            )}
          </main>
        </div>
      </div>

      {receiptData && (
        <div ref={receiptRef} className="max-w-6xl mx-auto px-4 py-12 animate-fadeIn border-t border-white/5 mt-10 print:m-0 print:p-0 print:border-none">
           <div className="text-center mb-8 no-print">
             <h3 className="text-[#FFD700] text-xs font-black uppercase tracking-[0.4em] italic mb-2">Pratinjau Dokumen Rasmi</h3>
             <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sila semak butiran sebelum mencetak atau menyimpan</p>
           </div>
           <div className="w-full overflow-x-auto pb-4 custom-scrollbar print:overflow-visible print:pb-0">
             <div className="w-[148mm] md:mx-auto shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 rounded-3xl overflow-hidden bg-white mx-auto shrink-0 print:shadow-none print:border-none print:rounded-none">
              <Receipt data={receiptData} logo={firmLogo} onClose={() => setReceiptData(null)} />
             </div>
           </div>
        </div>
      )}

      {/* Print-only container (hidden on screen) */}
      {receiptData && (
        <div className="hidden print:block">
          <Receipt data={receiptData} logo={firmLogo} onClose={() => setReceiptData(null)} />
        </div>
      )}
    </div>
  );
};

export default App;

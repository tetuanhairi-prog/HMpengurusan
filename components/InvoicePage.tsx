
import React, { useState, useEffect } from 'react';
import { Client, ServiceItem } from '../types';

type DocType = 'RECEIPT' | 'INVOICE' | 'QUOTATION';

interface InvoicePageProps {
  clients: Client[];
  services: ServiceItem[];
  invCounter: number;
  customHeader: string;
  customFooter: string;
  onUpdateSettings: (updates: Partial<{ customHeader: string; customFooter: string }>) => void;
  onProcessPayment: (receiptData: any) => void;
}

interface InvoiceLineItem {
  name: string;
  price: number;
  quantity: number;
}

const InvoicePage: React.FC<InvoicePageProps> = ({ 
  clients, services, invCounter, customHeader, customFooter, onUpdateSettings, onProcessPayment 
}) => {
  const [docType, setDocType] = useState<DocType>('RECEIPT');
  const [invNo, setInvNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState('TUNAI');
  const [paymentRef, setPaymentRef] = useState('');
  
  // Manual entry state
  const [manualDesc, setManualDesc] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [manualPrice, setManualPrice] = useState('');

  const [notes, setNotes] = useState('');
  const [currentItems, setCurrentItems] = useState<InvoiceLineItem[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  
  const [importStartDate, setImportStartDate] = useState('');
  const [importEndDate, setImportEndDate] = useState('');
  
  useEffect(() => {
    const year = new Date().getFullYear();
    const prefix = docType === 'RECEIPT' ? 'RES' : docType === 'INVOICE' ? 'INV' : 'QTN';
    setInvNo(`${prefix}-${year}${String(invCounter).padStart(4, '0')}`);
  }, [invCounter, docType]);

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'MANUAL') {
      setSelectedCustomer('');
      setCustomerPhone('');
      setCustomerAddress('');
      return;
    }
    
    const client = clients.find(c => c.name === val);
    if (client) {
      setSelectedCustomer(client.name);
      setCustomerAddress(client.address || client.detail || ''); 
      setCustomerPhone(client.phone || ''); 
    } else {
      setSelectedCustomer(val);
    }
  };

  const addItemFromInventory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const item = JSON.parse(val) as ServiceItem;
    setCurrentItems([...currentItems, { name: item.name, price: item.price, quantity: 1 }]);
    e.target.value = ""; 
  };

  const handleManualAdd = () => {
    if (!manualDesc.trim()) {
      alert("Sila masukkan butiran perkhidmatan.");
      return;
    }
    const newItem: InvoiceLineItem = {
      name: manualDesc.toUpperCase(),
      price: parseFloat(manualPrice) || 0,
      quantity: parseInt(manualQty) || 1
    };
    setCurrentItems([...currentItems, newItem]);
    setManualDesc('');
    setManualQty('1');
    setManualPrice('');
  };

  const addEmptyRow = () => {
    setCurrentItems([...currentItems, { name: '', price: 0, quantity: 1 }]);
  };

  const updateItem = (idx: number, field: keyof InvoiceLineItem, value: string) => {
    const newItems = [...currentItems];
    if (field === 'price') {
      newItems[idx].price = value === '' ? 0 : parseFloat(value);
    } else if (field === 'quantity') {
      newItems[idx].quantity = value === '' ? 0 : parseInt(value);
    } else if (field === 'name') {
      newItems[idx].name = value.toUpperCase();
    }
    setCurrentItems(newItems);
  };

  const removeItem = (idx: number) => {
    setCurrentItems(currentItems.filter((_, i) => i !== idx));
  };

  const total = currentItems.reduce((s, i) => s + (i.price * i.quantity), 0);

  const processInvoice = (mode: 'standard' | 'thermal', autoPrint: boolean = true) => {
    if (!selectedCustomer) {
      setShowValidation(true);
      return;
    }
    if (currentItems.length === 0) return alert("Sila tambah item ke dalam senarai!");

    const titleMap = {
      'RECEIPT': 'RESIT RASMI',
      'INVOICE': 'INVOIS',
      'QUOTATION': 'SEBUTHARGA'
    };

    onProcessPayment({
      docType,
      title: titleMap[docType],
      customer: selectedCustomer,
      customerPhone,
      customerAddress,
      docNo: invNo,
      date: date,
      notes: notes,
      customHeader,
      customFooter,
      paymentMethod,
      paymentRef,
      items: currentItems.map(it => ({
        name: it.quantity > 1 ? `${it.name} (x${it.quantity})` : it.name,
        price: it.price * it.quantity
      })),
      total: total,
      autoPrint: autoPrint,
      printMode: mode
    });

    setCurrentItems([]);
    setNotes('');
    setShowValidation(false);
    setSelectedCustomer('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  const addQuickNote = (text: string) => {
    setNotes(prev => prev ? `${prev}\n${text}` : text);
  };

  const pullLedgerData = () => {
    const client = clients.find(c => c.name === selectedCustomer);
    if (!client) return alert("Sila pilih pelanggan guaman yang sah untuk menarik data ledger!");
    
    const filtered = client.ledger.filter(t => {
      const tDate = t.date;
      const start = importStartDate || '0000-00-00';
      const end = importEndDate || '9999-99-99';
      return tDate >= start && tDate <= end;
    });
    
    if (filtered.length === 0) return alert("Tiada transaksi ditemui dalam julat tarikh tersebut.");
    
    const newItems: InvoiceLineItem[] = filtered.map(t => ({
      name: `[${t.date}] ${t.desc}`,
      price: t.amt,
      quantity: 1
    }));
    
    setCurrentItems([...currentItems, ...newItems]);
    alert(`${newItems.length} transaksi telah ditarik masuk.`);
  };

  const hmInputClass = "w-full border-2 border-[#333] bg-black p-4 rounded-xl font-bold text-white focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/20 outline-none transition-all shadow-sm";

  return (
    <div className="animate-fadeIn space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Penjanaan Dokumen Rasmi</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1 italic">Resit Rasmi • Invois • Sebutharga</p>
        </div>
        <div className="bg-[#0a0a0a] p-2 rounded-2xl flex gap-1 border border-white/10 shadow-2xl">
          {(['RECEIPT', 'INVOICE', 'QUOTATION'] as DocType[]).map((type) => (
            <button
              key={type}
              onClick={() => setDocType(type)}
              className={`py-3 px-10 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                docType === type 
                ? 'bg-[#FFD700] text-black shadow-[0_0_25px_rgba(255,215,0,0.3)] scale-[1.05]' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {type === 'RECEIPT' ? 'Resit' : type === 'INVOICE' ? 'Invois' : 'Sebutharga'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-4 space-y-8">
          {/* Reference & Date Card */}
          <div className="bg-[#0a0a0a] p-8 rounded-[32px] border border-white/5 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">No. Rujukan Dokumen</label>
              <div className="text-3xl font-black tracking-[0.1em] tabular-nums text-[#FFD700] bg-black p-6 rounded-2xl border-2 border-[#FFD700]/30 text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                {invNo}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Tarikh Dokumen</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold"
              />
            </div>
          </div>

          {/* Document Settings Card */}
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl space-y-6">
            <h3 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] border-b border-[#FFD700]/10 pb-4 italic">Tetapan Dokumen</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Custom Header (Atas)</label>
                <input 
                  type="text" 
                  value={customHeader}
                  onChange={e => onUpdateSettings({ customHeader: e.target.value.toUpperCase() })}
                  placeholder="CTH: PEGUAM SYARIE & PESURUHJAYA SUMPAH"
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Custom Footer (Bawah)</label>
                <input 
                  type="text" 
                  value={customFooter}
                  onChange={e => onUpdateSettings({ customFooter: e.target.value.toUpperCase() })}
                  placeholder="CTH: TERIMA KASIH ATAS URUSAN ANDA"
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold uppercase"
                />
              </div>
            </div>
          </div>

          {/* Customer Selection Card */}
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl space-y-6">
            <h3 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] border-b border-[#FFD700]/10 pb-4 italic">Maklumat Penerima</h3>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Carian Klien Guaman</label>
                <select 
                  onChange={handleCustomerSelect}
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold cursor-pointer"
                >
                  <option value="MANUAL">-- MASUKKAN MANUAL --</option>
                  {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  <option value="PELANGGAN TUNAI">PELANGGAN TUNAI (CASH)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`block text-[9px] font-black uppercase tracking-widest ml-1 ${showValidation && !selectedCustomer ? 'text-rose-500' : 'text-gray-500'}`}>
                  Nama Penuh {showValidation && !selectedCustomer && "(! WAJIB)"}
                </label>
                <input 
                  type="text" 
                  value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value.toUpperCase())}
                  placeholder="NAMA PENUH"
                  className={`w-full bg-black border text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold uppercase ${showValidation && !selectedCustomer ? 'border-rose-500 bg-rose-500/5' : 'border-white/10'}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">No. Telefon</label>
                <input 
                  type="text" 
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="012..."
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Alamat Penuh</label>
                <textarea 
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value.toUpperCase())}
                  placeholder="ALAMAT LENGKAP..."
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold h-24 resize-none uppercase"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl space-y-6">
            <h3 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] border-b border-[#FFD700]/10 pb-4 italic">Maklumat Pembayaran</h3>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Kaedah Pembayaran</label>
                <select 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold cursor-pointer"
                >
                  <option value="TUNAI">TUNAI (CASH)</option>
                  <option value="PINDAHAN BANK">PINDAHAN BANK (ONLINE TRANSFER)</option>
                  <option value="CEK">CEK (CHEQUE)</option>
                  <option value="KAD KREDIT/DEBIT">KAD KREDIT / DEBIT</option>
                  <option value="LAIN-LAIN">LAIN-LAIN</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">No. Rujukan Transaksi / Cek</label>
                <input 
                  type="text" 
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value.toUpperCase())}
                  placeholder="CTH: REF123456789"
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Items & Actions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Item Entry Area */}
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <h3 className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] italic">Butiran Perkhidmatan</h3>
              <div className="flex gap-4">
                <select 
                  onChange={addItemFromInventory}
                  className="bg-black border border-[#FFD700]/30 text-[#FFD700] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-[#FFD700]/10 transition-all"
                >
                  <option value="">+ Dari Inventori</option>
                  {services.map(s => (
                    <option key={s.id} value={JSON.stringify(s)}>{s.name} - RM{s.price.toFixed(2)}</option>
                  ))}
                </select>
                <button 
                  onClick={addEmptyRow}
                  className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  + Baris Kosong
                </button>
              </div>
            </div>

            {/* Manual Entry Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 bg-black/50 p-6 rounded-2xl border border-white/5">
              <div className="md:col-span-6 space-y-1.5">
                <label className="block text-[8px] font-black uppercase text-gray-600 tracking-widest ml-1">Keterangan Manual</label>
                <input 
                  type="text" 
                  value={manualDesc}
                  onChange={e => setManualDesc(e.target.value)}
                  placeholder="CTH: CAJ PENGURUSAN..."
                  className="w-full bg-black border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-[#FFD700] text-xs font-bold uppercase"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-[8px] font-black uppercase text-gray-600 tracking-widest ml-1">Unit</label>
                <input 
                  type="number" 
                  value={manualQty}
                  onChange={e => setManualQty(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-[#FFD700] text-xs font-bold text-center"
                />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-[8px] font-black uppercase text-gray-600 tracking-widest ml-1">Harga (RM)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={manualPrice}
                  onChange={e => setManualPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-[#FFD700] text-xs font-bold text-right"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
                <button 
                  onClick={handleManualAdd}
                  className="w-full h-[42px] bg-[#FFD700] text-black rounded-xl flex items-center justify-center hover:bg-[#FFA500] transition-all shadow-lg active:scale-95"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            {/* Item List Table */}
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-gray-500 text-[9px] font-black uppercase tracking-widest">
                    <th className="p-4">Butiran</th>
                    <th className="p-4 text-center w-20">Unit</th>
                    <th className="p-4 text-right w-32">Harga (RM)</th>
                    <th className="p-4 text-right w-32">Subtotal</th>
                    <th className="p-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentItems.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-gray-700 text-[10px] font-bold uppercase tracking-widest italic">Senarai item masih kosong.</td></tr>
                  ) : (
                    currentItems.map((it, idx) => (
                      <tr key={idx} className="group hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <input 
                            type="text" 
                            value={it.name}
                            onChange={(e) => updateItem(idx, 'name', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-white font-bold text-sm uppercase p-0"
                          />
                        </td>
                        <td className="p-4">
                          <input 
                            type="number" 
                            value={it.quantity}
                            onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-white font-bold text-sm text-center p-0"
                          />
                        </td>
                        <td className="p-4">
                          <input 
                            type="number" 
                            step="0.01"
                            value={it.price || ''}
                            onChange={(e) => updateItem(idx, 'price', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-white font-bold text-sm text-right p-0"
                          />
                        </td>
                        <td className="p-4 text-right font-black text-white tabular-nums">
                          {(it.price * it.quantity).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => removeItem(idx)} className="text-gray-700 hover:text-rose-500 transition-colors">
                            <i className="fas fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer: Summary & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Notes & Ledger Pull */}
            <div className="space-y-6">
              <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl space-y-4">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Nota Tambahan</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Nota untuk dipaparkan di dokumen..."
                  className="w-full bg-black border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:border-[#FFD700] transition-all text-sm font-bold h-32 resize-none"
                ></textarea>
              </div>
              
              <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-[#FFD700]/10 shadow-2xl flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase text-[#FFD700] tracking-widest mb-2 italic">Tarik Data Ledger</p>
                  <div className="flex gap-2">
                    <input type="date" value={importStartDate} onChange={e => setImportStartDate(e.target.value)} className="bg-black border border-white/5 text-[10px] p-2 rounded-lg text-white outline-none w-full" />
                    <input type="date" value={importEndDate} onChange={e => setImportEndDate(e.target.value)} className="bg-black border border-white/5 text-[10px] p-2 rounded-lg text-white outline-none w-full" />
                  </div>
                </div>
                <button onClick={pullLedgerData} disabled={!clients.some(c => c.name === selectedCustomer)} className="bg-[#FFD700] text-black w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#FFA500] transition-all disabled:opacity-20 shadow-lg">
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>

            {/* Total & Finalize */}
            <div className="bg-[#0a0a0a] p-10 rounded-[40px] border border-white/5 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#FFD700]"></div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6">Jumlah Keseluruhan</p>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-3xl font-black text-[#FFD700]/30">RM</span>
                  <span className="text-7xl font-black tabular-nums tracking-tighter text-white">{total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="w-full space-y-4 mt-10">
                <button 
                  onClick={() => processInvoice('standard', true)}
                  disabled={currentItems.length === 0}
                  className="w-full bg-[#FFD700] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#FFA500] transition-all shadow-xl active:scale-95 disabled:opacity-30"
                >
                  <i className="fas fa-file-pdf mr-3"></i> Jana Dokumen PDF
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => processInvoice('thermal', true)} disabled={currentItems.length === 0} className="bg-[#111] text-[#FFD700] py-4 rounded-xl font-black uppercase tracking-widest text-[9px] border border-[#FFD700]/20 hover:bg-black transition-all disabled:opacity-30">
                    Thermal (80mm)
                  </button>
                  <button onClick={() => processInvoice('standard', false)} disabled={currentItems.length === 0} className="bg-[#111] text-gray-500 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] border border-white/5 hover:bg-black transition-all disabled:opacity-30">
                    Rekod Sahaja
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;

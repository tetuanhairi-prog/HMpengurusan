
import React, { useState, useEffect } from 'react';
import { Client, ServiceItem, GeneratedDocument } from '../types';
import { formatDate } from '../utils/dateUtils';

type DocType = 'RECEIPT' | 'INVOICE' | 'QUOTATION' | 'PAYMENT_VOUCHER';

interface InvoicePageProps {
  clients: Client[];
  generatedDocs: GeneratedDocument[];
  invCounter: number;
  customHeader: string;
  customFooter: string;
  companyAddress?: string;
  companyContact?: string;
  defaultPrintMode: 'standard' | 'thermal';
  onUpdateSettings: (updates: Partial<{ customHeader: string; customFooter: string; companyAddress: string; companyContact: string; defaultPrintMode: 'standard' | 'thermal' }>) => void;
  onProcessPayment: (receiptData: any) => void;
  onPreviewOnly?: (receiptData: any) => void;
  onDeleteDocument?: (id: string) => void;
}

interface InvoiceLineItem {
  name: string;
  price: number;
  quantity: number;
}

const InvoicePage: React.FC<InvoicePageProps> = ({ 
  clients, generatedDocs, invCounter, customHeader, customFooter, companyAddress, companyContact, defaultPrintMode, onUpdateSettings, onProcessPayment, onPreviewOnly, onDeleteDocument
}) => {
  const initialDraft = React.useMemo(() => {
    try {
      const draft = localStorage.getItem('hma_invoice_draft');
      if (draft) return JSON.parse(draft);
    } catch (e) {
      console.error("Failed to load invoice draft", e);
    }
    return null;
  }, []);

  const [docType, setDocType] = useState<DocType>(initialDraft?.docType || 'RECEIPT');
  const [invNo, setInvNo] = useState('');
  const [date, setDate] = useState(initialDraft?.date || new Date().toISOString().split('T')[0]);
  
  const [selectedCustomer, setSelectedCustomer] = useState(initialDraft?.selectedCustomer || '');
  const [customerPhone, setCustomerPhone] = useState(initialDraft?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(initialDraft?.customerAddress || '');
  
  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState(initialDraft?.paymentMethod || 'TUNAI');
  const [paymentRef, setPaymentRef] = useState(initialDraft?.paymentRef || '');
  
  // Manual entry state
  const [manualDesc, setManualDesc] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [manualPrice, setManualPrice] = useState('');

  const [notes, setNotes] = useState(initialDraft?.notes || '');
  const [currentItems, setCurrentItems] = useState<InvoiceLineItem[]>(initialDraft?.currentItems || []);
  const [showValidation, setShowValidation] = useState(false);
  
  const [importStartDate, setImportStartDate] = useState('');
  const [importEndDate, setImportEndDate] = useState('');

  // Autosave effect
  useEffect(() => {
    const draft = {
      docType,
      date,
      selectedCustomer,
      customerPhone,
      customerAddress,
      paymentMethod,
      paymentRef,
      notes,
      currentItems
    };
    localStorage.setItem('hma_invoice_draft', JSON.stringify(draft));
  }, [docType, date, selectedCustomer, customerPhone, customerAddress, paymentMethod, paymentRef, notes, currentItems]);
  
  useEffect(() => {
    const year = new Date().getFullYear();
    const prefix = docType === 'RECEIPT' ? 'RES' : docType === 'INVOICE' ? 'INV' : docType === 'QUOTATION' ? 'QTN' : 'PV';
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
      'QUOTATION': 'SEBUTHARGA',
      'PAYMENT_VOUCHER': 'BAUCAR BAYARAN'
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
      companyAddress,
      companyContact,
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

    // Clear draft after processing
    localStorage.removeItem('hma_invoice_draft');

    setCurrentItems([]);
    setNotes('');
    setShowValidation(false);
    setSelectedCustomer('');
    setCustomerPhone('');
    setCustomerAddress('');
    setPaymentRef('');
  };

  const previewInvoice = () => {
    if (!selectedCustomer) {
      setShowValidation(true);
      return;
    }
    if (currentItems.length === 0) return alert("Sila tambah item ke dalam senarai sebelum pratonton!");

    const titleMap = {
      'RECEIPT': 'RESIT RASMI',
      'INVOICE': 'INVOIS',
      'QUOTATION': 'SEBUTHARGA',
      'PAYMENT_VOUCHER': 'BAUCAR BAYARAN'
    };

    if (onPreviewOnly) {
      onPreviewOnly({
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
        companyAddress,
        companyContact,
        paymentMethod,
        paymentRef,
        items: currentItems.map(it => ({
          name: it.quantity > 1 ? `${it.name} (x${it.quantity})` : it.name,
          price: it.price * it.quantity
        })),
        total: total,
        autoPrint: false,
        printMode: defaultPrintMode
      });
    }
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
      name: `[${formatDate(t.date)}] ${t.desc}`,
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
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Penjanaan Dokumen Rasmi</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">Resit Rasmi • Invois • Sebutharga • Baucar Bayaran</p>
        </div>
        <div className="bg-[#0a0a0a] p-1.5 rounded-xl flex flex-wrap gap-1 border border-white/10 shadow-xl">
          {(['RECEIPT', 'INVOICE', 'QUOTATION', 'PAYMENT_VOUCHER'] as DocType[]).map((type) => (
            <button
              key={type}
              onClick={() => setDocType(type)}
              className={`py-2 px-4 md:px-6 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                docType === type 
                ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-[1.02]' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {type === 'RECEIPT' ? 'Resit' : type === 'INVOICE' ? 'Invois' : type === 'QUOTATION' ? 'Sebutharga' : 'Baucar Bayaran'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4 h-fit">
          {/* Reference & Date Card */}
          <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-xl space-y-4">
            <div className="space-y-1">
              <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">Tarikh Dokumen</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full bg-black border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-[#FFD700] transition-all text-xs font-bold"
              />
            </div>
          </div>

          {/* Document Settings Card */}
          <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-xl space-y-4">
            <h3 className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.3em] border-b border-[#FFD700]/10 pb-2 italic flex items-center gap-2">
              <i className="fas fa-sliders-h"></i> Tetapan Dokumen
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Mod Cetakan Lalai</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateSettings({ defaultPrintMode: 'standard' })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${defaultPrintMode === 'standard' ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-black text-gray-500 border border-white/10 hover:border-[#FFD700]/50'}`}
                  >
                    Standard (A5/PDF)
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ defaultPrintMode: 'thermal' })}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${defaultPrintMode === 'thermal' ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-black text-gray-500 border border-white/10 hover:border-[#FFD700]/50'}`}
                  >
                    Thermal (80mm)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">Nama Syarikat / Header</label>
                <div className="relative">
                  <i className="fas fa-heading absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                  <input 
                    type="text" 
                    value="HAIRI MUSTAFA ASSOCIATES"
                    readOnly
                    className="w-full bg-black/50 border border-white/5 text-gray-400 p-3 pl-8 rounded-xl outline-none text-xs font-bold uppercase cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">Alamat Syarikat</label>
                <div className="relative">
                  <i className="fas fa-building absolute left-3 top-3 text-gray-500 text-xs"></i>
                  <textarea 
                    value="Lot 02, Bangunan Arked Mara, 09100 Baling, Kedah"
                    readOnly
                    className="w-full bg-black/50 border border-white/5 text-gray-400 p-3 pl-8 rounded-xl outline-none text-xs font-bold h-12 resize-none cursor-not-allowed"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">No. Tel & Emel</label>
                <div className="relative">
                  <i className="fas fa-address-book absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                  <input 
                    type="text" 
                    value="Tel: 01156531310 | Emel: tetuanhairi@gmail.com"
                    readOnly
                    className="w-full bg-black/50 border border-white/5 text-gray-400 p-3 pl-8 rounded-xl outline-none text-xs font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">Nota Kaki / Footer</label>
                <div className="relative">
                  <i className="fas fa-shoe-prints absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                  <input 
                    type="text" 
                    value={customFooter}
                    onChange={e => onUpdateSettings({ customFooter: e.target.value.toUpperCase() })}
                    placeholder="CTH: TERIMA KASIH..."
                    className="w-full bg-black border border-white/10 text-white p-3 pl-8 rounded-xl focus:outline-none focus:border-[#FFD700] transition-all text-xs font-bold uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Selection Card */}
          <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-xl space-y-4">
            <h3 className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.3em] border-b border-[#FFD700]/10 pb-2 italic flex items-center gap-2">
              <i className="fas fa-user-circle"></i> Maklumat Penerima
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">Carian Klien Guaman</label>
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                  <select 
                    onChange={handleCustomerSelect}
                    className="w-full bg-black border border-white/10 text-white p-3 pl-8 rounded-xl focus:outline-none focus:border-[#FFD700] transition-all text-xs font-bold cursor-pointer appearance-none"
                  >
                    <option value="MANUAL">-- MASUKKAN MANUAL --</option>
                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    <option value="PELANGGAN TUNAI">PELANGGAN TUNAI (CASH)</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs"></i>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`block text-[8px] font-black uppercase tracking-widest ml-1 ${showValidation && !selectedCustomer ? 'text-rose-500' : 'text-gray-500'}`}>
                  Nama Penuh {showValidation && !selectedCustomer && "(! WAJIB)"}
                </label>
                <div className="relative">
                  <i className={`fas fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-xs ${showValidation && !selectedCustomer ? 'text-rose-500' : 'text-gray-500'}`}></i>
                  <input 
                    type="text" 
                    value={selectedCustomer}
                    onChange={e => setSelectedCustomer(e.target.value.toUpperCase())}
                    placeholder="NAMA PENUH"
                    className={`w-full bg-black border text-white p-3 pl-8 rounded-xl focus:outline-none focus:border-[#FFD700] transition-all text-xs font-bold uppercase ${showValidation && !selectedCustomer ? 'border-rose-500 bg-rose-500/5' : 'border-white/10'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">No. Telefon</label>
                <div className="relative">
                  <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                  <input 
                    type="text" 
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="012..."
                    className="w-full bg-black border border-white/10 text-white p-3 pl-8 rounded-xl focus:outline-none focus:border-[#FFD700] transition-all text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">Alamat Penuh</label>
                <div className="relative">
                  <i className="fas fa-map-marker-alt absolute left-3 top-3 text-gray-500 text-xs"></i>
                  <textarea 
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value.toUpperCase())}
                    placeholder="ALAMAT LENGKAP..."
                    className="w-full bg-black border border-white/10 text-white p-3 pl-8 rounded-xl focus:outline-none focus:border-[#FFD700] transition-all text-xs font-bold h-12 resize-none uppercase"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Card - Only show for Receipt and Payment Voucher */}
          {(docType === 'RECEIPT' || docType === 'PAYMENT_VOUCHER') && (
            <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-xl space-y-4 animate-fadeIn">
              <h3 className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.3em] border-b border-[#FFD700]/10 pb-2 italic flex items-center gap-2">
                <i className="fas fa-wallet"></i> Maklumat Pembayaran
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">Kaedah Pembayaran</label>
                  <div className="relative">
                    <i className="fas fa-money-bill-wave absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                    <select 
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-black border border-white/10 text-white p-3 pl-8 rounded-xl focus:outline-none focus:border-[#FFD700] transition-all text-xs font-bold cursor-pointer appearance-none"
                    >
                      <option value="TUNAI">TUNAI (CASH)</option>
                      <option value="PINDAHAN BANK">PINDAHAN BANK (ONLINE TRANSFER)</option>
                      <option value="CEK">CEK (CHEQUE)</option>
                      <option value="KAD KREDIT/DEBIT">KAD KREDIT / DEBIT</option>
                      <option value="LAIN-LAIN">LAIN-LAIN</option>
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs"></i>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">No. Rujukan Transaksi / Cek</label>
                  <div className="relative">
                    <i className="fas fa-hashtag absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                    <input 
                      type="text" 
                      value={paymentRef}
                      onChange={e => setPaymentRef(e.target.value.toUpperCase())}
                      placeholder="CTH: REF123..."
                      className="w-full bg-black border border-white/10 text-white p-3 pl-8 rounded-xl focus:outline-none focus:border-[#FFD700] transition-all text-xs font-bold uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Items & Actions */}
        <div className="lg:col-span-8 space-y-4">
          {/* Item Entry Area */}
          <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h3 className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.3em] italic">Butiran Perkhidmatan</h3>
              <div className="flex gap-2">
                <button 
                  onClick={addEmptyRow}
                  className="px-4 py-2 bg-[#111] text-gray-300 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:text-white hover:border-white/30 hover:bg-black transition-all duration-300 shadow-lg flex items-center gap-1.5 group"
                >
                  <i className="fas fa-plus group-hover:rotate-90 transition-transform duration-300"></i> BARIS KOSONG
                </button>
              </div>
            </div>

            {/* Manual Entry Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4 bg-[#111] p-3 rounded-xl border border-[#FFD700]/20 shadow-inner items-end">
              <div className="md:col-span-6 space-y-1">
                <label className="block text-[8px] font-black uppercase text-[#FFD700] tracking-widest ml-1">Keterangan Manual</label>
                <div className="relative">
                  <i className="fas fa-pen absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                  <input 
                    type="text" 
                    value={manualDesc}
                    onChange={e => setManualDesc(e.target.value)}
                    placeholder="CTH: CAJ PENGURUSAN..."
                    className="w-full bg-black border border-white/10 text-white p-3 pl-9 rounded-xl focus:outline-none focus:border-[#FFD700] text-xs font-bold uppercase"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-[8px] font-black uppercase text-[#FFD700] tracking-widest ml-1 text-center">Unit</label>
                <input 
                  type="number" 
                  value={manualQty}
                  onChange={e => setManualQty(e.target.value)}
                  className="w-full bg-black border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-[#FFD700] text-xs font-bold text-center"
                />
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="block text-[8px] font-black uppercase text-[#FFD700] tracking-widest ml-1 text-right">Harga (RM)</label>
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
                  className="w-full h-[42px] bg-[#FFD700] text-black rounded-xl flex items-center justify-center hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-95 group relative overflow-hidden"
                  title="Tambah Item"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <i className="fas fa-plus relative z-10 group-hover:rotate-180 transition-transform duration-500 text-lg"></i>
                </button>
              </div>
            </div>

            {/* Item List Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-black text-gray-500 text-[8px] font-black uppercase tracking-widest">
                    <th className="p-3">Butiran</th>
                    <th className="p-3 text-center w-16">Unit</th>
                    <th className="p-3 text-right w-24">Harga (RM)</th>
                    <th className="p-3 text-right w-24">Subtotal</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentItems.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-700 text-[9px] font-bold uppercase tracking-widest italic">Senarai item masih kosong.</td></tr>
                  ) : (
                    currentItems.map((it, idx) => (
                      <tr key={idx} className="group hover:bg-white/[0.01] transition-colors">
                        <td className="p-3">
                          <input 
                            type="text" 
                            value={it.name}
                            onChange={(e) => updateItem(idx, 'name', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-white font-bold text-xs uppercase p-0"
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            value={it.quantity}
                            onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-white font-bold text-xs text-center p-0"
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="number" 
                            step="0.01"
                            value={it.price || ''}
                            onChange={(e) => updateItem(idx, 'price', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-white font-bold text-xs text-right p-0"
                          />
                        </td>
                        <td className="p-3 text-right font-black text-white tabular-nums text-xs">
                          {(it.price * it.quantity).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => removeItem(idx)} className="text-gray-700 hover:text-rose-500 transition-colors text-xs">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notes & Ledger Pull */}
            <div className="space-y-4">
              <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 shadow-xl space-y-2">
                <label className="block text-[8px] font-black uppercase text-gray-500 tracking-widest ml-1">Nota Tambahan</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Nota untuk dipaparkan di dokumen..."
                  className="w-full bg-black border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-[#FFD700] transition-all text-xs font-bold h-20 resize-none"
                ></textarea>
              </div>
              
              <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-[#FFD700]/10 shadow-xl flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[8px] font-black uppercase text-[#FFD700] tracking-widest mb-1.5 italic">Tarik Data Ledger</p>
                  <div className="flex gap-2">
                    <input type="date" value={importStartDate} onChange={e => setImportStartDate(e.target.value)} className="bg-black border border-white/5 text-[9px] p-1.5 rounded-md text-white outline-none w-full" />
                    <input type="date" value={importEndDate} onChange={e => setImportEndDate(e.target.value)} className="bg-black border border-white/5 text-[9px] p-1.5 rounded-md text-white outline-none w-full" />
                  </div>
                </div>
                <button onClick={pullLedgerData} disabled={!clients.some(c => c.name === selectedCustomer)} className="bg-[#FFD700] text-black w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#FFA500] transition-all disabled:opacity-20 shadow-lg text-sm">
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>

            {/* Total & Finalize */}
            <div className="bg-[#0a0a0a] p-6 rounded-[32px] border border-white/5 shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FFD700]"></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-3">Jumlah Keseluruhan</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-xl font-black text-[#FFD700]/30">RM</span>
                  <span className="text-5xl font-black tabular-nums tracking-tighter text-white">{total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="w-full space-y-3 mt-6">
                <button 
                  onClick={() => processInvoice(defaultPrintMode, true)}
                  disabled={currentItems.length === 0}
                  className="w-full bg-[#FFD700] text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#FFA500] transition-all shadow-xl active:scale-95 disabled:opacity-30"
                >
                  <i className="fas fa-print mr-2"></i> Jana & Cetak Baru ({defaultPrintMode === 'standard' ? 'A5/PDF' : 'Thermal'})
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={previewInvoice} disabled={currentItems.length === 0} className="bg-[#111] text-[#FFD700] py-3 rounded-lg font-black uppercase tracking-widest text-[8px] border border-[#FFD700]/20 hover:bg-[#FFD700] hover:text-black transition-all disabled:opacity-30">
                    <i className="fas fa-eye mr-1.5"></i> Pratonton Semasa
                  </button>
                  <button onClick={() => processInvoice('standard', false)} disabled={currentItems.length === 0} className="bg-[#111] text-gray-500 py-3 rounded-lg font-black uppercase tracking-widest text-[8px] border border-white/5 hover:bg-black transition-all disabled:opacity-30">
                    Rekod Sahaja
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Documents List */}
      <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 shadow-2xl mt-8">
        <h3 className="text-[#FFD700] text-sm font-black uppercase tracking-[0.3em] border-b border-[#FFD700]/10 pb-4 mb-4 flex items-center gap-3">
          <i className="fas fa-list-alt"></i> Senarai Dokumen Dijana
        </h3>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
               <tr className="bg-black/50 text-gray-400 text-[9px] font-black uppercase tracking-widest border-b border-white/5">
                 <th className="p-4 rounded-tl-xl">Kategori</th>
                 <th className="p-4">No. Dokumen</th>
                 <th className="p-4">Tarikh</th>
                 <th className="p-4">Nama Pelanggan</th>
                 <th className="p-4">Butiran</th>
                 <th className="p-4 text-right">Jumlah (RM)</th>
                 <th className="p-4 w-10 rounded-tr-xl text-center">Tindakan</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5 disabled-text-selection">
               {(!generatedDocs || generatedDocs.length === 0) ? (
                 <tr>
                   <td colSpan={7} className="p-8 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest italic">
                     Tiada rekod dokumen buat masa ini.
                   </td>
                 </tr>
               ) : (
                 generatedDocs.map((doc, idx) => (
                   <tr key={doc.id || idx} className="hover:bg-white/[0.02] transition-colors">
                     <td className="p-4">
                       <span className={`px-2 py-1 rounded text-[8px] font-black tracking-widest ${
                         doc.docType === 'RECEIPT' ? 'bg-emerald-500/10 text-emerald-500' :
                         doc.docType === 'INVOICE' ? 'bg-blue-500/10 text-blue-500' :
                         doc.docType === 'QUOTATION' ? 'bg-purple-500/10 text-purple-500' :
                         'bg-amber-500/10 text-amber-500'
                       }`}>
                         {doc.docType === 'RECEIPT' ? 'RESIT' : 
                          doc.docType === 'INVOICE' ? 'INVOIS' : 
                          doc.docType === 'QUOTATION' ? 'SEBUTHARGA' : 'BAUCAR'}
                       </span>
                     </td>
                     <td className="p-4 text-xs font-mono text-gray-300">{doc.docNo}</td>
                     <td className="p-4 text-xs text-gray-400">{formatDate(doc.date)}</td>
                     <td className="p-4 text-xs font-bold text-white uppercase">{doc.customer}</td>
                     <td className="p-4 text-[10px] text-gray-400 max-w-[200px] truncate" title={doc.details}>{doc.details}</td>
                     <td className="p-4 text-right text-xs font-black text-[#FFD700] tabular-nums">
                       {doc.total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                     </td>
                     <td className="p-4 text-center">
                        <button 
                          onClick={() => {
                            if (window.confirm('Adakah anda pasti untuk memadam rekod dokumen ini?')) {
                              onDeleteDocument?.(doc.id);
                            }
                          }}
                          className="text-gray-600 hover:text-rose-500 transition-colors"
                          title="Padam"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;

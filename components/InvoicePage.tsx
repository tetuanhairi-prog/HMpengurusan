
import React, { useState, useEffect } from 'react';
import { Client, ServiceItem } from '../types';

type DocType = 'RECEIPT' | 'INVOICE' | 'QUOTATION';

interface InvoicePageProps {
  clients: Client[];
  services: ServiceItem[];
  invCounter: number;
  onProcessPayment: (receiptData: any) => void;
}

interface InvoiceLineItem {
  name: string;
  price: number;
  quantity: number;
}

const InvoicePage: React.FC<InvoicePageProps> = ({ clients, services, invCounter, onProcessPayment }) => {
  const [docType, setDocType] = useState<DocType>('RECEIPT');
  const [invNo, setInvNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Manual entry state
  const [manualDesc, setManualDesc] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [manualPrice, setManualPrice] = useState('');

  const [notes, setNotes] = useState('');
  const [currentItems, setCurrentItems] = useState<InvoiceLineItem[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  
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

  const hmInputClass = "w-full border-2 border-gray-300 bg-white p-4 rounded-xl font-bold text-black focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/20 outline-none transition-all shadow-sm";

  return (
    <div className="bg-[#f8f9fa] text-black p-6 md:p-10 rounded-[40px] shadow-2xl border border-gray-300 animate-slideUp">
      
      {/* Document Type Selection */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-200 p-2 rounded-2xl flex gap-2 shadow-inner border border-gray-300 w-full max-w-xl">
          {(['RECEIPT', 'INVOICE', 'QUOTATION'] as DocType[]).map((type) => (
            <button
              key={type}
              onClick={() => setDocType(type)}
              className={`flex-1 py-4 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                docType === type 
                ? 'bg-black text-[#FFD700] shadow-xl scale-[1.02] ring-4 ring-[#FFD700]/20' 
                : 'text-gray-700 hover:text-black hover:bg-gray-300'
              }`}
            >
              {type === 'RECEIPT' ? 'RESIT' : type === 'INVOICE' ? 'INVOIS' : 'SEBUTHARGA'}
            </button>
          ))}
        </div>
      </div>

      {/* Reference & Date */}
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-10 pb-8 border-b-2 border-dashed border-gray-300">
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">No. Rujukan ({docType})</label>
          <div className="text-3xl font-black tracking-widest tabular-nums bg-white px-6 py-4 rounded-2xl border-2 border-black inline-block text-black shadow-lg">
            {invNo}
          </div>
        </div>
        <div className="space-y-1 min-w-[240px]">
          <label className="block text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Tarikh Dokumen</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className={`${hmInputClass} text-lg`}
          />
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-10 bg-white p-8 md:p-10 rounded-[35px] border-2 border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-black"></div>
        <h3 className="font-legal text-xl font-bold mb-8 flex items-center gap-3">
          <i className="fas fa-user-tie text-[#FFD700]"></i> Maklumat Pelanggan / Client Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Carian Sistem (Guaman)</label>
              <select 
                onChange={handleCustomerSelect}
                className="w-full border-2 border-gray-300 bg-gray-50 p-4 rounded-xl font-bold text-black outline-none focus:border-black shadow-sm transition-all cursor-pointer"
              >
                <option value="MANUAL">-- MASUKKAN SECARA MANUAL --</option>
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                <option value="PELANGGAN TUNAI">PELANGGAN TUNAI (CASH)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${showValidation && !selectedCustomer ? 'text-red-600' : 'text-gray-400'}`}>
                Nama Penuh Pelanggan {showValidation && !selectedCustomer && <span className="font-black">(! WAJIB)</span>}
              </label>
              <input 
                type="text" 
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value.toUpperCase())}
                placeholder="NAMA PENUH"
                className={`${hmInputClass} uppercase ${showValidation && !selectedCustomer ? 'border-red-500 bg-red-50' : ''}`}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">No. Telefon</label>
              <input 
                type="text" 
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="012-3456789"
                className={hmInputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Alamat Surat-Menyurat</label>
              <textarea 
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value.toUpperCase())}
                placeholder="ALAMAT LENGKAP"
                className={`${hmInputClass} h-[100px] resize-none uppercase`}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* Item Entry Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white p-8 rounded-[35px] border-2 border-gray-200 shadow-sm relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full translate-x-12 -translate-y-12"></div>
          <h3 className="font-legal text-lg font-bold mb-6 flex items-center gap-3 relative z-10">
            <i className="fas fa-list-check text-gray-400"></i> Pilih Dari Inventori
          </h3>
          <div className="relative z-10">
            <select 
              onChange={addItemFromInventory}
              className="w-full border-2 border-black bg-white p-5 rounded-2xl focus:ring-4 focus:ring-black/10 outline-none font-black text-sm cursor-pointer shadow-md text-black"
            >
              <option value="">+ KLIK UNTUK CARI SENARAI SERVIS</option>
              {services.map(s => (
                <option key={s.id} value={JSON.stringify(s)}>
                  {s.name} — RM {s.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-8 rounded-[35px] border-[3px] border-black shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rotate-45 translate-x-16 -translate-y-16 opacity-20"></div>
          <h3 className="font-legal text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
            <i className="fas fa-keyboard text-[#FFD700]"></i> Tambah Perkhidmatan Manual
          </h3>
          
          <div className="flex flex-col gap-5 relative z-10">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Keterangan / Description</label>
              <input 
                type="text" 
                value={manualDesc}
                onChange={e => setManualDesc(e.target.value)}
                placeholder="CTH: CAJ PENGURUSAN DOKUMEN KHAS"
                className="w-full border-2 border-gray-200 bg-gray-50 p-4 rounded-xl font-black uppercase text-sm focus:border-black focus:bg-white outline-none transition-all shadow-inner"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-28 space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 block">Unit</label>
                <input 
                  type="number" 
                  value={manualQty}
                  onChange={e => setManualQty(e.target.value)}
                  placeholder="1"
                  className="w-full border-2 border-gray-200 bg-gray-50 p-4 rounded-xl font-black text-center focus:border-black focus:bg-white outline-none shadow-inner"
                />
              </div>
              
              <div className="flex-grow space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Harga Seunit (RM)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={manualPrice}
                  onChange={e => setManualPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full border-2 border-gray-200 bg-gray-50 p-4 rounded-xl font-black focus:border-black focus:bg-white outline-none shadow-inner"
                />
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={handleManualAdd}
                  className="w-full sm:w-auto bg-black text-[#FFD700] px-10 py-4 rounded-xl font-black text-sm hover:bg-gray-800 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3 h-[58px] border-b-4 border-gray-700"
                >
                  <i className="fas fa-plus-circle text-lg"></i> MASUKKAN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item List */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-4 px-2 gap-4">
          <h3 className="font-legal text-2xl font-bold tracking-tight">Senarai Transaksi / Transactions</h3>
          <button 
            onClick={addEmptyRow}
            className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-gray-200 active:scale-95 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Tambah Baris Kosong
          </button>
        </div>
        
        <div className="overflow-hidden border-2 border-black rounded-[35px] shadow-2xl bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-6 text-[11px] font-black uppercase tracking-[0.2em]">Butiran / Description</th>
                <th className="p-6 text-[11px] font-black uppercase tracking-[0.2em] text-center w-28">Unit</th>
                <th className="p-6 text-[11px] font-black uppercase tracking-[0.2em] text-center w-40">Harga (RM)</th>
                <th className="p-6 text-[11px] font-black uppercase tracking-[0.2em] text-right w-44">Subtotal</th>
                <th className="p-6 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center opacity-10">
                      <i className="fas fa-receipt text-[100px] mb-6 text-black"></i>
                      <p className="font-black uppercase tracking-[0.3em] text-lg text-black">Sila masukkan item perkhidmatan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((it, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-6">
                      <input 
                        type="text" 
                        value={it.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        placeholder="BUTIRAN..."
                        className="w-full font-bold text-xl uppercase leading-tight bg-transparent border-b-2 border-transparent focus:border-[#FFD700] p-2 rounded outline-none transition-all text-black font-legal"
                      />
                    </td>
                    <td className="p-6">
                      <input 
                        type="number" 
                        min="1"
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        className="w-full border-2 border-gray-100 bg-white p-4 rounded-xl text-center font-black focus:border-[#FFD700] outline-none transition-all shadow-inner text-black text-lg"
                      />
                    </td>
                    <td className="p-6">
                      <input 
                        type="number" 
                        step="0.01"
                        value={it.price || ''}
                        onChange={(e) => updateItem(idx, 'price', e.target.value)}
                        className="w-full border-2 border-gray-100 bg-white p-4 rounded-xl text-center font-black focus:border-[#FFD700] outline-none transition-all shadow-inner text-black text-lg"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-6 text-right">
                      <span className="font-black text-3xl tracking-tighter tabular-nums text-black">
                        {(it.price * it.quantity).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => removeItem(idx)} 
                        className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                        title="Buang"
                      >
                        <i className="fas fa-trash-can text-lg"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedicated Notes & Footer Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t-2 border-gray-200 items-start">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[35px] border-2 border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#FFD700]"></div>
            <label className="block text-[11px] font-black uppercase text-gray-500 mb-4 ml-1 tracking-widest flex items-center gap-2">
              <i className="fas fa-pen-nib text-[#FFD700]"></i> Nota Tambahan / Remarks
            </label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Arahan pembayaran, tarikh tamat, atau nota tambahan yang akan dipaparkan di dokumen..."
              className="w-full border-2 border-gray-300 bg-white p-6 rounded-[24px] focus:border-black outline-none transition-all font-bold text-sm h-40 resize-none shadow-inner text-black mb-4"
            ></textarea>
            
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1 mb-2">Nota Pantas / Quick Notes:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Sila bayar selewatnya 14 hari.",
                  "Cek atas nama HAIRI MUSTAFA ASSOCIATES.",
                  "Sebut harga sah selama 30 hari.",
                  "Terima kasih atas urusan anda.",
                  "Bayaran ansuran kedua diperlukan."
                ].map((preset, i) => (
                  <button 
                    key={i}
                    onClick={() => addQuickNote(preset)}
                    className="bg-gray-100 hover:bg-[#FFD700] hover:text-black text-gray-500 text-[9px] font-black px-4 py-2 rounded-full transition-all border border-gray-200 uppercase tracking-tighter"
                  >
                    + {preset.slice(0, 18)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          {/* Total Box */}
          <div className="bg-black p-10 md:p-14 rounded-[50px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border-b-[15px] border-[#FFD700] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-x-10 -translate-y-20 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="flex items-center gap-10 relative z-10">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[35px] flex items-center justify-center text-[#FFD700] shadow-2xl ring-2 ring-white/20">
                <i className="fas fa-money-bill-transfer text-5xl"></i>
              </div>
              <div>
                <p className="text-[13px] font-black uppercase tracking-[0.5em] text-[#FFD700] mb-4 opacity-80">JUMLAH BESAR (TOTAL AMOUNT)</p>
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-[#FFD700]/50">RM</span>
                  <h3 className="text-8xl md:text-9xl font-black tracking-tighter tabular-nums text-white leading-none font-legal">
                    {total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons with explicit Save as PDF */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => processInvoice('standard', true)}
                disabled={currentItems.length === 0}
                className="flex-1 bg-[#FFD700] text-black py-8 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#FFA500] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-6 text-sm border-b-8 border-black/10"
              >
                <i className="fas fa-file-pdf text-4xl"></i> SIMPAN SEBAGAI PDF
              </button>

              <button 
                onClick={() => processInvoice('thermal', true)}
                disabled={currentItems.length === 0}
                className="flex-1 bg-black text-[#FFD700] py-8 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-6 border-b-8 border-[#FFA500]/50 text-sm"
              >
                <i className="fas fa-bolt-lightning text-4xl"></i> CETAK THERMAL (80mm)
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
               <button 
                onClick={() => processInvoice('standard', true)}
                disabled={currentItems.length === 0}
                className="flex-1 bg-white text-black border-[4px] border-black py-6 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-4 text-xs"
              >
                <i className="fas fa-print text-xl"></i> CETAK STANDARD (A5)
              </button>

              <button 
                onClick={() => processInvoice('standard', false)}
                disabled={currentItems.length === 0}
                className="flex-1 bg-[#1e293b] text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#0f172a] active:scale-95 transition-all flex items-center justify-center gap-4 text-xs disabled:opacity-30 border-b-4 border-black/50"
              >
                <i className="fas fa-save text-xl text-[#FFD700]"></i> REKOD SISTEM SAHAJA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;

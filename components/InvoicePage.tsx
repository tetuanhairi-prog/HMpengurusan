
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

  const handleQuickAddManual = () => {
    if (!manualDesc) return alert("Sila isi deskripsi perkhidmatan!");
    setCurrentItems([...currentItems, { 
      name: manualDesc.toUpperCase(), 
      price: parseFloat(manualPrice) || 0, 
      quantity: parseInt(manualQty) || 1 
    }]);
    setManualDesc('');
    setManualQty('1');
    setManualPrice('');
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
    if (currentItems.length === 0) return alert("Sila tambah item!");

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

    // Reset state after processing
    setCurrentItems([]);
    setNotes('');
    setShowValidation(false);
    setSelectedCustomer('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  return (
    <div className="bg-[#f8f9fa] text-black p-6 md:p-10 rounded-3xl shadow-inner border border-gray-300 animate-slideUp">
      
      {/* Tab Selector */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-200 p-2 rounded-2xl flex gap-2 shadow-inner border border-gray-300 w-full max-w-xl">
          {(['RECEIPT', 'INVOICE', 'QUOTATION'] as DocType[]).map((type) => (
            <button
              key={type}
              onClick={() => setDocType(type)}
              className={`flex-1 py-4 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                docType === type 
                ? 'bg-black text-[#FFD700] shadow-lg scale-[1.02]' 
                : 'text-gray-700 hover:text-black hover:bg-gray-300'
              }`}
            >
              {type === 'RECEIPT' ? 'RESIT' : type === 'INVOICE' ? 'INVOIS' : 'SEBUTHARGA'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-6 mb-10 pb-8 border-b border-gray-300">
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase text-black tracking-widest">No. Rujukan ({docType})</label>
          <div className="text-2xl font-black tracking-tighter tabular-nums bg-white px-5 py-3 rounded-xl border-2 border-gray-300 inline-block text-black shadow-sm">
            {invNo}
          </div>
        </div>
        <div className="space-y-1 min-w-[220px]">
          <label className="block text-[10px] font-black uppercase text-black tracking-widest">Tarikh Dokumen</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full border-2 border-gray-300 bg-white p-3.5 rounded-xl focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/20 outline-none transition-all font-bold text-black" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-white p-8 rounded-[30px] border-2 border-gray-200 shadow-sm">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black uppercase text-black tracking-widest ml-1">Pilih Pelanggan (Carian Sistem)</label>
            <select 
              onChange={handleCustomerSelect}
              className="w-full border-2 border-gray-300 bg-white p-4 rounded-xl font-bold text-black outline-none focus:border-black shadow-sm transition-all cursor-pointer"
            >
              <option value="MANUAL" className="text-black font-bold">-- MASUKKAN SECARA MANUAL --</option>
              {clients.map(c => <option key={c.id} value={c.name} className="text-black">{c.name}</option>)}
              <option value="PELANGGAN TUNAI" className="text-black">PELANGGAN TUNAI (CASH)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${showValidation && !selectedCustomer ? 'text-red-600' : 'text-black'}`}>
              Nama Pelanggan {showValidation && !selectedCustomer && <span className="font-black">(! WAJIB)</span>}
            </label>
            <input 
              type="text" 
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value.toUpperCase())}
              placeholder="NAMA PENUH"
              className={`w-full border-2 p-4 rounded-xl font-black uppercase focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/20 outline-none transition-all text-black ${showValidation && !selectedCustomer ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black uppercase text-black tracking-widest ml-1">No. Telefon Pelanggan</label>
            <input 
              type="text" 
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="Cth: 01156531310"
              className="w-full border-2 border-gray-300 bg-white p-4 rounded-xl font-bold text-black focus:border-[#FFD700] outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black uppercase text-black tracking-widest ml-1">Alamat Pelanggan</label>
            <textarea 
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value.toUpperCase())}
              placeholder="ALAMAT LENGKAP"
              className="w-full border-2 border-gray-300 bg-white p-4 rounded-xl font-bold text-black focus:border-[#FFD700] outline-none transition-all h-[110px] resize-none uppercase shadow-sm"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="mb-10 bg-white p-8 rounded-[30px] border-2 border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-[10px] font-black uppercase text-black mb-3 ml-1 tracking-widest">Pilih Servis (Dari Inventori)</label>
            <select 
              onChange={addItemFromInventory}
              className="w-full border-2 border-black bg-white p-5 rounded-2xl focus:ring-4 focus:ring-black/10 outline-none font-black text-sm cursor-pointer shadow-md text-black"
            >
              <option value="" className="text-black">+ KLIK UNTUK CARI SERVIS SISTEM</option>
              {services.map(s => (
                <option key={s.id} value={JSON.stringify(s)} className="text-black">
                  {s.name} — RM {s.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300">
             <label className="block text-[10px] font-black uppercase text-gray-400 mb-4 ml-1 tracking-widest text-center">ISI MANUAL (QUICK ADD)</label>
             <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={manualDesc}
                  onChange={e => setManualDesc(e.target.value)}
                  placeholder="KETERANGAN SERVIS..."
                  className="w-full border-2 border-gray-200 bg-white p-3 rounded-xl font-black uppercase text-xs focus:border-[#FFD700] outline-none"
                />
                <div className="flex gap-3">
                   <input 
                      type="number" 
                      value={manualQty}
                      onChange={e => setManualQty(e.target.value)}
                      placeholder="UNIT"
                      className="w-20 border-2 border-gray-200 bg-white p-3 rounded-xl font-black text-center focus:border-[#FFD700] outline-none"
                   />
                   <input 
                      type="number" 
                      value={manualPrice}
                      onChange={e => setManualPrice(e.target.value)}
                      placeholder="HARGA RM"
                      className="flex-grow border-2 border-gray-200 bg-white p-3 rounded-xl font-black focus:border-[#FFD700] outline-none"
                   />
                   <button 
                      onClick={handleQuickAddManual}
                      className="bg-black text-[#FFD700] px-6 rounded-xl font-black text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                   >
                     <i className="fas fa-plus"></i> TAMBAH
                   </button>
                </div>
             </div>
          </div>
        </div>

        <div className="overflow-hidden border-2 border-black rounded-[25px] shadow-2xl bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Butiran Perkhidmatan</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-24">Unit</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-36">Harga (RM)</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right w-40">Subtotal</th>
                <th className="p-5 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <i className="fas fa-box-open text-7xl mb-4 text-black"></i>
                      <p className="font-black uppercase tracking-[0.2em] text-sm text-black">Belum ada item ditambahkan</p>
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
                        placeholder="MASUKKAN KETERANGAN..."
                        className="w-full font-black text-lg uppercase leading-tight bg-transparent border-b-2 border-transparent focus:border-[#FFD700] p-2 rounded outline-none transition-all text-black"
                      />
                    </td>
                    <td className="p-6">
                      <input 
                        type="number" 
                        min="1"
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        className="w-full border-2 border-gray-200 bg-white p-3 rounded-xl text-center font-black focus:border-[#FFD700] outline-none transition-all shadow-inner text-black"
                      />
                    </td>
                    <td className="p-6">
                      <input 
                        type="number" 
                        step="0.01"
                        value={it.price || ''}
                        onChange={(e) => updateItem(idx, 'price', e.target.value)}
                        className="w-full border-2 border-gray-200 bg-white p-3 rounded-xl text-center font-black focus:border-[#FFD700] outline-none transition-all shadow-inner text-black"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-6 text-right">
                      <span className="font-black text-2xl tracking-tighter tabular-nums text-black">
                        {(it.price * it.quantity).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => removeItem(idx)} 
                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all"
                        title="Buang"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 border-t-2 border-gray-300 items-start">
        <div className="lg:col-span-1">
          <label className="block text-[10px] font-black uppercase text-black mb-3 ml-1 tracking-widest">Nota / Terma Dokumen</label>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Cth: Sila buat bayaran ke akaun CIMB..."
            className="w-full border-2 border-gray-300 bg-white p-5 rounded-3xl focus:border-[#FFD700] outline-none transition-all font-bold text-sm h-40 resize-none shadow-sm text-black"
          ></textarea>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="bg-black p-10 rounded-[45px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-[12px] border-[#FFD700]">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-white rounded-[25px] flex items-center justify-center text-black shadow-2xl ring-4 ring-white/10">
                <i className="fas fa-coins text-4xl"></i>
              </div>
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#FFD700] mb-2">JUMLAH KESELURUHAN (TOTAL)</p>
                <h3 className="text-7xl font-black tracking-tighter tabular-nums text-white leading-none">
                  RM {total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6">
              <button 
                onClick={() => processInvoice('standard', true)}
                disabled={currentItems.length === 0}
                className="flex-1 bg-white text-black border-[3px] border-black py-6 rounded-[24px] font-black uppercase tracking-[0.25em] shadow-xl hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-4 text-xs"
              >
                <i className="fas fa-print text-2xl"></i> CETAK (A5)
              </button>

              <button 
                onClick={() => processInvoice('thermal', true)}
                disabled={currentItems.length === 0}
                className="flex-1 bg-black text-[#FFD700] py-6 rounded-[24px] font-black uppercase tracking-[0.25em] shadow-2xl hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-4 border-b-4 border-[#FFA500] text-xs"
              >
                <i className="fas fa-bolt text-3xl"></i> THERMAL (80MM)
              </button>
            </div>

            <button 
              onClick={() => processInvoice('standard', false)}
              disabled={currentItems.length === 0}
              className="w-full bg-[#2c333f] text-white py-6 rounded-[24px] font-black uppercase tracking-[0.25em] shadow-2xl hover:bg-[#1a1f26] active:scale-95 transition-all flex items-center justify-center gap-4 text-xs disabled:opacity-30 border-b-4 border-black/30"
            >
              <i className="fas fa-file-pdf text-2xl"></i> SIMPAN PDF / REKOD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;

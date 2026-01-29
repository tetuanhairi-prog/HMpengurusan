
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
  
  // Maklumat Pelanggan
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
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
      setCustomerAddress(client.detail || '');
      setCustomerPhone(''); 
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

  const addManualItem = () => {
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

  const processInvoice = (mode: 'standard' | 'thermal') => {
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
      autoPrint: true,
      printMode: mode
    });

    setCurrentItems([]);
    setNotes('');
    setShowValidation(false);
  };

  return (
    <div className="bg-[#f8f9fa] text-black p-6 md:p-10 rounded-3xl shadow-inner border border-gray-300 animate-slideUp">
      
      {/* Tab Selector - Invois / Resit / Sebutharga */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-200 p-2 rounded-2xl flex gap-2 shadow-inner border border-gray-300 w-full max-w-xl">
          {(['RECEIPT', 'INVOICE', 'QUOTATION'] as DocType[]).map((type) => (
            <button
              key={type}
              onClick={() => setDocType(type)}
              className={`flex-1 py-4 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                docType === type 
                ? 'bg-black text-[#FFD700] shadow-lg' 
                : 'text-gray-700 hover:text-black hover:bg-gray-300'
              }`}
            >
              {type === 'RECEIPT' ? 'RESIT' : type === 'INVOICE' ? 'INVOIS' : 'SEBUTHARGA'}
            </button>
          ))}
        </div>
      </div>

      {/* Maklumat Header & No Rujukan */}
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
            className="w-full border-2 border-gray-300 bg-white p-3.5 rounded-xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold text-black" 
          />
        </div>
      </div>

      {/* Maklumat Pelanggan (Manual/Auto) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-white p-8 rounded-[30px] border-2 border-gray-200 shadow-sm">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black uppercase text-black tracking-widest ml-1">Pilih Pelanggan (Carian Sistem)</label>
            <select 
              onChange={handleCustomerSelect}
              className="w-full border-2 border-gray-300 bg-white p-4 rounded-xl font-bold text-black outline-none focus:border-black focus:ring-4 focus:ring-black/5 shadow-sm transition-all"
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
              className={`w-full border-2 p-4 rounded-xl font-black uppercase focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all text-black ${showValidation && !selectedCustomer ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
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
              className="w-full border-2 border-gray-300 bg-white p-4 rounded-xl font-bold text-black focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-[10px] font-black uppercase text-black tracking-widest ml-1">Alamat Pelanggan</label>
            <textarea 
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value.toUpperCase())}
              placeholder="ALAMAT LENGKAP"
              className="w-full border-2 border-gray-300 bg-white p-4 rounded-xl font-bold text-black focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all h-[110px] resize-none uppercase shadow-sm"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Pilihan Servis (Inventory/Manual) */}
      <div className="mb-10 bg-white p-8 rounded-[30px] border-2 border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-grow">
            <label className="block text-[10px] font-black uppercase text-black mb-3 ml-1 tracking-widest">Pilih Servis (Inventori)</label>
            <select 
              onChange={addItemFromInventory}
              className="w-full border-2 border-black bg-white p-5 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none font-black text-sm cursor-pointer shadow-md text-black"
            >
              <option value="" className="text-black">+ KLIK UNTUK CARI SERVIS SEDIA ADA</option>
              {services.map(s => (
                <option key={s.id} value={JSON.stringify(s)} className="text-black">
                  {s.name} — RM {s.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={addManualItem}
              className="w-full md:w-auto bg-[#FFD700] text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black hover:text-[#FFD700] transition-all flex items-center justify-center gap-3 border border-black/10 active:scale-95"
            >
              <i className="fas fa-plus-circle text-lg"></i> ISI MANUAL
            </button>
          </div>
        </div>

        {/* Jadual Item */}
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
                        className="w-full font-black text-lg uppercase leading-tight bg-transparent border-b-2 border-transparent focus:border-black p-2 rounded outline-none transition-all text-black"
                      />
                    </td>
                    <td className="p-6">
                      <input 
                        type="number" 
                        min="1"
                        value={it.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        className="w-full border-2 border-gray-200 bg-white p-3 rounded-xl text-center font-black focus:border-black outline-none transition-all shadow-inner text-black"
                      />
                    </td>
                    <td className="p-6">
                      <input 
                        type="number" 
                        step="0.01"
                        value={it.price || ''}
                        onChange={(e) => updateItem(idx, 'price', e.target.value)}
                        className="w-full border-2 border-gray-200 bg-white p-3 rounded-xl text-center font-black focus:border-black outline-none transition-all shadow-inner text-black"
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

      {/* Nota & Ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 border-t-2 border-gray-300 items-start">
        <div className="lg:col-span-1">
          <label className="block text-[10px] font-black uppercase text-black mb-3 ml-1 tracking-widest">Nota / Terma Dokumen</label>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Cth: Sila buat bayaran ke akaun CIMB..."
            className="w-full border-2 border-gray-300 bg-white p-5 rounded-3xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold text-sm h-40 resize-none shadow-sm text-black"
          ></textarea>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-black p-10 rounded-[45px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-[12px] border-[#FFD700]">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-[#FFD700] rounded-[25px] flex items-center justify-center text-black shadow-2xl ring-4 ring-white/10">
                <i className="fas fa-coins text-4xl"></i>
              </div>
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#FFD700] mb-2 opacity-80">JUMLAH KESELURUHAN (TOTAL)</p>
                <h3 className="text-7xl font-black tracking-tighter tabular-nums text-white leading-none">
                  RM {total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            {/* Butang Standard (A5) */}
            <button 
              onClick={() => processInvoice('standard')}
              disabled={currentItems.length === 0}
              className="flex-1 bg-white text-black border-[3px] border-black py-6 rounded-[25px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 text-sm"
            >
              <i className="fas fa-print text-xl"></i> CETAK (A5)
            </button>

            {/* Butang Thermal Printer / Bluetooth */}
            <button 
              onClick={() => processInvoice('thermal')}
              disabled={currentItems.length === 0}
              className="flex-1 bg-black text-[#FFD700] py-6 rounded-[25px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-4 border-b-4 border-[#FFA500] text-sm"
            >
              <i className="fas fa-bolt text-2xl"></i> THERMAL (80MM)
            </button>

            {/* Butang Simpan / PDF */}
            <button 
              onClick={() => processInvoice('standard')}
              className="w-full bg-gray-700 text-white py-6 rounded-[25px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 text-sm"
            >
              <i className="fas fa-save text-xl"></i> SIMPAN PDF / REKOD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;

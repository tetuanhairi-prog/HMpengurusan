
import React, { useState, useEffect } from 'react';
import { Client, ServiceItem } from '../types';

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
  const [invNo, setInvNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [notes, setNotes] = useState('');
  const [currentItems, setCurrentItems] = useState<InvoiceLineItem[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  
  useEffect(() => {
    const year = new Date().getFullYear();
    setInvNo(`RES-${year}${String(invCounter).padStart(4, '0')}`);
  }, [invCounter]);

  const addItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const item = JSON.parse(val) as ServiceItem;
    setCurrentItems([...currentItems, { name: item.name, price: item.price, quantity: 1 }]);
    e.target.value = ""; // Reset select
  };

  const updateItem = (idx: number, field: keyof InvoiceLineItem, value: string | number) => {
    const newItems = [...currentItems];
    if (field === 'price') {
      newItems[idx].price = parseFloat(value.toString()) || 0;
    } else if (field === 'quantity') {
      newItems[idx].quantity = parseInt(value.toString()) || 0;
    } else if (field === 'name') {
      newItems[idx].name = value.toString();
    }
    setCurrentItems(newItems);
  };

  const removeItem = (idx: number) => {
    setCurrentItems(currentItems.filter((_, i) => i !== idx));
  };

  const total = currentItems.reduce((s, i) => s + (i.price * i.quantity), 0);

  const processInvoice = (shouldPrint: boolean = false) => {
    if (!selectedCustomer) {
      setShowValidation(true);
      return alert("Sila pilih pelanggan!");
    }
    if (currentItems.length === 0) return alert("Tambah sekurang-kurangnya 1 item!");

    onProcessPayment({
      title: "RESIT RASMI",
      customer: selectedCustomer,
      docNo: invNo,
      date: date,
      notes: notes,
      items: currentItems.map(it => ({
        name: it.quantity > 1 ? `${it.name} (x${it.quantity})` : it.name,
        price: it.price * it.quantity
      })),
      total: total,
      autoPrint: shouldPrint
    });

    setCurrentItems([]);
    setSelectedCustomer('');
    setNotes('');
    setShowValidation(false);
  };

  return (
    <div className="bg-white text-black p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-200 animate-slideUp">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-black text-[#FFD700] p-3 rounded-xl shadow-lg">
            <i className="fas fa-file-invoice text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Penyediaan Resit</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Official Legal Receipt Generation</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-gray-300 uppercase block">No. Dokumen</span>
          <span className="text-xl font-black tracking-tighter">{invNo}</span>
        </div>
      </div>

      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase text-gray-400 ml-1">Tarikh Dokumen</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full border-2 border-gray-100 bg-[#F9F9F9] p-3 rounded-xl focus:border-black focus:bg-white outline-none transition-all font-bold" 
          />
        </div>
        <div className="space-y-1">
          <label className={`block text-[10px] font-black uppercase ml-1 transition-colors ${showValidation && !selectedCustomer ? 'text-red-500' : 'text-gray-400'}`}>
            Pilih Pelanggan / Fail {showValidation && !selectedCustomer && <span className="text-red-600 animate-pulse ml-1">* DIPERLUKAN</span>}
          </label>
          <select 
            value={selectedCustomer} 
            onChange={e => {
              setSelectedCustomer(e.target.value);
              if (e.target.value) setShowValidation(false);
            }}
            className={`w-full border-2 p-3 rounded-xl outline-none transition-all font-bold appearance-none cursor-pointer
              ${showValidation && !selectedCustomer 
                ? 'border-red-500 bg-red-50/30 ring-4 ring-red-100' 
                : 'border-gray-100 bg-[#F9F9F9] focus:border-black focus:bg-white'}`}
          >
            <option value="">-- Pilih Pelanggan --</option>
            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            <option value="PELANGGAN TUNAI" className="font-black text-blue-600">PELANGGAN TUNAI (CASH)</option>
          </select>
        </div>
      </div>

      {/* Item Selection Section */}
      <div className="bg-[#F9F9F9] p-6 rounded-2xl mb-10 border border-gray-100">
        <label className="block text-[10px] font-black uppercase mb-3 text-gray-400 tracking-widest text-center">Tambah Perkhidmatan Ke Dalam Senarai</label>
        <div className="relative max-w-2xl mx-auto">
          <select 
            onChange={addItem}
            className="w-full border-2 border-black bg-white p-4 rounded-xl focus:ring-4 focus:ring-black/5 outline-none font-bold text-lg cursor-pointer shadow-md"
          >
            <option value="">+ KLIK UNTUK PILIH PERKHIDMATAN</option>
            {services.map(s => (
              <option key={s.id} value={JSON.stringify(s)}>
                {s.name} — RM {s.price.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table Section */}
      <div className="mb-6 overflow-hidden border-2 border-black rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-4 text-[11px] font-black uppercase tracking-widest">Butiran Pembayaran</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-widest text-center w-24">Unit</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-widest text-center w-32">Harga (RM)</th>
              <th className="p-4 text-[11px] font-black uppercase tracking-widest text-right w-32">Jumlah (RM)</th>
              <th className="p-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-50">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center opacity-20">
                    <i className="fas fa-box-open text-6xl mb-4"></i>
                    <p className="font-black uppercase tracking-tighter">Senarai item masih kosong</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((it, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <span className="text-[10px] font-black text-gray-300 block mb-1 uppercase tracking-wider">Item #{idx + 1}</span>
                    <input 
                      type="text" 
                      value={it.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      className="w-full font-bold text-lg uppercase leading-tight bg-white border border-gray-100 p-3 rounded-lg focus:border-black outline-none"
                    />
                  </td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      min="1"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="w-full border border-gray-100 bg-white p-3 rounded-lg text-center font-bold focus:border-black outline-none"
                    />
                  </td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      step="0.01"
                      value={it.price}
                      onChange={(e) => updateItem(idx, 'price', e.target.value)}
                      className="w-full border border-gray-100 bg-white p-3 rounded-lg text-center font-bold focus:border-black outline-none"
                    />
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-black text-xl tracking-tighter text-gray-900">
                      RM {(it.price * it.quantity).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => removeItem(idx)} 
                      className="text-red-300 hover:text-red-600 transition-all"
                      title="Buang Item"
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

      {/* Notes Field */}
      <div className="mb-10">
        <label className="block text-[10px] font-black uppercase text-gray-400 ml-1 mb-2 tracking-widest">Nota Tambahan (Muncul pada resit)</label>
        <textarea 
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Cth: Bayaran melalui pindahan bank / Tunai. No rujukan: 12345"
          className="w-full border-2 border-gray-100 bg-[#F9F9F9] p-4 rounded-xl focus:border-black focus:bg-white outline-none transition-all font-medium text-sm h-24 resize-none"
        ></textarea>
      </div>

      {/* Summary and Action Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 pt-6 border-t-2 border-gray-100">
        <div className="bg-black p-5 rounded-2xl shadow-xl flex items-center gap-6 min-w-[320px] border-b-[6px] border-[#FFD700]">
          <div className="h-12 w-12 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-coins text-black text-2xl"></i>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFD700] mb-0.5">Jumlah Keseluruhan</p>
            <h3 className="text-4xl font-black tracking-tighter tabular-nums text-white">
              RM {total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-grow justify-end">
            <button 
              onClick={() => processInvoice(false)}
              disabled={currentItems.length === 0}
              className="px-8 py-5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest transition-all bg-white text-black border-2 border-black hover:bg-gray-50 active:scale-95 disabled:opacity-20 disabled:grayscale"
            >
              <i className="fas fa-eye"></i>
              SAHKAN & LIHAT
            </button>

            <button 
              onClick={() => processInvoice(true)}
              disabled={currentItems.length === 0}
              className="px-12 py-5 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-4 uppercase tracking-widest transition-all bg-black text-[#FFD700] hover:bg-gray-900 active:scale-95 hover:-translate-y-1 disabled:opacity-20 disabled:grayscale border-b-[4px] border-[#FFA500]"
            >
              <i className="fas fa-print text-2xl"></i>
              PRINT RECEIPT
            </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;

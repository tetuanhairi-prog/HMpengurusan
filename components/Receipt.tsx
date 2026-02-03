
import React, { useEffect } from 'react';
import { DEFAULT_LOGO } from '../constants';

interface ReceiptProps {
  data: {
    docType?: 'RECEIPT' | 'INVOICE' | 'QUOTATION' | 'STATEMENT';
    title: string;
    customer: string;
    customerPhone?: string;
    customerAddress?: string;
    docNo: string;
    date: string;
    notes?: string;
    items: { name: string; price: number }[];
    total: number;
    isStatement?: boolean;
    autoPrint?: boolean;
    printMode?: 'standard' | 'thermal';
  };
  logo: string | null;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ data, logo, onClose }) => {
  const displayLogo = logo || DEFAULT_LOGO;
  const docType = data.docType || (data.isStatement ? 'STATEMENT' : 'RECEIPT');
  const isThermal = data.printMode === 'thermal';

  useEffect(() => {
    if (data.autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [data.autoPrint]);

  const watermarkText = data.isStatement ? 'STATEMENT' : docType === 'RECEIPT' ? 'OFFICIAL' : docType === 'INVOICE' ? 'INVOICE' : 'QUOTATION';

  // Reka bentuk Thermal (80mm)
  if (isThermal) {
    return (
      <div className="bg-white text-black p-4 w-[80mm] mx-auto font-mono text-[12px] animate-fadeIn relative">
        <div className="text-center mb-6">
          <img src={displayLogo} alt="Logo" className="h-14 mx-auto mb-2 grayscale" />
          <h1 className="font-bold text-lg leading-tight uppercase">HAIRI MUSTAFA ASSOCIATES</h1>
          <p className="text-[10px] uppercase">Peguam Syarie & Pesuruhjaya Sumpah</p>
          <div className="border-t border-dashed border-black mt-2 pt-2">
            <h2 className="font-bold text-base underline uppercase">{data.title}</h2>
          </div>
        </div>

        <div className="mb-4 space-y-1">
          <p><span className="font-bold">TARIKH:</span> {data.date}</p>
          <p><span className="font-bold">NO REF:</span> {data.docNo}</p>
          <p className="border-t border-black/10 pt-1"><span className="font-bold">KLIEN:</span> {data.customer}</p>
        </div>

        <div className="border-y border-dashed border-black py-2 mb-4">
          <table className="w-full text-left">
            <thead>
              <tr className="font-bold border-b border-black">
                <th className="pb-1">BUTIRAN</th>
                <th className="pb-1 text-right">RM</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, idx) => (
                <tr key={idx} className="border-b border-black/5">
                  <td className="py-1 uppercase text-[10px]">{it.name}</td>
                  <td className="py-1 text-right font-bold">{it.price.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right mb-6">
          <p className="text-[10px] uppercase opacity-50">Jumlah Besar / Total</p>
          <p className="text-lg font-black tracking-tighter">RM {data.total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="text-center space-y-4 pt-4 border-t border-dashed border-black">
          <p className="text-[10px] italic">*** DOKUMEN SISTEM DIGITAL ***</p>
          <p className="text-[8px] opacity-50 uppercase tracking-widest">Sistem HMA v2.5</p>
        </div>

        <div className="fixed top-8 right-8 z-[150] flex flex-col items-end gap-4 no-print">
          <button onClick={() => window.print()} className="bg-black text-[#FFD700] px-8 py-4 rounded-xl font-black text-xs shadow-2xl active:scale-95 transition-all border border-white/10 uppercase tracking-widest">
            <i className="fas fa-print mr-2"></i> PRINT THERMAL
          </button>
          <button onClick={onClose} className="bg-white text-black w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl shadow-2xl border border-black/10 active:scale-95 transition-all">
            &times;
          </button>
        </div>
      </div>
    );
  }

  // Reka bentuk Standard (A5)
  return (
    <div className="text-black p-8 md:p-10 min-h-[210mm] border-[1px] border-black/10 shadow-2xl relative flex flex-col overflow-hidden animate-fadeIn font-serif bg-white" 
         style={{ background: '#fcfcf9' }}>
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
           }}>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.015]">
        <span className="text-black font-legal font-bold text-[120px] -rotate-[35deg] uppercase tracking-[0.6em]">
          {watermarkText}
        </span>
      </div>

      {/* Header Section */}
      <div className="relative z-10 flex flex-row items-start justify-between mb-8 pb-6 border-b-[2.5px] border-black">
        <div className="flex flex-row items-center gap-6">
          <div className="shrink-0">
             <img src={displayLogo} alt="Logo" className="h-24 w-auto object-contain" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="font-legal text-[28px] font-bold m-0 leading-tight uppercase text-black">
              HAIRI MUSTAFA ASSOCIATES
            </h1>
            <p className="text-[10px] font-black m-0 uppercase tracking-[0.3em] text-gray-500">
              Peguam Syarie & Pesuruhjaya Sumpah
            </p>
            <div className="text-[9px] mt-2 text-gray-700 leading-relaxed font-sans font-medium uppercase">
              Lot 02, Bangunan Arked Mara, 09100 Baling, Kedah Darul Aman<br/>
              Tel: +60 11 5653 1310 | Emel: hairimustafa.legal@gmail.com
            </div>
          </div>
        </div>
        
        <div className={`px-6 py-4 rounded-sm flex flex-col items-end border-2 border-black ${data.isStatement ? 'bg-gray-100' : 'bg-black text-white'}`}>
            <span className={`text-[9px] font-black tracking-widest uppercase ${data.isStatement ? 'text-gray-500' : 'opacity-70'}`}>Dokumen Rasmi</span>
            <span className="text-2xl font-black uppercase tracking-widest leading-none">
              {data.isStatement ? 'PENYATA' : docType}
            </span>
        </div>
      </div>

      {/* Information Row */}
      <div className="relative z-10 grid grid-cols-2 gap-8 mb-10">
        <div className="space-y-4">
            <div className={`p-5 rounded-sm border ${data.isStatement ? 'border-gray-300 bg-gray-50' : 'border-black bg-black/[0.02]'}`}>
                <p className="text-gray-400 uppercase text-[8px] font-black mb-2 tracking-widest italic">
                  {data.isStatement ? 'Penyata Akaun Fail Bagi:' : docType === 'RECEIPT' ? 'Diterima Daripada:' : 'Bil Kepada / Bill To:'}
                </p>
                <p className="font-bold text-xl uppercase leading-tight text-black mb-1">
                  {data.customer}
                </p>
                {data.customerPhone && <p className="text-[10px] font-bold text-gray-600 mb-1">{data.customerPhone}</p>}
                {data.customerAddress && (
                   <p className="text-[9px] text-gray-500 uppercase leading-relaxed italic whitespace-pre-wrap max-w-xs mt-2">
                     {data.customerAddress}
                   </p>
                )}
            </div>
        </div>
        
        <div className="text-right flex flex-col items-end justify-start gap-5 pt-2">
            <div className="flex flex-col items-end">
                <p className="text-gray-400 uppercase text-[8px] font-black tracking-widest italic">No. Rujukan / Ref No.</p>
                <p className="text-xl font-black tracking-widest font-mono text-black border-b border-black/10 pb-1">{data.docNo}</p>
            </div>
            <div className="flex flex-col items-end">
                <p className="text-gray-400 uppercase text-[8px] font-black tracking-widest italic">Tarikh / Date</p>
                <p className="font-black text-xl text-black tabular-nums">{data.date}</p>
            </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative z-10 flex-grow mb-10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y-2 border-black bg-black/[0.04]">
              <th className="py-4 px-3 text-left text-[10px] font-black uppercase tracking-widest text-black">
                Butiran Perkhidmatan & Transaksi / Description
              </th>
              <th className="py-4 px-3 text-right text-[10px] font-black uppercase tracking-widest w-44 text-black">
                Amaun (RM)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 border-b-2 border-black">
            {data.items.map((item, idx) => (
              <tr key={idx} className={data.isStatement ? 'bg-white' : ''}>
                <td className="py-4 px-3">
                    <p className="font-bold text-[13px] uppercase tracking-tight text-gray-900 leading-tight">
                      {item.name}
                    </p>
                </td>
                <td className={`py-4 px-3 text-right font-black tabular-nums text-lg ${item.price < 0 ? 'text-green-600' : 'text-black'}`}>
                  {item.price.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {/* Minimal fill space */}
            {Array.from({ length: Math.max(0, 3 - data.items.length) }).map((_, i) => (
              <tr key={i} className="h-10"><td colSpan={2}></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10 mt-auto">
        <div className="flex-1 w-full">
          {data.notes && (
            <div className="mb-4 p-4 border border-black/10 rounded-sm bg-white/50 italic text-[10px] text-gray-700">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2 not-italic">Nota / Remarks</p>
                {data.notes}
            </div>
          )}
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">
            * Ini adalah cetakan komputer. Tandatangan tidak diperlukan.
          </div>
        </div>

        <div className={`min-w-[320px] text-right p-8 shadow-xl ${data.isStatement ? 'bg-white border-4 border-black' : 'bg-black text-white'}`}>
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] mb-3 ${data.isStatement ? 'text-gray-400' : 'text-[#FFD700]'}`}>
              {data.isStatement ? 'BAKI TERTUNGGAK KESELURUHAN' : docType === 'RECEIPT' ? 'JUMLAH DITERIMA' : docType === 'INVOICE' ? 'JUMLAH PERLU DIBAYAR' : 'JUMLAH SEBUTHARGA'}
            </p>
            <div className="flex items-baseline justify-end gap-3">
              <span className="text-2xl font-bold opacity-40">RM</span>
              <span className="text-6xl font-black tabular-nums tracking-tighter">
                  {data.total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
              </span>
            </div>
        </div>
      </div>

      {/* Footer / Law Firm Brand */}
      <div className="relative z-10 flex justify-between items-center pt-10 mt-10 border-t border-black/10">
        <div>
           <p className="text-[12px] font-bold uppercase tracking-widest text-black">Hairi Mustafa Associates</p>
           <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Peguam Syarie & Pesuruhjaya Sumpah</p>
        </div>
        <div className="text-right">
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-300">DOKUMEN SAH SISTEM HMA</p>
        </div>
      </div>

      {/* Floating Controls Overlay - Non Printing */}
      <div className="fixed top-8 right-8 z-[150] flex flex-col items-end gap-4 no-print">
        {/* PDF Helper Tooltip */}
        <div className="bg-[#FFD700] text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse shadow-xl border border-black/10 mb-2">
           <i className="fas fa-info-circle mr-2"></i> Pilih "Save as PDF" di menu cetakan
        </div>
        
        <button 
            onClick={() => window.print()} 
            className="bg-black text-[#FFD700] px-10 py-5 rounded-2xl font-black text-xs flex items-center gap-5 hover:bg-gray-900 transition-all shadow-2xl uppercase tracking-[0.2em] border border-white/10"
        >
          <i className="fas fa-file-pdf text-2xl"></i> 
          <span>CETAK / SIMPAN PDF</span>
        </button>
        
        <button 
            onClick={onClose} 
            className="bg-white text-black w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-3xl hover:bg-gray-100 shadow-2xl border border-black/10 active:scale-90 transition-all"
        >
            &times;
        </button>
      </div>
    </div>
  );
};

export default Receipt;

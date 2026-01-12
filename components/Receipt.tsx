import React, { useEffect } from 'react';
import { DEFAULT_LOGO } from '../constants';

interface ReceiptProps {
  data: {
    title: string;
    customer: string;
    docNo: string;
    date: string;
    notes?: string;
    items: { name: string; price: number }[];
    total: number;
    isStatement?: boolean;
    autoPrint?: boolean;
  };
  logo: string | null;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ data, logo, onClose }) => {
  const displayLogo = logo || DEFAULT_LOGO;

  // Dedicated Auto-Print Effect
  useEffect(() => {
    if (data.autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [data.autoPrint]);

  return (
    <div className="text-black p-8 md:p-14 min-h-[210mm] border-[1px] border-black/30 shadow-2xl relative flex flex-col overflow-hidden animate-fadeIn font-serif bg-white" 
         style={{ 
           background: 'radial-gradient(circle, #ffffff 0%, #f9f7f2 100%)',
           boxShadow: 'inset 0 0 100px rgba(0,0,0,0.02), 0 25px 50px -12px rgba(0,0,0,0.5)'
         }}>
      
      {/* Organic Paper Grain/Fibers Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
           }}>
      </div>

      {/* Professional Micro-Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#000 0.5px, transparent 0.5px), linear-gradient(90deg, #000 0.5px, transparent 0.5px)', 
             backgroundSize: '12px 12px' 
           }}>
      </div>

      {/* Subtle Law Firm Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.02]">
        <span className="text-black font-legal font-bold text-[120px] -rotate-[30deg] uppercase tracking-[0.5em]">
          {data.isStatement ? 'COPY' : 'OFFICIAL'}
        </span>
      </div>

      {/* Header Section - Clean & Balanced */}
      <div className="relative z-10 flex flex-row items-center justify-between mb-12 pb-8 border-b border-black/20">
        <div className="flex flex-row items-center gap-10">
          <div className="shrink-0 bg-white p-2 border border-black/5 shadow-sm">
             <img src={displayLogo} alt="Logo" className="h-24 w-auto object-contain" />
          </div>
          <div className="flex-1 border-l-2 border-black pl-8">
            <h1 className="font-legal text-[28px] md:text-[34px] font-bold m-0 leading-tight uppercase tracking-tight text-gray-900">
              HAIRI MUSTAFA<br/><span className="tracking-[0.1em]">ASSOCIATES</span>
            </h1>
            <p className="text-[9px] font-bold m-0 uppercase tracking-[0.3em] text-gray-500 mt-2">
              Peguam Syarie & Pesuruhjaya Sumpah
            </p>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end gap-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1 max-w-[200px] leading-relaxed">
              Lot 02, Bangunan Arked Mara,<br/>09100 Baling, Kedah
            </div>
            
            <div className="flex items-center gap-2.5 bg-black/[0.03] px-3 py-1.5 rounded-md border border-black/5">
              <i className="fas fa-phone-alt text-[9px] text-gray-400"></i>
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black uppercase tracking-widest text-black leading-none">011 5653 1310</span>
                <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Office Line</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1">
              <i className="fas fa-globe text-[10px] text-gray-400"></i>
              <span className="text-[10px] font-bold tracking-[0.05em] text-gray-600 italic underline decoration-black/10 underline-offset-4">
                hmofficial.com.my
              </span>
            </div>
        </div>
      </div>

      {/* Document Meta Information */}
      <div className="relative z-10 flex justify-between items-end mb-14">
        <div className="space-y-6">
            <div className="inline-block border-b-2 border-black pb-2">
                <h2 className="font-legal text-4xl font-bold uppercase tracking-[0.2em] text-gray-900 leading-none">
                    {data.title}
                </h2>
            </div>
            <div>
                <p className="text-gray-400 uppercase text-[9px] font-black mb-1 tracking-[0.2em] italic">Diterima Daripada / Nama Fail:</p>
                <p className="font-legal font-bold text-3xl uppercase leading-none text-gray-900 tracking-tight">{data.customer}</p>
            </div>
        </div>
        
        <div className="text-right space-y-6">
            <div className="bg-black/5 p-4 border border-black/10 min-w-[160px] inline-block text-center">
                <p className="text-[8px] font-black uppercase text-gray-400 mb-1 tracking-widest italic border-b border-black/5 pb-1">No. Rujukan</p>
                <p className="text-lg font-black tracking-tight font-mono text-gray-900">{data.docNo}</p>
            </div>
            <div>
                <p className="text-gray-400 uppercase text-[9px] font-black mb-1 tracking-[0.2em] italic">Tarikh Dokumen:</p>
                <p className="font-black text-2xl text-gray-900 tabular-nums tracking-tighter">{data.date}</p>
            </div>
        </div>
      </div>

      {/* Main Particulars Table */}
      <div className="relative z-10 flex-grow mb-12">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y-2 border-black bg-black/[0.02]">
              <th className="p-4 text-left text-[11px] font-black uppercase tracking-[0.4em] text-gray-600">
                Keterangan Perkhidmatan / Butiran
              </th>
              <th className="p-4 text-right text-[11px] font-black uppercase tracking-[0.4em] w-48 text-gray-600">
                Amaun (MYR)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 border-b border-black">
            {data.items.map((item, idx) => (
              <tr key={idx} className="group hover:bg-black/[0.01] transition-colors">
                <td className="p-6">
                    <p className="font-legal font-bold text-base uppercase tracking-tight text-gray-800 leading-relaxed">
                      {item.name}
                    </p>
                </td>
                <td className={`p-6 text-right font-black tabular-nums text-xl ${item.price < 0 ? 'text-green-700' : 'text-gray-900'}`}>
                  {Math.abs(item.price).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {/* Aesthetic empty rows for fixed structure */}
            {Array.from({ length: Math.max(0, 4 - data.items.length) }).map((_, i) => (
              <tr key={`spacer-${i}`} className="h-16">
                <td className="p-6"></td>
                <td className="p-6"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes Section if exists */}
      {data.notes && (
        <div className="relative z-10 mb-10 p-6 bg-black/[0.02] border border-black/5 rounded-lg italic">
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-2">Nota Tambahan:</span>
            <p className="text-gray-700 text-sm leading-relaxed">{data.notes}</p>
        </div>
      )}

      {/* Summary Area */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-12 pt-6 mt-auto">
        
        {/* Verification / Hash Area (Subtle) */}
        <div className="text-left opacity-30 select-none">
            <p className="text-[8px] font-bold uppercase tracking-widest">Digital Authentication Record</p>
            <p className="text-[7px] font-mono uppercase">VERIFY: {Math.random().toString(36).substring(7).toUpperCase()}-{Date.now().toString().slice(-4)}</p>
        </div>

        {/* Total Highlight */}
        <div className="bg-white border-2 border-black p-8 min-w-[320px] text-right shadow-xl">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-2">Jumlah Keseluruhan (Total)</p>
            <div className="flex items-baseline justify-end gap-3">
              <span className="text-2xl font-bold font-legal italic">RM</span>
              <span className="text-6xl font-black tabular-nums tracking-tighter text-gray-900 leading-none">
                  {data.total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
              </span>
            </div>
        </div>
      </div>

      {/* Signature & Seal Footer */}
      <div className="relative z-10 grid grid-cols-2 gap-20 pt-16 border-t border-black/5 mt-10">
        <div className="text-center">
            <div className="h-24 flex flex-col items-center justify-center mb-2">
                <div className="w-48 h-px bg-gray-300"></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] font-legal italic text-gray-800">Tandatangan Pelanggan</p>
        </div>
        
        <div className="text-center relative">
            <div className="h-24 flex items-center justify-center relative mb-2">
               <div className="w-24 h-24 border-[4px] border-black/5 rounded-full flex items-center justify-center text-[7px] font-black text-black/10 uppercase -rotate-12 border-double select-none absolute">
                   COP RASMI FIRMA
               </div>
            </div>
            <div className="w-48 h-px bg-gray-800 mx-auto mb-2"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-900">Pengurusan Akaun</p>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">HAIRI MUSTAFA ASSOCIATES</p>
        </div>
      </div>

      {/* Enhanced Prominent Control Overlay (Fixed to Viewport) */}
      <div className="fixed top-8 right-8 z-[150] flex flex-col items-end gap-4 no-print">
        <button 
            onClick={() => window.print()} 
            className="bg-black text-[#FFD700] px-10 py-5 rounded-2xl font-black text-sm flex items-center gap-4 hover:bg-gray-800 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] uppercase tracking-widest active:scale-95 border border-white/10 group animate-slideUp"
        >
          <i className="fas fa-file-pdf text-xl group-hover:scale-110 transition-transform"></i> 
          <span>CETAK / SIMPAN PDF</span>
        </button>
        <button 
            onClick={onClose} 
            className="bg-white/80 backdrop-blur-md text-black w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-3xl hover:bg-white shadow-2xl border border-black/10 active:scale-95 transition-all"
            title="Tutup Paparan"
        >
            &times;
        </button>
      </div>
      
      {/* Absolute Bottom System Label */}
      <div className="absolute bottom-4 left-0 right-0 text-center opacity-[0.05] text-[7px] font-black tracking-[1em] uppercase pointer-events-none select-none">
          HMA LEGAL SYSTEM • DOCUMENT SECURED • V2.5
      </div>
    </div>
  );
};

export default Receipt;

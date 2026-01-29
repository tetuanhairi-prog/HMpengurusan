
import React, { useEffect } from 'react';
import { DEFAULT_LOGO } from '../constants';

interface ReceiptProps {
  data: {
    docType?: 'RECEIPT' | 'INVOICE' | 'QUOTATION';
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
  const docType = data.docType || 'RECEIPT';
  const isThermal = data.printMode === 'thermal';

  useEffect(() => {
    if (data.autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [data.autoPrint]);

  const watermarkText = data.isStatement ? 'COPY' : docType === 'RECEIPT' ? 'OFFICIAL' : docType === 'INVOICE' ? 'INVOICE' : 'QUOTATION';

  // Reka bentuk Thermal (80mm)
  if (isThermal) {
    return (
      <div className="bg-white text-black p-4 w-[80mm] mx-auto font-mono text-[12px] animate-fadeIn relative">
        <div className="text-center mb-6">
          <img src={displayLogo} alt="Logo" className="h-14 mx-auto mb-2 grayscale" />
          <h1 className="font-bold text-lg leading-tight uppercase">HAIRI MUSTAFA ASSOCIATES</h1>
          <p className="text-[10px] uppercase">Peguam Syarie & Pesuruhjaya Sumpah</p>
          <div className="border-t border-dashed border-black mt-2 pt-2">
            <h2 className="font-bold text-base underline">{data.title}</h2>
          </div>
        </div>

        <div className="mb-4 space-y-1">
          <p><span className="font-bold">TARIKH:</span> {data.date}</p>
          <p><span className="font-bold">NO REF:</span> {data.docNo}</p>
          <p className="border-t border-black/10 pt-1"><span className="font-bold">KLIEN:</span> {data.customer}</p>
          {data.customerPhone && <p><span className="font-bold">TEL:</span> {data.customerPhone}</p>}
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
                  <td className="py-1 text-right">{it.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right mb-6">
          <p className="text-base font-bold">JUMLAH BESAR: RM {data.total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
        </div>

        {data.notes && (
          <div className="mb-6 italic text-[10px] border border-black/10 p-2">
            <p>Nota: {data.notes}</p>
          </div>
        )}

        <div className="text-center space-y-4 pt-4">
          <p className="text-[10px] italic">*** TERIMA KASIH ***</p>
          <p className="text-[8px] opacity-50 uppercase tracking-widest">Sistem Pengurusan HMA v2.5</p>
        </div>

        {/* Floating Controls Overlay */}
        <div className="fixed top-8 right-8 z-[150] flex flex-col items-end gap-4 no-print">
          <button onClick={() => window.print()} className="bg-black text-[#FFD700] px-8 py-4 rounded-xl font-black text-xs shadow-2xl active:scale-95 transition-all">
            <i className="fas fa-print mr-2"></i> PRINT THERMAL
          </button>
          <button onClick={onClose} className="bg-white text-black w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl shadow-2xl border border-black/10">
            &times;
          </button>
        </div>
      </div>
    );
  }

  // Reka bentuk Standard (A5)
  return (
    <div className="text-black p-10 md:p-14 min-h-[210mm] border-[1px] border-black/10 shadow-2xl relative flex flex-col overflow-hidden animate-fadeIn font-serif bg-white" 
         style={{ 
           background: '#fcfcf9',
           boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
         }}>
      
      {/* Organic Paper Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
           }}>
      </div>

      {/* Subtle Frame/Border for premium feel */}
      <div className="absolute inset-4 border-[0.5px] border-black/10 pointer-events-none"></div>

      {/* Subtle Law Firm Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.01]">
        <span className="text-black font-legal font-bold text-[150px] -rotate-[35deg] uppercase tracking-[0.6em]">
          {watermarkText}
        </span>
      </div>

      {/* Header Section / Letterhead */}
      <div className="relative z-10 flex flex-row items-center justify-between mb-12 pb-8 border-b-[3px] border-black">
        <div className="flex flex-row items-center gap-10">
          <div className="shrink-0">
             <img src={displayLogo} alt="Logo" className="h-32 w-auto object-contain drop-shadow-sm" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="font-legal text-[34px] md:text-[40px] font-bold m-0 leading-[0.9] uppercase tracking-[-0.03em] text-black">
              HAIRI MUSTAFA<br/>
              <span className="text-[28px] md:text-[32px] font-normal tracking-[0.2em] -mt-1 block">ASSOCIATES</span>
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <span className="h-px w-8 bg-black"></span>
              <p className="text-[9px] font-black m-0 uppercase tracking-[0.4em] text-gray-500 whitespace-nowrap">
                Peguam Syarie & Pesuruhjaya Sumpah
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end gap-3 self-center">
            <div className="text-[10px] font-legal italic leading-relaxed text-gray-700 max-w-[200px]">
              Lot 02, Bangunan Arked Mara,<br/>09100 Baling, Kedah Darul Aman
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-black flex items-center gap-2">
              <i className="fas fa-phone-alt text-[8px] opacity-30"></i> +60 11 5653 1310
            </div>
        </div>
      </div>

      {/* Document Meta Information */}
      <div className="relative z-10 grid grid-cols-2 gap-12 mb-14">
        <div className="space-y-6">
            <h2 className="font-legal text-[42px] font-bold uppercase tracking-[0.2em] text-black leading-none mb-6">
                {data.title}
            </h2>
            <div className="pl-1">
                <p className="text-gray-400 uppercase text-[9px] font-black mb-3 tracking-[0.3em] italic opacity-70">
                  {docType === 'RECEIPT' ? 'Klien / Diterima Daripada:' : 'Penerima / Billed To:'}
                </p>
                <p className="font-legal font-bold text-[28px] uppercase leading-tight text-black tracking-tighter mb-2 underline decoration-black/10 underline-offset-8 decoration-2">
                  {data.customer}
                </p>
                
                {data.customerPhone && (
                   <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mt-4">
                      {data.customerPhone}
                   </p>
                )}
                
                {data.customerAddress && (
                   <div className="mt-4 max-w-sm">
                     <p className="text-[10px] font-medium text-gray-500 uppercase leading-relaxed whitespace-pre-wrap italic opacity-80">
                       {data.customerAddress}
                     </p>
                   </div>
                )}
            </div>
        </div>
        
        <div className="text-right flex flex-col items-end gap-10 justify-start pt-2">
            <div className="space-y-2">
                <p className="text-gray-400 uppercase text-[9px] font-black tracking-[0.3em] italic opacity-70">No. Rujukan / Ref No.</p>
                <p className="text-[26px] font-black tracking-widest font-mono text-black leading-none">{data.docNo}</p>
            </div>
            <div className="space-y-2">
                <p className="text-gray-400 uppercase text-[9px] font-black tracking-[0.3em] italic opacity-70">Tarikh / Date</p>
                <p className="font-black text-3xl text-black tabular-nums tracking-tighter leading-none">{data.date}</p>
            </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative z-10 flex-grow mb-16">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y-2 border-black">
              <th className="py-5 px-2 text-left text-[11px] font-black uppercase tracking-[0.5em] text-black bg-black/[0.02]">
                Keterangan Perkhidmatan / Services
              </th>
              <th className="py-5 px-2 text-right text-[11px] font-black uppercase tracking-[0.5em] w-48 text-black bg-black/[0.02]">
                Jumlah (RM)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 border-b-2 border-black">
            {data.items.map((item, idx) => (
              <tr key={idx} className="group hover:bg-black/[0.01]">
                <td className="p-7">
                    <p className="font-legal font-bold text-[16px] uppercase tracking-tight text-gray-900 leading-relaxed">
                      {item.name}
                    </p>
                </td>
                <td className="p-7 text-right font-black tabular-nums text-2xl text-black">
                  {item.price.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {/* Structural Spacers for visual balance */}
            {Array.from({ length: Math.max(0, 3 - data.items.length) }).map((_, i) => (
              <tr key={`spacer-${i}`} className="h-16">
                <td className="p-7"></td>
                <td className="p-7"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes & Summary Section */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12 mt-auto">
        <div className="flex-1 w-full space-y-8">
          {data.notes && (
            <div className="p-6 bg-black/[0.02] border border-black/5 rounded-sm italic relative">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 absolute -top-2 left-4 bg-[#fcfcf9] px-2">Nota / Remarks</span>
                <p className="text-gray-700 text-[12px] leading-[1.8] whitespace-pre-line font-serif">{data.notes}</p>
            </div>
          )}
          <div className="pt-4 opacity-25 select-none grayscale">
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">HMA-DOC-VERIFY-{data.docNo.replace(/-/g,'')}</p>
            <p className="text-[7px] font-mono mt-1">SISTEM PENGURUSAN PEGUAM SYARIE V2.5.0</p>
          </div>
        </div>

        <div className="min-w-[360px] text-right">
            <div className="border-t-[1px] border-black/20 pt-6 mb-2">
              <p className="text-[11px] font-black uppercase text-gray-500 tracking-[0.4em] mb-4">
                {docType === 'RECEIPT' ? 'JUMLAH DITERIMA' : docType === 'INVOICE' ? 'JUMLAH PERLU DIBAYAR' : 'ANGGARAN TOTAL'}
              </p>
              <div className="flex items-baseline justify-end gap-3">
                <span className="text-3xl font-bold font-legal italic opacity-30">RM</span>
                <span className="text-[72px] font-black tabular-nums tracking-[-0.05em] text-black leading-none">
                    {data.total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="h-1 bg-black w-full mt-4"></div>
        </div>
      </div>

      {/* Footer / Signature Area */}
      <div className="relative z-10 grid grid-cols-2 gap-24 pt-20 mt-10">
        <div className="text-center">
            <div className="h-24 border-b border-black/10 mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-gray-400 opacity-60">Tandatangan Penerima</p>
        </div>
        
        <div className="text-center group relative">
            <div className="h-24 relative flex items-center justify-center border-b-[2.5px] border-black mb-4">
              <div className="absolute w-36 h-36 border-[4px] border-black/5 rounded-full flex items-center justify-center text-[7.5px] font-black text-black/10 uppercase -rotate-12 border-double select-none group-hover:opacity-20 transition-opacity">
                  METERAI RASMI FIRMA / FIRM SEAL
              </div>
            </div>
            <p className="text-[12px] font-legal font-bold uppercase tracking-[0.3em] text-black">Hairi Mustafa Associates</p>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.25em] mt-2 opacity-70">Peguam Syarie & Pesuruhjaya Sumpah</p>
        </div>
      </div>

      {/* Floating Controls Overlay - Non Printing */}
      <div className="fixed top-8 right-8 z-[150] flex flex-col items-end gap-4 no-print">
        <button 
            onClick={() => window.print()} 
            className="bg-black text-[#FFD700] px-12 py-5 rounded-2xl font-black text-sm flex items-center gap-5 hover:bg-gray-900 transition-all shadow-2xl uppercase tracking-widest active:scale-95 border border-white/5 group animate-slideUp"
        >
          <i className="fas fa-print text-2xl group-hover:rotate-12 transition-transform"></i> 
          <span>CETAK RESIT RASMI</span>
        </button>
        <button 
            onClick={onClose} 
            className="bg-white text-black w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-4xl hover:bg-gray-100 shadow-2xl border border-black/10 active:scale-95 transition-all"
        >
            &times;
        </button>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center opacity-[0.05] text-[7.5px] font-black tracking-[2em] uppercase pointer-events-none select-none">
          OFFICIAL LEGAL DOCUMENT • HAIRI MUSTAFA ASSOCIATES • BALING KEDAH
      </div>
    </div>
  );
};

export default Receipt;

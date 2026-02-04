
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

  // Labels and metadata logic for different document types
  const getDocLabels = () => {
    if (data.isStatement) return {
      watermark: 'STATEMENT',
      typeLabel: 'PENYATA AKAUN',
      customerLabel: 'Penyata Akaun Fail Bagi:',
      totalLabel: 'BAKI TERTUNGGAK KESELURUHAN',
      footerNote: 'Sila jelaskan baki tertunggak dalam tempoh 14 hari dari tarikh penyata ini.'
    };
    
    switch (docType) {
      case 'INVOICE':
        return {
          watermark: 'INVOICE',
          typeLabel: 'INVOIS',
          customerLabel: 'Bil Kepada / Bill To:',
          totalLabel: 'JUMLAH PERLU DIBAYAR',
          footerNote: 'Terma Pembayaran: Tunai/Cek atas nama HAIRI MUSTAFA ASSOCIATES.'
        };
      case 'QUOTATION':
        return {
          watermark: 'QUOTATION',
          typeLabel: 'SEBUTHARGA',
          customerLabel: 'Sebut Harga Kepada / To:',
          totalLabel: 'JUMLAH SEBUTHARGA',
          footerNote: 'Sebut harga ini sah untuk tempoh 30 hari dari tarikh yang tertera.'
        };
      case 'RECEIPT':
      default:
        return {
          watermark: 'OFFICIAL',
          typeLabel: 'RESIT RASMI',
          customerLabel: 'Diterima Daripada / Received From:',
          totalLabel: 'JUMLAH DITERIMA / TOTAL RECEIVED',
          footerNote: 'Terima kasih atas urusan anda bersama firma kami.'
        };
    }
  };

  const labels = getDocLabels();

  // Floating Controls Component for reuse
  const ControlPanel = () => (
    <div className="fixed top-8 right-8 z-[150] flex flex-col items-end gap-4 no-print animate-fadeIn">
      <div className="bg-black/80 backdrop-blur-md text-[#FFD700] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 mb-2 shadow-2xl">
        <i className="fas fa-circle-info mr-2"></i> Pilih "Save as PDF" di menu cetakan
      </div>
      
      <button 
        onClick={() => window.print()} 
        className="group bg-black text-[#FFD700] px-10 py-5 rounded-2xl font-black text-xs flex items-center gap-6 hover:bg-gray-900 transition-all shadow-2xl uppercase tracking-widest border border-white/20 active:scale-95 w-full justify-between"
      >
        <span className="flex items-center gap-4">
          <i className="fas fa-print text-xl group-hover:scale-110 transition-transform"></i> 
          <span>CETAK DOKUMEN</span>
        </span>
        <i className="fas fa-chevron-right opacity-30"></i>
      </button>

      <button 
        onClick={() => window.print()} 
        className="group bg-[#FFD700] text-black px-10 py-5 rounded-2xl font-black text-xs flex items-center gap-6 hover:bg-[#FFA500] transition-all shadow-2xl uppercase tracking-widest border border-black/10 active:scale-95 w-full justify-between"
      >
        <span className="flex items-center gap-4">
          <i className="fas fa-file-pdf text-xl group-hover:scale-110 transition-transform"></i> 
          <span>SIMPAN SEBAGAI PDF</span>
        </span>
        <i className="fas fa-download opacity-30"></i>
      </button>

      <button 
        onClick={onClose} 
        className="bg-white text-black w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-3xl hover:bg-gray-100 shadow-2xl border border-black/10 active:scale-90 transition-all mt-4"
      >
        &times;
      </button>
    </div>
  );

  if (isThermal) {
    return (
      <div className="bg-white text-black p-4 w-[80mm] mx-auto font-mono text-[12px] animate-fadeIn relative">
        <div className="text-center mb-6">
          <img src={displayLogo} alt="Logo" className="h-14 mx-auto mb-2 grayscale" />
          <h1 className="font-bold text-lg leading-tight uppercase">HAIRI MUSTAFA ASSOCIATES</h1>
          <p className="text-[10px] uppercase">Peguam Syarie & Pesuruhjaya Sumpah</p>
          <div className="border-t border-dashed border-black mt-2 pt-2">
            <h2 className="font-bold text-base underline uppercase">{labels.typeLabel}</h2>
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

        <ControlPanel />
      </div>
    );
  }

  return (
    <div className="text-black p-12 md:p-16 min-h-[210mm] border-[1px] border-black/10 shadow-2xl relative flex flex-col overflow-hidden animate-fadeIn font-legal bg-white" 
         style={{ background: '#fcfcf9' }}>
      
      {/* High-End Paper Fiber Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-multiply" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
           }}>
      </div>
      
      {/* Structural Subtle Grid Lines */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* Elegant Large Diagonal Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.015]">
        <span className="text-black font-bold text-[160px] -rotate-[35deg] uppercase tracking-[0.6em]">
          {labels.watermark}
        </span>
      </div>

      {/* Header Section: Professional Letterhead Identity */}
      <div className="relative z-10 flex flex-row items-start justify-between mb-12 pb-10 border-b-[3px] border-black">
        <div className="flex flex-row items-center gap-12">
          <div className="shrink-0">
             <img src={displayLogo} alt="Logo" className="h-36 w-auto object-contain" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-[42px] font-bold m-0 leading-none uppercase text-black tracking-tight">
              HAIRI MUSTAFA ASSOCIATES
            </h1>
            <p className="text-[14px] font-black m-0 uppercase tracking-[0.5em] text-gray-500 mt-2 font-sans">
              Peguam Syarie & Pesuruhjaya Sumpah
            </p>
            <div className="text-[10px] mt-6 text-gray-600 leading-relaxed font-sans font-medium uppercase tracking-[0.15em] max-w-sm">
              Lot 02, Bangunan Arked Mara, 09100 Baling, Kedah Darul Aman<br/>
              Tel: +60 11 5653 1310 | Emel: hairimustafa.legal@gmail.com
            </div>
          </div>
        </div>
        
        <div className="mt-2 shrink-0">
            <div className="border-[3px] border-black px-14 py-6 bg-white text-black min-w-[220px] text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                <span className="text-[11px] font-black tracking-[0.3em] uppercase block mb-1 opacity-50 font-sans">DOKUMEN RASMI</span>
                <span className="text-3xl font-bold uppercase tracking-widest leading-none">
                  {labels.typeLabel}
                </span>
            </div>
        </div>
      </div>

      {/* Information Grid: Reference and Client Details */}
      <div className="relative z-10 grid grid-cols-2 gap-20 mb-16">
        <div className="space-y-4">
            <div className="p-10 border-[2px] border-gray-300 bg-white/50 shadow-sm min-h-[180px] relative">
                <div className="absolute top-0 left-0 w-[6px] h-full bg-black"></div>
                <p className="text-gray-400 uppercase text-[11px] font-black mb-6 tracking-[0.25em] italic font-sans opacity-80">
                  {labels.customerLabel}
                </p>
                <p className="font-bold text-4xl uppercase leading-tight text-black mb-3">
                  {data.customer}
                </p>
                {data.customerPhone && <p className="text-[13px] font-black text-gray-500 tracking-[0.1em] uppercase font-sans">T: {data.customerPhone}</p>}
                {data.customerAddress && (
                   <p className="text-[12px] text-gray-500 uppercase leading-relaxed font-medium mt-6 max-w-xs italic font-sans">
                     {data.customerAddress}
                   </p>
                )}
            </div>
        </div>
        
        <div className="text-right flex flex-col items-end justify-start gap-12 pt-8">
            <div className="flex flex-col items-end">
                <p className="text-gray-400 uppercase text-[11px] font-black tracking-[0.25em] mb-3 opacity-80 font-sans">No. Rujukan / Ref No.</p>
                <p className="text-4xl font-black tracking-[0.18em] font-mono text-black leading-none">{data.docNo}</p>
            </div>
            <div className="flex flex-col items-end">
                <p className="text-gray-400 uppercase text-[11px] font-black tracking-[0.25em] mb-3 opacity-80 font-sans">Tarikh Dokumen / Date</p>
                <p className="font-black text-4xl text-black tabular-nums leading-none">{data.date}</p>
            </div>
        </div>
      </div>

      {/* Items Content Table */}
      <div className="relative z-10 flex-grow mb-16">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y-[3px] border-black bg-black/[0.04]">
              <th className="py-8 px-8 text-left text-[13px] font-black uppercase tracking-[0.25em] text-black font-sans">
                Butiran Perkhidmatan & Transaksi / Description
              </th>
              <th className="py-8 px-8 text-right text-[13px] font-black uppercase tracking-[0.25em] w-72 text-black font-sans">
                Amaun (RM)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 border-b-[3px] border-black">
            {data.items.map((item, idx) => (
              <tr key={idx} className="bg-white/40 hover:bg-white/70 transition-colors">
                <td className="py-10 px-8">
                    <p className="font-bold text-[20px] uppercase tracking-tight text-black leading-tight">
                      {item.name}
                    </p>
                </td>
                <td className={`py-10 px-8 text-right font-black tabular-nums text-3xl ${item.price < 0 ? 'text-green-700' : 'text-black'}`}>
                  {item.price.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {/* Proportional Table Padding */}
            {Array.from({ length: Math.max(0, 3 - data.items.length) }).map((_, i) => (
              <tr key={i} className="h-24"><td></td><td></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section with Grand Total */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-16 mt-auto">
        <div className="flex-1 w-full">
          {data.notes && (
            <div className="mb-12 p-10 border border-black/10 rounded-sm bg-white/80 italic text-[14px] text-gray-700 leading-relaxed shadow-sm relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-gray-100"></div>
                <p className="text-[12px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4 not-italic font-sans">Nota / Remarks</p>
                {data.notes}
            </div>
          )}
          <div className="space-y-4 border-l-4 border-gray-100 pl-6">
            <div className="text-[13px] font-black text-gray-600 uppercase tracking-[0.3em] font-sans">
              * {labels.footerNote}
            </div>
            <div className="text-[12px] font-bold text-gray-300 uppercase tracking-[0.4em] italic font-sans select-none">
              DOKUMEN PENJANAAN SISTEM DIGITAL - SAH TANPA TANDATANGAN
            </div>
          </div>
        </div>

        <div className="min-w-[500px] text-right p-16 bg-white border-[12px] border-black shadow-[16px_16px_0px_rgba(0,0,0,0.1)] relative">
            <p className="text-[16px] font-black uppercase tracking-[0.5em] mb-6 text-gray-400 text-center font-sans">
              {labels.totalLabel}
            </p>
            <div className="flex items-baseline justify-center gap-10">
              <span className="text-6xl font-black opacity-20">RM</span>
              <span className="text-[120px] font-black tabular-nums tracking-tighter leading-none text-black">
                  {data.total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
              </span>
            </div>
        </div>
      </div>

      {/* Professional Firm Footer */}
      <div className="relative z-10 flex justify-between items-center pt-14 mt-20 border-t-[2px] border-gray-300">
        <div>
           <p className="text-[18px] font-bold uppercase tracking-[0.3em] text-black">HAIRI MUSTAFA ASSOCIATES</p>
           <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-2 font-sans">Peguam Syarie & Pesuruhjaya Sumpah</p>
        </div>
        <div className="text-right">
           <p className="text-[12px] font-black uppercase tracking-[0.8em] text-gray-200 font-sans">SISTEM PENGURUSAN HMA v2.5</p>
        </div>
      </div>

      <ControlPanel />
    </div>
  );
};

export default Receipt;

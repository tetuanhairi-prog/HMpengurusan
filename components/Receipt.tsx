
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DEFAULT_LOGO } from '../constants';
import { formatDate } from '../utils/dateUtils';

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
    customHeader?: string;
    customFooter?: string;
    companyAddress?: string;
    companyContact?: string;
    paymentMethod?: string;
    paymentRef?: string;
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
  const [localCustomer, setLocalCustomer] = useState(data.customer);
  const [localAddress, setLocalAddress] = useState(data.customerAddress || '');
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalCustomer(data.customer);
    setLocalAddress(data.customerAddress || '');
  }, [data.customer, data.customerAddress]);

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

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      // Hide control panel during capture
      const controls = receiptRef.current.querySelector('.no-print');
      if (controls) (controls as HTMLElement).style.display = 'none';

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      if (controls) (controls as HTMLElement).style.display = '';

      const imgData = canvas.toDataURL('image/png');
      
      if (isThermal) {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [80, (canvas.height * 80) / canvas.width]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 80, (canvas.height * 80) / canvas.width);
        pdf.save(`${data.docNo}.pdf`);
      } else {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5'
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 148, 210);
        pdf.save(`${data.docNo}.pdf`);
      }
    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Gagal menjana PDF. Sila cuba lagi.");
    }
  };

  const handlePrint = () => {
    if (window.self !== window.top) {
      alert("Sistem mengesan anda berada dalam mod Pratonton (Preview). Sila klik butang 'SIMPAN PDF' untuk memuat turun, atau buka aplikasi di Tab Baru (ikon di penjuru kanan atas) untuk mencetak secara terus.");
    }
    window.print();
  };

  // Labels and metadata logic for different document types
  const getDocLabels = () => {
    if (data.isStatement) return {
      watermark: 'PENYATA',
      typeLabel: 'PENYATA AKAUN FAIL',
      customerLabel: 'Penyata Akaun Bagi:',
      totalLabel: 'BAKI AKAUN KESELURUHAN',
      footerNote: 'Sila jelaskan baki tertunggak (jika ada) dalam tempoh 14 hari.'
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
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[150] flex flex-col items-end gap-3 no-print animate-slideUp">
      <div className="flex flex-col gap-3 bg-black/60 p-2.5 rounded-full backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <button 
          onClick={handlePrint} 
          className="group bg-[#111] text-[#FFD700] w-12 h-12 md:w-14 md:h-14 rounded-full font-black flex items-center justify-center hover:bg-[#FFD700] hover:text-black transition-all duration-300 shadow-lg border border-white/10 hover:scale-110 active:scale-95 relative"
          title="Cetak Dokumen"
        >
          <i className="fas fa-print text-lg md:text-xl"></i>
          <span className="absolute right-full mr-4 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
            Cetak Dokumen
          </span>
        </button>

        <button 
          onClick={handleDownloadPDF} 
          className="group bg-[#111] text-white w-12 h-12 md:w-14 md:h-14 rounded-full font-black flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 shadow-lg border border-white/10 hover:scale-110 active:scale-95 relative"
          title="Simpan PDF"
        >
          <i className="fas fa-file-pdf text-lg md:text-xl"></i>
          <span className="absolute right-full mr-4 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
            Simpan PDF
          </span>
        </button>

        <div className="w-8 h-px bg-white/20 mx-auto my-1"></div>

        <button 
          onClick={onClose} 
          className="group bg-rose-500 text-white w-12 h-12 md:w-14 md:h-14 rounded-full font-black flex items-center justify-center hover:bg-rose-600 transition-all duration-300 shadow-lg border border-rose-400/50 hover:scale-110 active:scale-95 relative"
          title="Tutup Pratonton"
        >
          <i className="fas fa-times text-lg md:text-xl"></i>
          <span className="absolute right-full mr-4 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
            Tutup Pratonton
          </span>
        </button>
      </div>
    </div>
  );

  if (isThermal) {
    return (
      <div ref={receiptRef} id="receipt-print" className="bg-white text-black p-4 w-[80mm] mx-auto font-mono text-[12px] animate-fadeIn relative print:m-0 print:w-full">
        <div className="text-center mb-6">
          <img src={displayLogo} alt="Logo" className="h-14 mx-auto mb-2 grayscale" />
          <h1 className="font-bold text-lg leading-tight uppercase">{data.customHeader || 'HAIRI MUSTAFA ASSOCIATES'}</h1>
          <p className="text-[10px] uppercase">Peguam Syarie & Pesuruhjaya Sumpah</p>
          <div className="border-t border-dashed border-black mt-2 pt-2">
            <h2 className="font-bold text-base underline uppercase">{labels.typeLabel}</h2>
          </div>
        </div>

        <div className="mb-4 space-y-1">
          <p><span className="font-bold">TARIKH:</span> {formatDate(data.date)}</p>
          <div className="border-t border-black/10 pt-1 flex items-start">
            <span className="font-bold mr-1">KLIEN:</span>
            <input 
              type="text"
              value={localCustomer}
              onChange={e => setLocalCustomer(e.target.value.toUpperCase())}
              className="bg-transparent border-none p-0 focus:outline-none w-full uppercase font-mono text-[12px] hover:bg-black/5 transition-colors print:hover:bg-transparent"
            />
          </div>
          {data.paymentMethod && data.docType === 'RECEIPT' && (
            <p className="border-t border-black/10 pt-1"><span className="font-bold">BAYARAN:</span> {data.paymentMethod} {data.paymentRef ? `(${data.paymentRef})` : ''}</p>
          )}
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
    <div ref={receiptRef} id="receipt-print" className="text-black p-6 md:p-8 w-[148mm] min-h-[210mm] relative flex flex-col overflow-hidden animate-fadeIn bg-white print:shadow-none print:border-0 print:p-6 print:w-[148mm] print:h-[210mm] print:min-h-0" 
         style={{ background: '#ffffff' }}>
      
      {/* High-End Paper Fiber Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-multiply" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
           }}>
      </div>

      {/* Elegant Large Diagonal Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.01]">
        <span className="text-black font-bold text-[80px] -rotate-[35deg] uppercase tracking-[0.8em] font-sans">
          {labels.watermark}
        </span>
      </div>

      {/* Header Section: Professional Letterhead Identity */}
      <div className="relative z-10 flex flex-row items-start justify-between mb-4 pb-3 border-b border-black">
        <div className="flex flex-row items-center gap-4">
          <div className="shrink-0">
             <img src={displayLogo} alt="Logo" className="h-16 w-auto object-contain" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-xl font-bold m-0 leading-none uppercase text-black tracking-tight font-legal">
              {data.customHeader || 'HAIRI MUSTAFA ASSOCIATES'}
            </h1>
            <p className="text-[9px] font-black m-0 uppercase tracking-[0.2em] text-gray-500 mt-0.5 font-sans">
              Peguam Syarie & Pesuruhjaya Sumpah
            </p>
            <div className="text-[7px] mt-1.5 text-gray-600 leading-tight font-sans font-medium uppercase tracking-[0.05em] max-w-xs whitespace-pre-line">
              {data.companyAddress || 'Lot 02, Bangunan Arked Mara, 09100 Baling, Kedah Darul Aman'}
              <br/>
              {data.companyContact || 'Tel: +60 11 5653 1310 | Emel: hairimustafa.legal@gmail.com'}
            </div>
          </div>
        </div>
        
        <div className="shrink-0">
            <div className="border border-black px-4 py-2 bg-white text-black min-w-[120px] text-center shadow-[3px_3px_0px_rgba(255,215,0,1)]">
                <span className="text-[7px] font-black tracking-[0.15em] uppercase block mb-0.5 border-b border-black/5 pb-0.5 font-sans opacity-50">DOKUMEN RASMI</span>
                <span className="text-lg font-bold uppercase tracking-widest leading-none font-legal">
                  {labels.typeLabel}
                </span>
            </div>
        </div>
      </div>

      {/* Information Grid: Reference and Client Details */}
      <div className="relative z-10 grid grid-cols-2 gap-6 mb-4">
        <div className="space-y-1.5">
            <div className="p-3 border border-gray-100 bg-white shadow-sm min-h-[80px] relative group">
                <div className="absolute top-0 left-0 w-[3px] h-full bg-legal-gold"></div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity no-print text-gray-300 text-xs pointer-events-none">
                  <i className="fas fa-edit"></i>
                </div>
                <p className="text-gray-400 uppercase text-[8px] font-black mb-1.5 tracking-[0.15em] italic font-sans">
                  {labels.customerLabel}
                </p>
                <input
                  type="text"
                  value={localCustomer}
                  onChange={e => setLocalCustomer(e.target.value.toUpperCase())}
                  className="font-bold text-lg uppercase leading-tight text-black mb-0.5 font-legal bg-transparent border-none p-0 focus:outline-none w-full hover:bg-black/5 transition-colors print:hover:bg-transparent"
                  placeholder="NAMA KLIEN"
                />
                {data.customerPhone && <p className="text-[9px] font-black text-gray-500 tracking-[0.05em] uppercase font-sans">T: {data.customerPhone}</p>}
                <textarea
                  value={localAddress}
                  onChange={e => setLocalAddress(e.target.value.toUpperCase())}
                  className="text-[8px] text-gray-500 uppercase leading-tight font-medium mt-1.5 max-w-[180px] w-full italic font-sans bg-transparent border-none p-0 focus:outline-none resize-none hover:bg-black/5 transition-colors print:hover:bg-transparent overflow-hidden"
                  placeholder="ALAMAT KLIEN..."
                  rows={3}
                />
            </div>
        </div>
        
        <div className="text-right flex flex-col items-end justify-start gap-3 pt-1">
            <div className="flex flex-col items-end">
                <p className="text-gray-400 uppercase text-[8px] font-black tracking-[0.15em] mb-0.5 font-sans">Tarikh Dokumen / Date</p>
                <p className="font-black text-lg text-black tabular-nums leading-none font-sans">{formatDate(data.date)}</p>
            </div>
            {data.paymentMethod && data.docType === 'RECEIPT' && (
              <div className="flex flex-col items-end mt-1">
                  <p className="text-gray-400 uppercase text-[8px] font-black tracking-[0.15em] mb-0.5 font-sans">Kaedah Bayaran</p>
                  <p className="font-bold text-[10px] text-black uppercase font-sans">{data.paymentMethod} {data.paymentRef ? `(${data.paymentRef})` : ''}</p>
              </div>
            )}
        </div>
      </div>

      {/* Items Content Table */}
      <div className="relative z-10 flex-grow mb-3">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y border-black bg-black/[0.01]">
              <th className="py-1.5 px-3 text-left text-[8px] font-black uppercase tracking-[0.1em] text-black font-sans">
                Butiran Perkhidmatan & Transaksi
              </th>
              <th className="py-1.5 px-3 text-right text-[8px] font-black uppercase tracking-[0.1em] w-28 text-black font-sans">
                Amaun (RM)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 border-b border-black">
            {data.items.map((item, idx) => (
              <tr key={idx} className="bg-white">
                <td className="py-2 px-3">
                    <p className="font-bold text-[11px] uppercase tracking-tight text-black leading-tight font-sans">
                      {item.name}
                    </p>
                </td>
                <td className={`py-2 px-3 text-right font-black tabular-nums text-base font-sans ${item.price < 0 ? 'text-green-700' : 'text-black'}`}>
                  {item.price.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section with Grand Total */}
      <div className="relative z-10 flex flex-col gap-3 mt-auto">
        <div className="flex flex-row justify-between items-end gap-4">
          <div className="flex-1">
            {data.notes && (
              <div className="mb-3 p-2 border border-black/5 rounded-sm bg-white italic text-[9px] text-gray-700 leading-tight shadow-sm relative">
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-legal-gold/20"></div>
                  <p className="text-[7px] font-black uppercase tracking-[0.1em] text-gray-400 mb-0.5 not-italic font-sans">Nota / Remarks</p>
                  {data.notes}
              </div>
            )}
            <div className="space-y-0.5 border-l border-legal-gold/20 pl-2">
              <div className="text-[8px] font-black text-gray-600 uppercase tracking-[0.05em] font-sans">
                * {labels.footerNote}
              </div>
              <div className="text-[7px] font-bold text-gray-300 uppercase tracking-[0.15em] italic font-sans select-none">
                DOKUMEN PENJANAAN SISTEM DIGITAL - SAH TANPA TANDATANGAN
              </div>
            </div>
          </div>

          <div className="min-w-[180px] text-right p-3 bg-white border-2 border-black shadow-[4px_4px_0px_rgba(255,215,0,1)] relative">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-1.5 text-gray-400 text-center font-sans">
                {labels.totalLabel}
              </p>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-base font-black opacity-20 font-sans">RM</span>
                <span className="text-3xl font-black tabular-nums tracking-tighter leading-none text-black font-sans">
                    {data.total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </span>
              </div>
          </div>
        </div>

        {/* Professional Firm Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div>
             <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black font-legal">{data.customHeader || 'HAIRI MUSTAFA ASSOCIATES'}</p>
             <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 font-sans">
               {data.customFooter || 'Peguam Syarie & Pesuruhjaya Sumpah'}
             </p>
          </div>
          <div className="text-right">
             <p className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-200 font-sans">SISTEM HMA v2.5</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          body {
            background: white;
          }
          #receipt-print {
            width: 148mm;
            height: 210mm;
            margin: 0 auto;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />

      <ControlPanel />
    </div>
  );
};

export default Receipt;

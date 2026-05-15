
import React from 'react';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const links: { id: PageId; label: string; icon: string }[] = [
    { id: 'guaman', label: 'GUAMAN', icon: 'fa-gavel' },
    { id: 'invoice', label: 'JANA RESIT/INV', icon: 'fa-receipt' },
  ];

  return (
    <nav className="sticky top-4 z-50 flex justify-center px-4 pointer-events-none mb-8">
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-1.5 rounded-2xl flex gap-1 shadow-lg shadow-slate-200/50 overflow-x-auto max-w-full no-scrollbar pointer-events-auto">
        {links.map((link) => {
          const isInvoice = link.id === 'invoice';
          const isActive = currentPage === link.id;
          
          return (
            <button
              key={link.id}
              onClick={() => onPageChange(link.id)}
              className={`
                whitespace-nowrap px-6 py-3 text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-2.5 uppercase tracking-widest rounded-xl
                ${isActive 
                  ? 'bg-black text-white shadow-lg shadow-slate-300' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }
                active:scale-95
              `}
            >
              <i className={`fas ${link.icon} ${isActive ? 'text-white' : 'text-slate-400'}`}></i>
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;

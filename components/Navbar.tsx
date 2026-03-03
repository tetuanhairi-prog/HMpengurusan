
import React from 'react';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const links: { id: PageId; label: string; icon: string }[] = [
    { id: 'guaman', label: 'GUAMAN', icon: 'fa-gavel' },
    { id: 'pjs', label: 'REKOD PJS', icon: 'fa-stamp' },
    { id: 'inventory', label: 'SENARAI SERVIS', icon: 'fa-briefcase' },
    { id: 'invoice', label: 'JANA RESIT/INV', icon: 'fa-receipt' },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 p-2 flex overflow-x-auto no-scrollbar">
      <div className="flex mx-auto gap-3">
        {links.map((link) => {
          const isInvoice = link.id === 'invoice';
          const isActive = currentPage === link.id;
          
          return (
            <button
              key={link.id}
              onClick={() => onPageChange(link.id)}
              className={`
                whitespace-nowrap px-8 py-3.5 text-[11px] font-black transition-all flex items-center gap-3 uppercase tracking-[0.15em] rounded-xl border
                ${isActive 
                  ? isInvoice
                    ? 'bg-white text-black shadow-[0_0_45px_rgba(255,255,255,0.7)] border-white scale-[1.05]'
                    : 'bg-[#FFD700] text-black shadow-[0_0_25px_rgba(255,215,0,0.4)] border-[#FFD700] scale-[1.05]' 
                  : 'text-gray-100 hover:text-[#FFD700] hover:bg-white/5 border-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }
                hover:scale-105 active:scale-95
              `}
            >
              <i className={`fas ${link.icon} ${isActive ? (isInvoice ? 'text-black' : 'text-black') : 'text-[#FFD700]/70'}`}></i>
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;

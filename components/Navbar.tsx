
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
    <nav className="sticky top-4 z-50 flex justify-center px-4 pointer-events-none mb-8">
      <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-x-auto max-w-full no-scrollbar pointer-events-auto">
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
                  ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }
                active:scale-95
              `}
            >
              <i className={`fas ${link.icon} ${isActive ? 'text-black' : 'text-gray-500'}`}></i>
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;

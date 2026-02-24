
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
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onPageChange(link.id)}
            className={`
              whitespace-nowrap px-8 py-3.5 text-[11px] font-black transition-all flex items-center gap-3 uppercase tracking-[0.15em]
              ${currentPage === link.id 
                ? 'bg-legal-gold text-white rounded-xl shadow-[0_0_20px_rgba(197,161,102,0.3)] ring-2 ring-black/5' 
                : 'text-gray-100 hover:text-legal-gold hover:bg-white/5 rounded-xl border border-white/5'
              }
            `}
          >
            <i className={`fas ${link.icon} ${currentPage === link.id ? 'text-white' : 'text-legal-gold/70'}`}></i>
            <span>{link.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;

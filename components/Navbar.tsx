
import React from 'react';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange }) => {
  const links: { id: PageId; label: string; icon: string }[] = [
    { id: 'guaman', label: 'Guaman', icon: 'fa-gavel' },
    { id: 'pjs', label: 'PJS', icon: 'fa-stamp' },
    { id: 'inventory', label: 'Servis', icon: 'fa-briefcase' },
    { id: 'invoice', label: 'Jana Resit', icon: 'fa-receipt' },
  ];

  return (
    <nav className="bg-[#222] border-b border-[#333] p-1 flex overflow-x-auto no-scrollbar">
      <div className="flex mx-auto gap-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onPageChange(link.id)}
            className={`
              whitespace-nowrap px-4 py-3 text-sm font-bold transition-all flex items-center gap-2
              ${currentPage === link.id 
                ? 'bg-[#FFD700] text-black rounded-md' 
                : 'text-[#FFD700] hover:bg-white/5'
              }
            `}
          >
            <i className={`fas ${link.icon}`}></i>
            <span className="hidden sm:inline">{link.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;

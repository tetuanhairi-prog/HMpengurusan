import React, { useRef } from 'react';
import { DEFAULT_LOGO } from '../constants';

interface HeaderProps {
  logo: string | null;
  onLogoChange: (logo: string) => void;
}

const Header: React.FC<HeaderProps> = ({ logo, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayLogo = logo || DEFAULT_LOGO;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onLogoChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-6 text-center shadow-lg relative">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-white/90 p-2 rounded-lg shadow-inner mb-2">
          {displayLogo && (
            <img src={displayLogo} alt="Firm Logo" className="h-20 w-auto object-contain" />
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-black tracking-tighter leading-tight">
          HAIRI MUSTAFA ASSOCIATES
        </h1>
        <p className="text-black/80 font-bold text-xs md:text-sm uppercase tracking-widest">
          Peguam Syarie & Pesuruhjaya Sumpah
        </p>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 px-4 py-1.5 bg-black text-[#FFD700] text-[10px] font-black rounded-full hover:bg-gray-800 transition-all uppercase tracking-wider shadow-md"
        >
          <i className="fas fa-image mr-1"></i> Tukar Logo Firma
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleLogoUpload} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </header>
  );
};

export default Header;

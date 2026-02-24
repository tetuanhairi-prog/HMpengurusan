
import React, { useRef } from 'react';
import { DEFAULT_LOGO } from '../constants';
import { ThemeMode } from '../types';

interface HeaderProps {
  logo: string | null;
  theme: ThemeMode;
  onLogoChange: (logo: string) => void;
  onToggleTheme: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ logo, theme, onLogoChange, onToggleTheme, onBackup, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const displayLogo = logo || DEFAULT_LOGO;
  const isDarkMode = theme === 'dark';

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

  const handleRestoreClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
      // Reset input so the same file can be picked again if needed
      e.target.value = '';
    }
  };

  return (
    <header className="bg-black p-6 text-center shadow-lg relative border-b border-[#FFD700]/30">
      {/* System Controls Group */}
      <div className="absolute top-6 right-6 flex flex-col sm:flex-row gap-3 z-20">
        <div className="flex gap-2">
          <button 
            onClick={onBackup}
            className="w-10 h-10 rounded-xl bg-[#111] text-[#FFD700] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border border-[#FFD700]/20"
            title="Backup Semua Data"
          >
            <i className="fas fa-cloud-download-alt"></i>
          </button>
          <button 
            onClick={() => restoreInputRef.current?.click()}
            className="w-10 h-10 rounded-xl bg-[#111] text-[#FFD700] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all border border-[#FFD700]/20"
            title="Restore Data dari Fail"
          >
            <i className="fas fa-cloud-upload-alt"></i>
          </button>
        </div>
        
        <button 
          onClick={onToggleTheme}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFD700] text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-black/10"
          title={`Tukar ke Mode ${isDarkMode ? 'Cahaya' : 'Gelap'}`}
        >
          <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="bg-white p-2 rounded-lg shadow-inner mb-2">
          {displayLogo && (
            <img src={displayLogo} alt="Firm Logo" className="h-20 w-auto object-contain" />
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[#FFD700] tracking-tighter leading-tight">
          HAIRI MUSTAFA ASSOCIATES
        </h1>
        <p className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest">
          Peguam Syarie & Pesuruhjaya Sumpah
        </p>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 px-4 py-1.5 bg-[#FFD700] text-black text-[10px] font-black rounded-full hover:bg-[#FFA500] transition-all uppercase tracking-wider shadow-md"
        >
          <i className="fas fa-image mr-1"></i> Tukar Logo Firma
        </button>
        
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleLogoUpload} 
          accept="image/*" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={restoreInputRef} 
          onChange={handleRestoreClick} 
          accept=".json" 
          className="hidden" 
        />
      </div>
    </header>
  );
};

export default Header;


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
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const displayLogo = logo || DEFAULT_LOGO;
  const isDarkMode = theme === 'dark';

  const handleRestoreClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
      // Reset input so the same file can be picked again if needed
      e.target.value = '';
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onLogoChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
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
            className="w-10 h-10 rounded-xl bg-[#0a0a0a] text-[#FFD700] flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-black active:scale-95 transition-all border border-white/10 group"
            title="Backup Semua Data"
          >
            <i className="fas fa-cloud-download-alt group-hover:scale-125 transition-transform duration-300"></i>
          </button>
          <button 
            onClick={() => restoreInputRef.current?.click()}
            className="w-10 h-10 rounded-xl bg-[#0a0a0a] text-[#FFD700] flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-black active:scale-95 transition-all border border-white/10 group"
            title="Restore Data dari Fail"
          >
            <i className="fas fa-cloud-upload-alt group-hover:scale-125 transition-transform duration-300"></i>
          </button>
        </div>
        
        <button 
          onClick={onToggleTheme}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FFD700] text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.5)] hover:scale-110 hover:rotate-180 active:scale-90 transition-all duration-700 border-2 border-white/30"
          title={`Tukar ke Mode ${isDarkMode ? 'Cahaya' : 'Gelap'}`}
        >
          <i className="fas fa-cog text-xl"></i>
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div 
          className="bg-white p-2 rounded-lg shadow-inner mb-2 cursor-pointer hover:opacity-80 transition-opacity relative group"
          onClick={() => logoInputRef.current?.click()}
          title="Klik untuk tukar logo"
        >
          {displayLogo && (
            <img src={displayLogo} alt="Firm Logo" className="h-20 w-auto object-contain" />
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <i className="fas fa-camera text-white text-xl"></i>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[#FFD700] tracking-tighter leading-tight">
          HAIRI MUSTAFA ASSOCIATES
        </h1>
        <p className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest">
          Peguam Syarie & Pesuruhjaya Sumpah
        </p>
        
        {/* Hidden File Input for Restore */}
        <input 
          type="file" 
          ref={restoreInputRef} 
          onChange={handleRestoreClick} 
          accept=".json" 
          className="hidden" 
        />
        {/* Hidden File Input for Logo */}
        <input 
          type="file" 
          ref={logoInputRef} 
          onChange={handleLogoUpload} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </header>
  );
};

export default Header;

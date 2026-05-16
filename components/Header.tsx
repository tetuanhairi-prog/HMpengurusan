
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
    <header className="bg-white dark:bg-[#000000] pt-16 pb-12 text-center relative border-b border-slate-200 dark:border-white/10 flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-black/5 dark:bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* System Controls Group */}
      <div className="absolute top-4 right-4 flex flex-col sm:flex-row gap-2 z-20">
        <div className="flex gap-2">
          <button 
            onClick={onBackup}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-[#111111] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-slate-300 dark:border-white/20 transition-all flex items-center justify-center shadow-lg group"
            title="Backup Semua Data"
          >
            <i className="fas fa-cloud-download-alt text-xs md:text-sm group-hover:scale-110 transition-transform duration-300"></i>
          </button>
          <button 
            onClick={() => restoreInputRef.current?.click()}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-[#111111] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:border-slate-300 dark:border-white/20 transition-all flex items-center justify-center shadow-lg group"
            title="Restore Data dari Fail"
          >
            <i className="fas fa-cloud-upload-alt text-xs md:text-sm group-hover:scale-110 transition-transform duration-300"></i>
          </button>
        </div>
      </div>

      <div className="relative group mb-8 z-10">
        <div 
          className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-[#222222] ring-4 ring-slate-100 dark:ring-white/10 shadow-xl bg-white dark:bg-[#000000] flex items-center justify-center transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          onClick={() => logoInputRef.current?.click()}
          title="Klik untuk tukar logo"
        >
          {displayLogo && (
            <img src={displayLogo} alt="Firm Logo" className="w-full h-full object-contain p-2" />
          )}
        </div>
        <label 
          className="absolute bottom-2 right-2 bg-black dark:bg-white text-white dark:text-black p-3 rounded-full cursor-pointer shadow-xl hover:bg-slate-100 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
          onClick={() => logoInputRef.current?.click()}
        >
          <i className="fas fa-camera"></i>
        </label>
      </div>

      <div className="z-10 relative">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2 drop-shadow-2xl">
          Hairi Mustafa <span className="text-black dark:text-white font-light italic">&</span> Associates
        </h1>
        <p className="text-black dark:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.4em] drop-shadow-md">
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

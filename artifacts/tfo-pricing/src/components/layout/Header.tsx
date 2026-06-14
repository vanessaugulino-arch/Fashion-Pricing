import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 z-50 w-full h-[56px] flex items-center justify-between px-6 bg-[#2F1B20] border-b border-white/10">
      <div className="font-sans font-semibold text-[13px] tracking-widest text-white uppercase">
        THE FASHION OFFICE
      </div>
      <div className="font-sans font-light text-[12px] text-white/60">
        Ferramenta de Precificação
      </div>
    </header>
  );
}
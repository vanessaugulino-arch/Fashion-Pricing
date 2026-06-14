import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useToolStore } from '@/store/useToolStore';

export default function BackButton() {
  const goBack = useToolStore((state) => state.goBack);

  return (
    <button
      onClick={goBack}
      className="flex items-center gap-1.5 text-sm font-sans text-gray-500 hover:text-gray-900 transition-colors mb-6"
    >
      <ChevronLeft size={16} />
      Voltar
    </button>
  );
}
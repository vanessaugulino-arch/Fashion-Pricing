import React from 'react';

type StatusType = 'ok' | 'warning' | 'critical' | 'excellent' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config: Record<StatusType, { bg: string, text: string, border: string, defaultLabel: string }> = {
    ok: { bg: 'bg-[#ECFDF5]', text: 'text-[#065F46]', border: 'border-[#A7F3D0]', defaultLabel: 'Dentro da média' },
    excellent: { bg: 'bg-[#ECFDF5]', text: 'text-[#065F46]', border: 'border-[#A7F3D0]', defaultLabel: 'Acima da média' },
    warning: { bg: 'bg-[#FFFBEB]', text: 'text-[#92400E]', border: 'border-[#FDE68A]', defaultLabel: 'Abaixo da média' },
    critical: { bg: 'bg-[#FEF2F2]', text: 'text-[#7F1D1D]', border: 'border-[#FECACA]', defaultLabel: 'Atenção necessária' },
    info: { bg: 'bg-[#EFF6FF]', text: 'text-[#1E3A5F]', border: 'border-[#BFDBFE]', defaultLabel: 'Informação' },
  };

  const style = config[status];

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-sans font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {label || style.defaultLabel}
    </span>
  );
}
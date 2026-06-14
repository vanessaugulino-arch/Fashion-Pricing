import React, { forwardRef } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MoneyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  info?: string;
}

const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ label, info, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <div className="flex items-center gap-1">
            <label className="text-sm font-sans font-medium text-[#2F1B20]">{label}</label>
            {info && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">{info}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          <span className="absolute left-3 text-gray-500 font-sans text-[15px] pointer-events-none">R$</span>
          <input
            ref={ref}
            type="number"
            step="any"
            className={`w-full border-[1.5px] border-gray-300 rounded-xl py-3 pr-3 pl-9 text-right font-sans text-[15px] outline-none transition-shadow focus:border-[#7C9DD0] focus:ring-[3px] focus:ring-[#7C9DD0]/15 ${className || ''}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);
MoneyInput.displayName = 'MoneyInput';

export default MoneyInput;
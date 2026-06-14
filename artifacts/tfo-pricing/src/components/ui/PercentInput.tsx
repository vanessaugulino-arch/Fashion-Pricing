import React, { forwardRef } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PercentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  info?: string;
}

const PercentInput = forwardRef<HTMLInputElement, PercentInputProps>(
  ({ label, info, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <div className="flex items-center gap-1">
            <label className="text-sm font-sans font-medium text-[#2F1B20]">{label}</label>
            {info && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">{info}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="number"
            step="any"
            className={`w-full border-[1.5px] border-gray-300 rounded-xl py-3 pl-3 pr-8 text-center font-sans text-[15px] outline-none transition-shadow focus:border-[#7C9DD0] focus:ring-[3px] focus:ring-[#7C9DD0]/15 ${className || ''}`}
            {...props}
          />
          <span className="absolute right-3 text-gray-500 font-sans text-[15px] pointer-events-none">%</span>
        </div>
      </div>
    );
  }
);
PercentInput.displayName = 'PercentInput';

export default PercentInput;
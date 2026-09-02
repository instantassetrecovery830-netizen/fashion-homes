import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, RefreshCw, Check } from 'lucide-react';
import { useCurrency, CURRENCIES, CurrencyCode } from '../context/CurrencyContext.tsx';

interface CurrencySelectorProps {
  compact?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ compact = false, className = '' }) => {
  const { currency, setCurrency, rates, config, isLoadingRates, lastUpdated, refreshRates } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
          isOpen ? 'bg-luxury-gold text-white' : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
        }`}
        title="Change Currency & Region"
      >
        <span className="text-sm">{config.flag}</span>
        <span>{config.code} ({config.symbol})</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-sm shadow-xl z-50 animate-fade-in divide-y divide-gray-100">
          <div className="p-3 bg-gray-50/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Globe size={11} className="text-luxury-gold" /> Currency & Region
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  refreshRates();
                }}
                disabled={isLoadingRates}
                className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-black transition-colors"
                title="Refresh Live Exchange Rates"
              >
                <RefreshCw size={11} className={isLoadingRates ? 'animate-spin text-luxury-gold' : ''} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400">Prices auto-convert in real-time across the platform.</p>
          </div>

          <div className="py-1">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const item = CURRENCIES[code];
              const isSelected = currency === code;
              const rate = rates[code];

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelect(code)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-gray-50 font-bold text-luxury-black' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.flag}</span>
                    <div>
                      <div className="font-semibold flex items-center gap-1">
                        {item.code} <span className="text-gray-400 font-normal">({item.symbol})</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-normal">{item.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {code === 'USD' ? '1.00' : `1$ = ${rate.toLocaleString()}`}
                    </span>
                    {isSelected && <Check size={14} className="text-luxury-gold stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {lastUpdated && (
            <div className="p-2 bg-gray-50 text-[9px] text-gray-400 text-center italic">
              Live Rates Refreshed: {lastUpdated}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

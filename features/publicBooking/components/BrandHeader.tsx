
import React from 'react';

interface BrandHeaderProps {
  name: string;
  logo?: string;
  primaryColor?: string;
}

const BrandHeader: React.FC<BrandHeaderProps> = ({ name, logo, primaryColor = '#4f46e5' }) => {
  return (
    <header className="bg-white border-b border-slate-100 py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {logo ? (
          <img src={logo} alt={name} className="h-16 w-auto mb-4" />
        ) : (
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4"
            style={{ backgroundColor: primaryColor }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
        <div 
          className="w-12 h-1 rounded-full mt-2"
          style={{ backgroundColor: primaryColor }}
        />
      </div>
    </header>
  );
};

export default BrandHeader;

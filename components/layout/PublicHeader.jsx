
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

const PublicHeader = ({ clinicName, logo, primaryColor = '#4f46e5' }) => {
  const navigate = useNavigate();
  const user = api.getCurrentUser();

  return (
    <header className="bg-white/70 border-b border-slate-100 sticky top-0 z-50 backdrop-blur-2xl">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-50">
            {logo ? (
              <img src={logo} alt={clinicName} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ backgroundColor: primaryColor }}>
                {clinicName?.[0] || 'C'}
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-black text-slate-900 block leading-none tracking-tighter">{clinicName || 'ClinicaHub'}</span>
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5 block">Portal de Agendamento</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {user && (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
              MEU PAINEL
            </button>
          )}
          <div className="w-1.5 h-8 bg-slate-100 rounded-full" />
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border-2 border-white shadow-inner">
             <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;

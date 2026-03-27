
import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userClinics, setUserClinics] = useState<any[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [showClinicSelector, setShowClinicSelector] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      setLoadingClinics(true);
      api.getUserClinics(user.id)
        .then(setUserClinics)
        .catch(err => console.error("Erro clinics selector:", err))
        .finally(() => setLoadingClinics(false));
    }
  }, [user?.id, user?.clinicId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowClinicSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentClinic = userClinics.find(c => c.clinic_id === user?.clinicId);

  const handleOpenPublicPage = () => {
    if (currentClinic?.slug) {
      navigate(`/booking?clinic=${currentClinic.slug}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchClinic = (clinicId: string, role: string) => {
    if (clinicId === user?.clinicId) {
      setShowClinicSelector(false);
      return;
    }
    api.switchClinic(clinicId, role);
  };

  if (!user?.clinicId) return null;

  const navItems = [
    { label: 'Agenda', path: '/dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    ), roles: ['admin', 'collaborator', 'colaborador', 'administrador'] },
    { label: 'Histórico', path: '/history', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ), roles: ['admin', 'collaborator', 'colaborador', 'administrador'] },
    { label: 'Serviços', path: '/services', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    ), roles: ['admin', 'administrador'] },
    { label: 'Profissionais', path: '/providers', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
    ), roles: ['admin', 'administrador'] },
    { label: 'Equipe', path: '/members', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ), roles: ['admin', 'administrador'] },
    { label: 'Minhas Unidades', path: '/units', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    ), roles: ['admin', 'administrador'] },
    { label: 'Configurações', path: '/settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ), roles: ['admin', 'collaborator', 'colaborador', 'administrador'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'collaborator'));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100 space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <span className="font-bold text-slate-900 tracking-tight">ClinicaHub</span>
           </div>

           <div className="relative" ref={selectorRef}>
              <button 
                onClick={() => setShowClinicSelector(!showClinicSelector)}
                disabled={loadingClinics}
                className={`w-full p-3 rounded-xl border transition-all text-left flex items-center justify-between group ${showClinicSelector ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} ${loadingClinics ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Unidade Ativa</p>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {loadingClinics ? 'Carregando...' : (currentClinic?.name || 'Selecione...')}
                  </p>
                </div>
                {!loadingClinics && (
                  <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showClinicSelector ? 'rotate-180 text-indigo-600' : 'group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
              
              {showClinicSelector && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
                  <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase px-2">Trocar Unidade</p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {userClinics.map(c => (
                      <button
                        key={c.clinic_id}
                        onClick={() => handleSwitchClinic(c.clinic_id, c.role)}
                        className={`w-full p-3 text-left text-xs transition-colors flex items-center justify-between ${c.clinic_id === user?.clinicId ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="truncate">{c.name}</span>
                        {c.clinic_id === user?.clinicId && (
                          <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
           </div>

           <button 
             onClick={handleOpenPublicPage}
             className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             Página de Agendamento
           </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider mt-0.5">{user?.role === 'admin' ? 'Administrador' : 'Colaborador'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:hidden">
           <span className="font-bold text-slate-900">ClinicaHub</span>
           <button onClick={handleLogout} className="text-red-600 font-medium text-sm">Sair</button>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

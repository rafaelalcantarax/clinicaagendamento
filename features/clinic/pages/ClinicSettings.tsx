
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import Toast from '../../../components/ui/Toast';
import Loading from '../../../components/common/Loading';
import { ClinicConfig, WorkingHours, Subscription, User, ClinicBlockage } from '../../../types';

const DAYS_OF_WEEK = [
  { day: 1, name: 'Segunda-feira' },
  { day: 2, name: 'Terça-feira' },
  { day: 3, name: 'Quarta-feira' },
  { day: 4, name: 'Quinta-feira' },
  { day: 5, name: 'Sexta-feira' },
  { day: 6, name: 'Sábado' },
  { day: 0, name: 'Domingo' },
];

const ClinicSettings: React.FC = () => {
  const { user, initialize } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [blockages, setBlockages] = useState<ClinicBlockage[]>([]);
  
  // Novos campos de bloqueio
  const [blockageStart, setBlockageStart] = useState('');
  const [blockageEnd, setBlockageEnd] = useState('');
  const [blockageReason, setBlockageReason] = useState('');

  const [profileData, setProfileData] = useState<Partial<User>>({
    name: user?.name || '',
    phone: user?.phone || '',
    photo_url: user?.photo_url || '',
    birth_date: user?.birth_date || ''
  });

  const [clinicData, setClinicData] = useState<Partial<ClinicConfig>>({
    id: '',
    name: '',
    slug: '',
    address: '',
    city: '',
    phone: '',
    cover_url: '',
    logo_url: '',
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    welcome_text: 'Agende sua consulta de forma rápida e segura.'
  });

  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(() => 
    DAYS_OF_WEEK.map(d => ({
      day: d.day,
      enabled: d.day >= 1 && d.day <= 5,
      start: '08:00',
      end: '18:00'
    }))
  );

  const fetchBlockages = async () => {
    if (user?.clinicId) {
      const data = await api.getClinicBlockages(user.clinicId);
      // Filtrar apenas bloqueios globais (sem provider_id) para esta tela
      setBlockages(data.filter(b => !b.provider_id));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.clinicId) return;
      try {
        setFetching(true);
        const [clinics, sub] = await Promise.all([
          api.getUserClinics(user.id),
          api.getSubscriptionDetails(user.clinicId)
        ]);
        
        const current = clinics.find(c => c.clinic_id === user.clinicId);
        setSubscription(sub);
        
        if (current && user.role === 'admin') {
          const detailed = await api.getClinicBySlug(current.slug);
          if (detailed) {
            setClinicData(detailed);
            if (detailed.working_hours && Array.isArray(detailed.working_hours)) {
              setWorkingHours(currentHours => {
                return currentHours.map(defaultDay => {
                  const savedDay = (detailed.working_hours as WorkingHours[]).find(sd => Number(sd.day) === defaultDay.day);
                  return savedDay ? { ...defaultDay, ...savedDay, enabled: !!savedDay.enabled } : defaultDay;
                });
              });
            }
          }
          await fetchBlockages();
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        phone: user.phone || '',
        photo_url: user.photo_url || '',
        birth_date: user.birth_date || ''
      });
      setImgError(false);
    }
  }, [user]);

  const handleToggleDay = (dayIndex: number) => {
    setWorkingHours(prev => {
      const next = [...prev];
      next[dayIndex] = { ...next[dayIndex], enabled: !next[dayIndex].enabled };
      return next;
    });
  };

  const handleTimeChange = (dayIndex: number, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => {
      const next = [...prev];
      next[dayIndex] = { ...next[dayIndex], [field]: value };
      return next;
    });
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await api.updateProfile(user.id, {
        name: profileData.name,
        phone: profileData.phone,
        photo_url: profileData.photo_url,
        birth_date: profileData.birth_date
      });
      initialize();
      setToast({ message: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Erro ao atualizar perfil.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlockage = async () => {
    if (!user?.clinicId || !blockageStart || !blockageEnd) return;
    setLoading(true);
    try {
      await api.addClinicBlockage(user.clinicId, blockageStart, blockageEnd, blockageReason);
      await fetchBlockages();
      setBlockageStart('');
      setBlockageEnd('');
      setBlockageReason('');
      setToast({ message: 'Período de bloqueio adicionado!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Erro ao salvar bloqueio.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBlockage = async (id: string) => {
    if (!confirm("Remover este bloqueio? A agenda voltará a ficar disponível neste período.")) return;
    try {
      await api.removeClinicBlockage(id);
      await fetchBlockages();
      setToast({ message: 'Bloqueio removido.', type: 'info' });
    } catch (err) {
      setToast({ message: 'Erro ao remover bloqueio.', type: 'error' });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'A foto deve ter no máximo 5MB.', type: 'error' });
      return;
    }
    setIsUploading(true);
    setImgError(false);
    try {
      const photoUrl = await api.uploadProfilePhoto(file, user.id);
      await api.updateProfile(user.id, { photo_url: photoUrl });
      setProfileData(prev => ({ ...prev, photo_url: photoUrl }));
      initialize();
      setToast({ message: 'Foto enviada!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Erro ao enviar foto.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const saveSettings = async () => {
    if (!clinicData.id) return;
    setLoading(true);
    try {
      await api.updateClinicGeneral(clinicData.id, {
        address: clinicData.address,
        city: clinicData.city,
        phone: clinicData.phone,
        cover_url: clinicData.cover_url,
        logo_url: clinicData.logo_url,
        primary_color: clinicData.primary_color,
        secondary_color: clinicData.secondary_color,
        welcome_text: clinicData.welcome_text
      });
      setToast({ message: 'Dados salvos!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Erro ao salvar dados.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    if (!user?.clinicId) return;
    setLoading(true);
    try {
      await api.updateClinicAvailability(user.clinicId, workingHours);
      setToast({ message: 'Horários atualizados!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Erro ao salvar horários.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loading />;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h1>
          <p className="text-slate-500 font-medium">Gerencie suas informações e preferências.</p>
        </div>
      </div>

      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto max-w-full">
        <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Meu Perfil</button>
        {isAdmin && (
          <>
            <button onClick={() => setActiveTab('clinic')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'clinic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Dados da Clínica</button>
            <button onClick={() => setActiveTab('availability')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'availability' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Disponibilidade</button>
            <button onClick={() => setActiveTab('billing')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'billing' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Assinatura</button>
          </>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'profile' && (
          <div className="p-8 md:p-12 space-y-10">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                  {(profileData.photo_url && !imgError) ? (
                    <img src={profileData.photo_url} alt="Avatar" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                  ) : (
                    <span className="text-4xl font-black text-slate-300 uppercase">{user?.name?.[0]}</span>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 active:scale-90">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              </div>
              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 transition-all outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 transition-all outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
                    <input type="date" value={profileData.birth_date} onChange={e => setProfileData({...profileData, birth_date: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 transition-all outline-none" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                     <input type="email" value={user?.email} disabled className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl font-bold text-slate-400 cursor-not-allowed outline-none" />
                  </div>
                </div>
                <Button onClick={saveProfile} disabled={loading} className="w-full md:w-auto px-10 py-4 rounded-2xl shadow-xl shadow-indigo-100">
                  {loading ? 'Salvando...' : 'Salvar Perfil'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'availability' && isAdmin && (
          <div className="p-8 md:p-12 space-y-12">
            <section className="space-y-6">
              <header className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Horário Semanal de Funcionamento</h3>
                <p className="text-slate-500 text-sm">Defina os horários padrão que sua clínica atende.</p>
              </header>
              <div className="space-y-3">
                {workingHours.map((wh, idx) => (
                  <div key={wh.day} className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${wh.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleToggleDay(idx)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${wh.enabled ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-200'}`}>
                        {wh.enabled ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : <div className="w-2 h-2 bg-slate-200 rounded-full" />}
                      </button>
                      <span className="font-bold text-slate-700 min-w-[120px]">{DAYS_OF_WEEK.find(d => d.day === wh.day)?.name}</span>
                    </div>
                    {wh.enabled && (
                      <div className="flex items-center gap-4">
                        <input type="time" value={wh.start} onChange={e => handleTimeChange(idx, 'start', e.target.value)} className="px-4 py-2.5 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none" />
                        <span className="text-slate-300 font-bold">até</span>
                        <input type="time" value={wh.end} onChange={e => handleTimeChange(idx, 'end', e.target.value)} className="px-4 py-2.5 bg-slate-50 border-none rounded-xl font-bold text-slate-700 outline-none" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={saveAvailability} disabled={loading} className="w-full md:w-auto px-10 py-4 rounded-2xl shadow-xl shadow-indigo-100">
                Salvar Horários
              </Button>
            </section>

            <section className="pt-12 border-t border-slate-100 space-y-8">
              <header className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Recessos e Pausas Globais</h3>
                <p className="text-slate-500 text-sm">Desative a agenda de toda a clínica para feriados, férias coletivas ou reformas.</p>
              </header>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Início da Pausa</label>
                    <input type="date" value={blockageStart} onChange={e => setBlockageStart(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fim da Pausa</label>
                    <input type="date" value={blockageEnd} onChange={e => setBlockageEnd(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Motivo (Ex: Férias)</label>
                    <input type="text" placeholder="Férias, Feriado..." value={blockageReason} onChange={e => setBlockageReason(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-indigo-100" />
                  </div>
                </div>
                <Button onClick={handleAddBlockage} disabled={loading || !blockageStart || !blockageEnd} className="w-full py-4 rounded-2xl shadow-lg">
                  {loading ? 'Bloqueando...' : 'Adicionar Bloqueio na Agenda'}
                </Button>
              </div>

              {blockages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pausas Ativas e Futuras</h4>
                  {blockages.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl transition-all hover:border-red-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                           <p className="font-bold text-slate-900">
                             {new Date(b.start_at).toLocaleDateString('pt-BR')} até {new Date(b.end_at).toLocaleDateString('pt-BR')}
                           </p>
                           <p className="text-xs text-slate-500 font-medium">{b.reason || 'Sem motivo detalhado'}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveBlockage(b.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'clinic' && isAdmin && (
          <div className="p-8 md:p-12 space-y-10">
            <section className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                Informações da Unidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço Completo</label>
                  <input type="text" value={clinicData.address} onChange={e => setClinicData({...clinicData, address: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                  <input type="text" value={clinicData.city} onChange={e => setClinicData({...clinicData, city: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Boas-vindas para Pacientes</label>
                <textarea value={clinicData.welcome_text} onChange={e => setClinicData({...clinicData, welcome_text: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 h-24" />
              </div>
            </section>
            <Button onClick={saveSettings} disabled={loading} className="w-full md:w-auto px-10 py-4 rounded-2xl shadow-xl shadow-indigo-100">
              Salvar Alterações
            </Button>
          </div>
        )}

        {activeTab === 'billing' && isAdmin && (
          <div className="p-8 md:p-12">
            <header className="space-y-2 mb-10">
              <h3 className="text-xl font-black text-slate-900">Plano e Faturamento</h3>
              <p className="text-slate-500 text-sm">Gerencie sua assinatura ativa.</p>
            </header>

            {subscription ? (
              <div className="space-y-8">
                <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row justify-between items-center gap-8 ${subscription.status === 'active' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="space-y-2 text-center md:text-left">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${subscription.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>Status: {subscription.status === 'active' ? 'Ativa' : 'Pendente'}</p>
                    <h4 className="text-3xl font-black text-slate-900">{subscription.plan_name}</h4>
                    <p className="text-slate-500 font-medium">Próximo vencimento: <span className="font-bold">{new Date(subscription.expires_at).toLocaleDateString('pt-BR')}</span></p>
                  </div>
                  <p className="text-4xl font-black text-slate-900">R$ {(subscription.price_cents / 100).toFixed(2)}<span className="text-xs text-slate-400 font-bold tracking-widest uppercase ml-1">/mês</span></p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/choose-plan')} className="w-full md:w-auto py-4 rounded-2xl">Mudar de Plano</Button>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                 <p className="text-slate-500 font-medium">Nenhum plano ativo encontrado para esta unidade.</p>
                 <Button onClick={() => navigate('/choose-plan')} className="px-10 py-4 rounded-2xl">Ver Planos Disponíveis</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ClinicSettings;

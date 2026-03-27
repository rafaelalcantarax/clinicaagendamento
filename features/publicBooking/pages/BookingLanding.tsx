
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PublicHeader from '../../../components/layout/PublicHeader';
import { api } from '../../../lib/api';
import { ClinicConfig, Service, Provider, WorkingHours, AvailabilityBlock } from '../../../types';
import Loading from '../../../components/common/Loading';
import SlotPicker from '../SlotPicker';

type ViewState = 'welcome' | 'booking';

const DAYS_NAME = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const BookingLanding: React.FC = () => {
  const location = useLocation();
  const [clinic, setClinic] = useState<ClinicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewState, setViewState] = useState<ViewState>('welcome');
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [blockages, setBlockages] = useState<AvailabilityBlock[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  const [patientData, setPatientData] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    cpf: '', 
    address: '', 
    birthDate: '' 
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get('clinic');
    const loadData = async () => {
      if (!slug) {
        setError("Nenhuma clínica foi especificada.");
        setLoading(false);
        return;
      }
      try {
        const data = await api.getClinicBySlug(slug);
        if (data) {
          setClinic(data);
          const [sData, pData, bData] = await Promise.all([
            api.getServices(data.id),
            api.getProviders(data.id),
            api.getAvailabilityBlocks(data.id)
          ]);
          setServices(sData);
          setProviders(pData);
          setBlockages(bData);
        } else {
          setError("Clínica não encontrada.");
        }
      } catch (err) {
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [location.search]);

  useEffect(() => {
    if (selectedProvider && selectedDate && step === 3) {
      const fetchBooked = async () => {
        setLoadingSlots(true);
        try {
          const booked = await api.getBookedSlots(selectedProvider.id, selectedDate);
          setBookedSlots(booked);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchBooked();
    }
  }, [selectedProvider, selectedDate, step]);

  const getDayConfig = () => {
    const selectedDateStr = selectedDate; 
    
    const globalBlock = blockages.find(b => {
      if (b.provider_id) return false;
      const startStr = new Date(b.start_at).toISOString().split('T')[0];
      const endStr = new Date(b.end_at).toISOString().split('T')[0];
      return selectedDateStr >= startStr && selectedDateStr <= endStr;
    });

    if (globalBlock) return { enabled: false, start: '00:00', end: '00:00', blockType: 'clinic', reason: globalBlock.reason };

    if (selectedProvider) {
      const providerBlock = blockages.find(b => {
        if (b.provider_id !== selectedProvider.id) return false;
        const startStr = new Date(b.start_at).toISOString().split('T')[0];
        const endStr = new Date(b.end_at).toISOString().split('T')[0];
        return selectedDateStr >= startStr && selectedDateStr <= endStr;
      });
      if (providerBlock) return { enabled: false, start: '00:00', end: '00:00', blockType: 'provider', reason: providerBlock.reason || 'Férias/Ausência' };
    }

    const current = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = current.getDay();
    const defaultRule = { enabled: true, start: '08:00', end: '18:00', blockType: 'none' };
    if (!clinic?.working_hours) return defaultRule;
    const rule = clinic.working_hours.find(h => Number(h.day) === dayOfWeek);
    return rule ? { ...rule, blockType: 'none' } : { ...defaultRule, enabled: false, blockType: 'weekday' };
  };

  const dayConfig = getDayConfig();

  const handleFinish = async () => {
    if (!clinic?.id || !selectedService?.id || !selectedProvider?.id || !selectedSlot) return;
    setSubmitting(true);
    try {
      await api.createAppointment(clinic.id, {
        patientName: patientData.name,
        patientPhone: patientData.phone,
        patientEmail: patientData.email,
        patientCpf: patientData.cpf,
        patientBirthDate: patientData.birthDate,
        patientAddress: patientData.address,
        serviceId: selectedService.id,
        providerId: selectedProvider.id,
        date: `${selectedDate}T${selectedSlot}:00`,
        notes: ''
      });
      window.location.hash = '/booking/success';
    } catch (err: any) {
      alert(err.message || "Falha ao agendar.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><Loading /></div>;
  if (error || !clinic) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Clínica não encontrada</h1>
        <p className="text-slate-500 mb-8">{error || "O link pode estar expirado."}</p>
        <Link to="/login" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm">Ir para o Login</Link>
      </div>
    );
  }

  const primaryColor = clinic.primary_color || '#2563eb';
  const filteredProviders = providers.filter(p => {
    const hasService = selectedService ? (p.service_ids?.includes(selectedService.id) || !p.service_ids?.length) : true;
    if (!hasService) return false;
    const selectedDateStr = selectedDate;
    const onVacation = blockages.some(b => {
      if (b.provider_id !== p.id || b.block_type !== 'vacation') return false;
      const startStr = new Date(b.start_at).toISOString().split('T')[0];
      const endStr = new Date(b.end_at).toISOString().split('T')[0];
      return selectedDateStr >= startStr && selectedDateStr <= endStr;
    });
    return !onVacation;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-inter">
      <PublicHeader clinicName={clinic.name} logo={clinic.logo_url} primaryColor={primaryColor} />
      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-12 relative overflow-hidden">
        {viewState === 'welcome' ? (
          <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700">
            <div className="relative h-[280px] overflow-hidden">
              <img src={clinic.cover_url || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1200&h=400"} alt="Capa" className="w-full h-full object-cover" />
              <div className="absolute inset-0 opacity-40" style={{ backgroundColor: primaryColor }} />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-3 rounded-3xl shadow-2xl">
                {clinic.logo_url ? (
                  <img src={clinic.logo_url} alt="Logo" className="h-16 w-auto object-contain" />
                ) : (
                   <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-3xl" style={{ backgroundColor: primaryColor }}>
                     {clinic.name?.[0]}
                   </div>
                )}
              </div>
            </div>
            
            <div className="p-8 md:p-14 space-y-10">
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{clinic.name}</h1>
                <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">{clinic.welcome_text || "Bem-vindo ao nosso portal de agendamento online."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização</p>
                      <p className="text-sm font-bold text-slate-700 leading-snug">{clinic.address || 'Endereço não informado'}</p>
                      {clinic.address && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`} 
                          target="_blank" rel="noopener noreferrer" className="text-xs font-black uppercase tracking-widest mt-2 block hover:underline" style={{ color: primaryColor }}
                        >Ver no Mapa</a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contato</p>
                      <p className="text-sm font-bold text-slate-700">{clinic.phone || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Horários
                  </p>
                  <div className="space-y-2">
                    {clinic.working_hours?.filter(h => h.enabled).map(h => (
                      <div key={h.day} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">{DAYS_NAME[h.day]}</span>
                        <span className="font-black text-slate-700">{h.start} - {h.end}</span>
                      </div>
                    )) || <p className="text-xs text-slate-400">Verifique os horários no local.</p>}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setViewState('booking')} 
                className="w-full py-7 rounded-[2.5rem] font-black text-2xl text-white shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4" 
                style={{ backgroundColor: primaryColor, boxShadow: `0 20px 50px ${primaryColor}40` }}
              >
                Agendar Agora
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl animate-in slide-in-from-bottom-10 duration-700">
            <div className="mb-10 flex justify-center gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step >= num ? 'text-white' : 'bg-white text-slate-300 border border-slate-100'}`} style={{ backgroundColor: step >= num ? primaryColor : '' }}>
                  {step > num ? '✓' : num}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-50 min-h-[550px] flex flex-col overflow-hidden">
              {step === 1 && (
                <div className="p-10 md:p-16 flex-1">
                  <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">O que deseja realizar?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(s => (
                      <button key={s.id} onClick={() => { setSelectedService(s); setStep(2); }} className="p-8 text-left border-2 border-slate-50 rounded-[2.5rem] transition-all flex items-center justify-between hover:border-slate-200 hover:bg-slate-50/30 group">
                        <div>
                          <p className="font-black text-xl text-slate-800">{s.name}</p>
                          <span className="text-[10px] font-black uppercase text-slate-400 mt-2 block tracking-widest">{s.duration} MIN</span>
                        </div>
                        <span className="font-black text-xl" style={{ color: primaryColor }}>{s.price > 0 ? `R$ ${Number(s.price).toLocaleString('pt-BR')}` : 'Consultar'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="p-10 md:p-16 flex-1">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Com quem?</h2>
                    <button onClick={() => setStep(1)} className="text-slate-400 font-bold hover:text-slate-900">Voltar</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProviders.length === 0 ? (
                      <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                         <p className="text-slate-400 font-bold">Nenhum profissional disponível.</p>
                      </div>
                    ) : (
                      filteredProviders.map(p => (
                        <button key={p.id} onClick={() => { setSelectedProvider(p); setStep(3); }} className="p-8 border-2 border-slate-50 rounded-[2.5rem] flex flex-col items-center gap-6 hover:border-slate-200 transition-all">
                          <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center font-black text-3xl overflow-hidden shadow-sm">
                            {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" /> : p.name[0]}
                          </div>
                          <div className="text-center">
                            <p className="font-black text-slate-900 text-xl">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{p.specialty || 'Especialista'}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="p-10 md:p-16 flex-1">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quando?</h2>
                    <button onClick={() => setStep(2)} className="text-slate-400 font-bold hover:text-slate-900">Voltar</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calendário</label>
                        <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100" />
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                         <p className="text-xs font-bold text-slate-400 mb-2">Resumo</p>
                         <p className="text-sm font-black text-slate-900">{selectedService?.name}</p>
                         <p className="text-xs font-bold text-indigo-600 mt-1">com {selectedProvider?.name}</p>
                      </div>
                    </div>
                    <div className="md:col-span-2 relative">
                      {loadingSlots && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}
                      {!dayConfig.enabled ? (
                        <div className="p-12 text-center bg-red-50 rounded-[2.5rem] border-2 border-dashed border-red-200">
                          <p className="text-red-600 font-black uppercase text-xs tracking-widest leading-relaxed">
                            { dayConfig.blockType === 'clinic' ? `Indisponível: ${ dayConfig.reason || 'Recesso' }` : 
                              dayConfig.blockType === 'provider' ? `${selectedProvider?.name} ausente: ${ dayConfig.reason || 'Férias' }` : 
                              'Sem atendimento neste dia' }
                          </p>
                        </div>
                      ) : (
                        <SlotPicker selectedDate={new Date(selectedDate + 'T12:00:00')} primaryColor={primaryColor} bookedSlots={bookedSlots} startTime={dayConfig.start} endTime={dayConfig.end} onSlotSelect={(slot) => { setSelectedSlot(slot); setStep(4); }} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="p-10 md:p-16 flex-1">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Finalizar Cadastro</h2>
                    <button onClick={() => setStep(3)} className="text-slate-400 font-bold hover:text-slate-900">Voltar</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
                        <input type="text" placeholder="Como devemos te chamar?" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none focus:ring-4 focus:ring-indigo-100" value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp</label>
                          <input type="tel" placeholder="(11) 99999-8888" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none focus:ring-4 focus:ring-indigo-100" value={patientData.phone} onChange={e => setPatientData({...patientData, phone: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">CPF</label>
                          <input type="text" placeholder="000.000.000-00" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none focus:ring-4 focus:ring-indigo-100" value={patientData.cpf} onChange={e => setPatientData({...patientData, cpf: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail</label>
                        <input type="email" placeholder="seu@email.com" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none focus:ring-4 focus:ring-indigo-100" value={patientData.email} onChange={e => setPatientData({...patientData, email: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Data de Nascimento</label>
                        <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none focus:ring-4 focus:ring-indigo-100" value={patientData.birthDate} onChange={e => setPatientData({...patientData, birthDate: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Endereço Completo</label>
                        <textarea placeholder="Rua, Número, Complemento, Bairro" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none focus:ring-4 focus:ring-indigo-100 h-[108px] resize-none" value={patientData.address} onChange={e => setPatientData({...patientData, address: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center mb-8">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Resumo do Agendamento</p>
                    <p className="text-2xl font-black leading-tight">{selectedService?.name}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">{selectedSlot} • {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p className="text-xs font-bold text-indigo-400 mt-2">Profissional: {selectedProvider?.name}</p>
                  </div>

                  <button onClick={handleFinish} disabled={submitting || !patientData.name || !patientData.phone} className="w-full py-8 rounded-[2.5rem] font-black text-2xl text-white shadow-2xl transition-all disabled:opacity-50" style={{ backgroundColor: primaryColor }}>
                    {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <footer className="py-12 text-center text-slate-300 text-[9px] font-black uppercase tracking-[0.5em]">
         Ambiente Seguro &bull; ClinicaHub
      </footer>
    </div>
  );
};

export default BookingLanding;

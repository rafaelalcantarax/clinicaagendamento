
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../../../components/layout/PublicHeader';
import SlotPicker from '../SlotPicker';
import { api } from '../../../lib/api';
import { Provider, Service, ClinicConfig } from '../../../types';
import Loading from '../../../components/common/Loading';

const BookingFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [clinic, setClinic] = useState<ClinicConfig | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const [patientData, setPatientData] = useState({
    name: '',
    cpf: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const slug = params.get('clinic');
    
    const loadClinicData = async () => {
      try {
        setLoading(true);
        if (!slug) throw new Error("Slug da clínica não informado.");

        const clinicData = await api.getClinicBySlug(slug);
        if (clinicData) {
          setClinic(clinicData);
          const [pData, sData] = await Promise.all([
            api.getProviders(clinicData.id),
            api.getServices(clinicData.id)
          ]);
          setProviders(pData);
          setServices(sData);
        } else {
          throw new Error("Clínica não encontrada.");
        }
      } catch (err) {
        console.error("Erro ao carregar página pública:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadClinicData();
  }, [location.search]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = async () => {
    if (!clinic?.id || !selectedService?.id || !selectedProvider?.id || !selectedSlot) {
      alert("Erro: Seleção incompleta. Por favor, escolha o serviço, o profissional e o horário.");
      return;
    }
    
    setSubmitting(true);
    try {
      await api.createPatient(clinic.id, patientData);
      
      await api.createAppointment(clinic.id, {
        patientName: patientData.name,
        patientPhone: patientData.phone,
        serviceId: selectedService.id,
        providerId: selectedProvider.id,
        date: `${selectedDate}T${selectedSlot}:00`,
        notes: `CPF: ${patientData.cpf} | Endereço: ${patientData.address}`
      });
      navigate('/booking/success');
    } catch (err: any) {
      console.error("Erro fatal ao agendar:", err);
      alert("Não foi possível concluir o agendamento.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!clinic) return null;

  const primaryColor = clinic.primary_color || '#2563eb';
  const lightBg = `${primaryColor}10`;

  const hasMappings = providers.some(p => p.service_ids && p.service_ids.length > 0);
  const filteredProviders = (selectedService && hasMappings)
    ? providers.filter(p => p.service_ids?.includes(selectedService.id))
    : providers;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PublicHeader clinicName={clinic.name} logo={clinic.logo_url} primaryColor={primaryColor} />
      
      <main className="max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Minimal Stepper */}
        <div className="mb-12 flex justify-center gap-10">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex flex-col items-center relative">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center z-10 font-black transition-all duration-700 ${
                  step >= num ? 'text-white shadow-xl' : 'bg-white text-slate-300 border border-slate-100'
                }`}
                style={{ 
                  backgroundColor: step >= num ? primaryColor : '', 
                  boxShadow: step >= num ? `0 12px 30px ${primaryColor}40` : '' 
                }}
              >
                {step > num ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                ) : num}
              </div>
              <div className={`text-[9px] mt-4 font-black uppercase tracking-[0.2em] text-center transition-colors ${step >= num ? 'text-slate-900' : 'text-slate-300'}`}>
                {num === 1 ? 'Serviço' : num === 2 ? 'Equipe' : num === 3 ? 'Horário' : 'Finalizar'}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
          {step === 1 && (
            <div className="p-10 md:p-16 animate-in fade-in slide-in-from-bottom-8 duration-700 flex-1">
              <div className="max-w-xl">
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">O que deseja realizar hoje?</h2>
                <p className="text-slate-400 font-medium text-lg mb-12">Escolha abaixo o procedimento para continuarmos.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {services.map(s => {
                  const isSelected = selectedService?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedService(s); setTimeout(nextStep, 200); }}
                      style={{ 
                        borderColor: isSelected ? primaryColor : '#f1f5f9',
                        backgroundColor: isSelected ? lightBg : ''
                      }}
                      className="w-full p-8 text-left border-2 rounded-[2rem] transition-all flex flex-col justify-between items-start group hover:border-slate-300 active:scale-[0.98]"
                    >
                      <div className="mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 transition-colors group-hover:bg-white">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className={`font-black text-xl transition-colors ${isSelected ? '' : 'text-slate-900'}`} style={{ color: isSelected ? primaryColor : '' }}>{s.name}</p>
                        <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">{s.duration} MINUTOS</p>
                      </div>
                      <div className="w-full flex justify-end">
                        <span className="font-black text-2xl" style={{ color: primaryColor }}>
                          {s.price > 0 ? `R$ ${Number(s.price).toLocaleString('pt-BR')}` : 'Consultar'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-10 md:p-16 animate-in fade-in slide-in-from-right-8 duration-700 flex-1">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Com quem?</h2>
                  <p className="text-slate-400 font-medium mt-2">Profissionais habilitados para <span className="font-black" style={{ color: primaryColor }}>{selectedService?.name}</span></p>
                </div>
                <button onClick={prevStep} className="w-12 h-12 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map(p => {
                  const isSelected = selectedProvider?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProvider(p); setTimeout(nextStep, 200); }}
                      style={{ 
                        borderColor: isSelected ? primaryColor : '#f1f5f9',
                        backgroundColor: isSelected ? lightBg : ''
                      }}
                      className="p-8 text-center border-2 rounded-[2rem] transition-all flex flex-col items-center gap-6 group active:scale-[0.98] hover:border-slate-300"
                    >
                      <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center font-black text-3xl uppercase transition-all shadow-xl ${isSelected ? 'text-white' : 'bg-slate-50 text-slate-300'}`} 
                        style={{ backgroundColor: isSelected ? primaryColor : '' }}>
                        {p.name[0]}
                      </div>
                      <div>
                        <p className={`font-black text-xl ${isSelected ? '' : 'text-slate-900'}`} style={{ color: isSelected ? primaryColor : '' }}>{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">{p.specialty || 'Especialista'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-10 md:p-16 animate-in fade-in slide-in-from-right-8 duration-700 flex-1">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Quando?</h2>
                <button onClick={prevStep} className="w-12 h-12 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-1 space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Calendário</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:ring-4 font-black text-lg text-slate-800 transition-all"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                  />
                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Resumo da Escolha</p>
                    <p className="text-sm font-bold text-slate-700 leading-snug">
                      {selectedService?.name} <br/> 
                      <span className="text-indigo-600">com {selectedProvider?.name}</span>
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <SlotPicker 
                    selectedDate={new Date(selectedDate)} 
                    primaryColor={primaryColor}
                    onSlotSelect={(slot) => { setSelectedSlot(slot); nextStep(); }} 
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-10 md:p-16 animate-in fade-in slide-in-from-right-8 duration-700 flex-1">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Finalizar</h2>
                <button onClick={prevStep} className="w-12 h-12 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
                    <input type="text" className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:ring-4 font-bold" 
                      placeholder="Como podemos te chamar?" value={patientData.name} onChange={e => setPatientData({...patientData, name: e.target.value})} style={{ '--tw-ring-color': `${primaryColor}20` } as any} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp</label>
                    <input type="tel" className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:ring-4 font-bold" 
                      placeholder="Ex: 11 99999-9999" value={patientData.phone} onChange={e => setPatientData({...patientData, phone: e.target.value})} style={{ '--tw-ring-color': `${primaryColor}20` } as any} />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">CPF (Opcional)</label>
                    <input type="text" className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:ring-4 font-bold" 
                      placeholder="000.000.000-00" value={patientData.cpf} onChange={e => setPatientData({...patientData, cpf: e.target.value})} style={{ '--tw-ring-color': `${primaryColor}20` } as any} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Observações</label>
                    <input type="text" className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:ring-4 font-bold" 
                      placeholder="Algum detalhe importante?" value={patientData.address} onChange={e => setPatientData({...patientData, address: e.target.value})} style={{ '--tw-ring-color': `${primaryColor}20` } as any} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                 <div className="flex justify-between items-center mb-6">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Confirmação de Reserva</span>
                   <span className="px-4 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase">{selectedSlot} &bull; {new Date(selectedDate).toLocaleDateString('pt-BR')}</span>
                 </div>
                 <p className="font-black text-3xl text-white mb-2 leading-none">{selectedService?.name}</p>
                 <p className="text-slate-400 font-bold text-lg italic">Atendimento com {selectedProvider?.name}</p>
              </div>

              <button 
                onClick={handleFinish}
                disabled={submitting || !patientData.name || !patientData.phone}
                className="w-full py-9 rounded-[2.5rem] font-black text-2xl md:text-3xl hover:scale-[1.02] active:scale-95 shadow-2xl transition-all flex items-center justify-center gap-5 text-white disabled:opacity-50 disabled:grayscale"
                style={{ backgroundColor: primaryColor, boxShadow: `0 30px 60px ${primaryColor}40` }}
              >
                {submitting ? (
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirmar e Agendar
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-12 text-center">
         <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.5em]">Ambiente Seguro &bull; ClinicaHub</p>
      </footer>
    </div>
  );
};

export default BookingFlow;

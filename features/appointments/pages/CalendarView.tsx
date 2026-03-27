
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Appointment, Service, Provider, ClinicConfig } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { useAuthStore } from '../../../store/auth.store';
import Toast from '../../../components/ui/Toast';

const CalendarView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [clinic, setClinic] = useState<ClinicConfig | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientCpf: '',
    patientBirthDate: '',
    patientAddress: '',
    serviceId: '',
    providerId: '',
    time: '09:00',
    notes: ''
  });

  const currentStaffProvider = providers.find(p => p.user_id === user?.id);

  const fetchData = async () => {
    if (!user?.clinicId) return;
    try {
      const [apts, svcs, provs, clinics] = await Promise.all([
        api.getAppointments(user.clinicId),
        api.getServices(user.clinicId),
        api.getProviders(user.clinicId),
        api.getUserClinics(user.id)
      ]);
      const currentClinicData = clinics.find(c => c.clinic_id === user.clinicId);
      if (currentClinicData?.slug) {
        const detailedClinic = await api.getClinicBySlug(currentClinicData.slug);
        setClinic(detailedClinic);
      }
      setAppointments(apts);
      setServices(svcs);
      setProviders(provs);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, selectedDate]);

  useEffect(() => {
    if ((user?.role === 'staff' || user?.role === 'collaborator') && currentStaffProvider && !formData.providerId) {
      setFormData(prev => ({ ...prev, providerId: currentStaffProvider.id }));
    }
  }, [currentStaffProvider, user?.role, isModalOpen]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clinicId) return;

    setSubmitting(true);
    try {
      const fullDate = `${selectedDate}T${formData.time}:00`;
      await api.createAppointment(user.clinicId, {
        ...formData,
        date: fullDate
      });
      setToast({ message: 'Agendamento realizado com sucesso!', type: 'success' });
      setIsModalOpen(false);
      setFormData({ 
        patientName: '', patientPhone: '', patientEmail: '', patientCpf: '', patientBirthDate: '', patientAddress: '',
        serviceId: '', providerId: (user?.role === 'admin' ? '' : currentStaffProvider?.id || ''), time: '09:00', notes: '' 
      });
      fetchData();
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao realizar agendamento.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBlockSlot = (time: string) => {
    const slotId = `${selectedDate}T${time}`;
    if (blockedSlots.includes(slotId)) {
      setBlockedSlots(prev => prev.filter(s => s !== slotId));
      setToast({ message: 'Horário liberado na agenda.', type: 'success' });
    } else {
      setBlockedSlots(prev => [...prev, slotId]);
      setToast({ message: 'Horário bloqueado para novos agendamentos.', type: 'info' });
    }
  };

  const timeSlots = Array.from({ length: 26 }, (_, i) => {
    const totalMinutes = (8 * 60) + (i * 30);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  });

  const getDayInfo = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay();
    const defaultRule = { enabled: dayOfWeek >= 1 && dayOfWeek <= 5, start: '08:00', end: '17:30' };
    if (!clinic?.working_hours || clinic.working_hours.length === 0) return defaultRule;
    const rule = clinic.working_hours.find(h => h.day === dayOfWeek);
    return rule || defaultRule;
  };

  const dayConfig = getDayInfo(selectedDate);
  const filteredAppointments = (user?.role === 'staff' || user?.role === 'collaborator')
    ? appointments.filter(a => a.provider_id === currentStaffProvider?.id)
    : appointments;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {(user?.role === 'staff' || user?.role === 'collaborator') ? 'Minha Agenda' : 'Agenda Central'}
          </h1>
          <p className="text-slate-500 text-sm">Visualização precisa de 30 em 30 minutos.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm" />
          <Button onClick={() => setIsModalOpen(true)}>Novo Agendamento</Button>
        </div>
      </div>

      {!dayConfig.enabled && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <span className="text-xs font-bold uppercase tracking-wider">A CLÍNICA ESTÁ FECHADA PARA AGENDAMENTOS NESTE DIA.</span>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-slate-100">
          {timeSlots.map(time => {
            const slotAppointments = filteredAppointments.filter(a => {
              const aptDate = new Date(a.date);
              const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
              const isSameDay = aptDate.getFullYear() === selYear && (aptDate.getMonth() + 1) === selMonth && aptDate.getDate() === selDay;
              const [slotH, slotM] = time.split(':').map(Number);
              return isSameDay && aptDate.getHours() === slotH && aptDate.getMinutes() === slotM;
            });
            const isBlocked = blockedSlots.includes(`${selectedDate}T${time}`);
            const isOutsideWorkingHours = time < dayConfig.start || time >= dayConfig.end || !dayConfig.enabled;

            return (
              <div key={time} className={`flex min-h-[70px] transition-colors ${isBlocked || isOutsideWorkingHours ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}>
                <div className="w-20 py-4 px-4 text-right border-r border-slate-100 flex flex-col justify-center bg-slate-50/30">
                  <span className={`text-[11px] font-black tracking-tighter ${isOutsideWorkingHours ? 'text-slate-300' : 'text-slate-500'}`}>{time}</span>
                </div>
                <div className="flex-1 p-2 flex gap-2 overflow-x-auto items-center">
                  {isOutsideWorkingHours ? (
                    <div className="flex-1 flex items-center justify-center"><span className="text-[9px] font-black text-slate-200 uppercase tracking-[0.2em]">Indisponível</span></div>
                  ) : isBlocked ? (
                    <div className="flex-1 flex items-center justify-between px-4">
                      <div className="flex items-center gap-2 text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /><span className="text-[10px] font-bold uppercase tracking-widest italic">Bloqueado</span></div>
                      <button onClick={() => toggleBlockSlot(time)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Liberar</button>
                    </div>
                  ) : slotAppointments.length > 0 ? (
                    slotAppointments.map(apt => (
                      <Link key={apt.id} to={`/appointment/${apt.id}`} className="flex-1 min-w-[240px] p-3 rounded-2xl border-2 border-indigo-100 bg-white shadow-lg shadow-indigo-100/20 text-indigo-700 hover:border-indigo-400 hover:-translate-y-0.5 transition-all">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-black text-xs truncate uppercase tracking-tight">{apt.patientName}</span>
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 leading-none">{apt.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400 truncate">{apt.service}</span>
                           {user?.role === 'admin' && <><span className="text-slate-200">•</span><span className="text-[10px] font-black text-indigo-400 truncate">{apt.provider}</span></>}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-between px-4 group h-full">
                      <span className="text-slate-200 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-indigo-200 transition-colors">Disponível</span>
                      <div className="hidden group-hover:flex gap-2">
                        <button onClick={() => { setFormData({...formData, time}); setIsModalOpen(true); }} className="px-4 py-1.5 rounded-xl bg-indigo-600 text-[10px] font-black text-white uppercase shadow-lg shadow-indigo-200 hover:scale-105 transition-all">Agendar</button>
                        <button onClick={() => toggleBlockSlot(time)} className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-400 uppercase hover:text-red-500 hover:border-red-200 transition-all">Bloquear</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento">
        <form onSubmit={handleCreateAppointment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input label="Nome do Paciente" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} required />
             <Input label="WhatsApp" value={formData.patientPhone} onChange={e => setFormData({...formData, patientPhone: e.target.value})} required />
             <Input label="E-mail" type="email" value={formData.patientEmail} onChange={e => setFormData({...formData, patientEmail: e.target.value})} />
             <Input label="CPF" value={formData.patientCpf} onChange={e => setFormData({...formData, patientCpf: e.target.value})} />
             <Input label="Nascimento" type="date" value={formData.patientBirthDate} onChange={e => setFormData({...formData, patientBirthDate: e.target.value})} />
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
               <input type="time" step="1800" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
             </div>
          </div>
          
          <Input label="Endereço" value={formData.patientAddress} onChange={e => setFormData({...formData, patientAddress: e.target.value})} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviço</label>
              <select className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} required>
                <option value="">Selecione...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profissional</label>
              <select className={`w-full px-4 py-2.5 border rounded-xl bg-slate-50 text-sm outline-none font-bold ${user?.role === 'admin' ? 'focus:ring-2 focus:ring-indigo-500' : 'opacity-70 cursor-not-allowed'}`} value={formData.providerId} onChange={e => setFormData({...formData, providerId: e.target.value})} required disabled={user?.role !== 'admin'}>
                <option value="">{user?.role === 'admin' ? 'Selecione...' : user?.name}</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Confirmar'}</Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CalendarView;


import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Appointment } from '../../../types';
import CancelDialog from '../components/CancelDialog';
import RescheduleModal from '../components/RescheduleModal';

const AppointmentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const data = await api.getAppointmentById(id);
      setAppointment(data || null);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleCancel = async () => {
    if (!id) return;
    await api.cancelAppointment(id);
    setIsCancelOpen(false);
    navigate('/dashboard');
  };

  const handleReschedule = async (newDate: string) => {
    if (!id) return;
    await api.updateAppointment(id, { date: newDate });
    const data = await api.getAppointmentById(id);
    setAppointment(data || null);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>;
  if (!appointment) return <div className="p-8 text-center text-slate-500">Agendamento não encontrado.</div>;

  const dateObj = new Date(appointment.date);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Detalhes do Agendamento</h1>
          <p className="text-slate-500">Protocolo: #{appointment.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-50 pb-4 uppercase tracking-widest text-[11px]">Dados do Paciente</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome</p>
                <p className="text-slate-900 font-bold">{appointment.patientName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-slate-900 font-bold">{appointment.patientPhone}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                <p className="text-slate-900 font-bold">{appointment.patientEmail || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CPF</p>
                <p className="text-slate-900 font-bold">{appointment.patientCpf || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nascimento</p>
                <p className="text-slate-900 font-bold">{appointment.patientBirthDate ? new Date(appointment.patientBirthDate + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</p>
              </div>
            </div>
            {appointment.patientAddress && (
              <div className="mt-8 pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço</p>
                <p className="text-slate-700 font-medium leading-relaxed">{appointment.patientAddress}</p>
              </div>
            )}
          </section>

          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-50 pb-4 uppercase tracking-widest text-[11px]">Serviço & Profissional</h2>
            <div className="space-y-6">
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profissional</p>
                  <p className="text-indigo-600 font-black">{appointment.provider}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serviço</p>
                  <p className="text-slate-900 font-bold">{appointment.service}</p>
                </div>
              </div>
              {appointment.notes && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas Internas</p>
                  <div className="bg-slate-50 p-4 rounded-xl text-slate-600 italic text-sm border border-slate-100">
                    "{appointment.notes}"
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
            <h2 className="text-[10px] font-black uppercase mb-6 tracking-[0.2em] opacity-60">Agenda</h2>
            <div className="space-y-1">
              <p className="text-4xl font-black">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-indigo-100 font-medium">{dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-white/20 border border-white/10 uppercase tracking-widest">
              {appointment.status}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => setIsRescheduleOpen(true)} className="w-full px-6 py-4 bg-white border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
              Remarcar
            </button>
            <button onClick={() => setIsCancelOpen(true)} className="w-full px-6 py-4 bg-red-50 text-red-600 border border-red-100 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <CancelDialog isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} onConfirm={handleCancel} patientName={appointment.patientName} />
      <RescheduleModal isOpen={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} onSave={handleReschedule} currentDate={appointment.date} />
    </div>
  );
};

export default AppointmentDetails;


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Appointment } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { useAuthStore } from '../../../store/auth.store';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';

const Home: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.clinicId) {
      setFetching(true);
      setError(null);
      api.getAppointments(user.clinicId)
        .then((data) => {
          setAppointments(data);
          setFetching(false);
        })
        .catch((err) => {
          console.error("Erro dashboard:", err);
          setError(err.message || "Erro ao carregar agendamentos.");
          setFetching(false);
        });
    }
  }, [user]);

  if (fetching) return <Loading />;
  
  if (error) return (
    <div className="p-12 text-center bg-red-50 rounded-2xl border border-red-100">
      <h3 className="text-red-900 font-bold mb-2">Erro de Sincronização</h3>
      <p className="text-red-600 text-sm mb-4">{error}</p>
      <div className="flex flex-col gap-2 max-w-xs mx-auto">
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        <p className="text-[10px] text-slate-400 mt-2 uppercase font-black">Certifique-se de que a tabela 'appointments' existe no Supabase.</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Agenda Central</h1>
          <p className="text-slate-500 font-medium">Fluxo de atendimento da clínica</p>
        </div>
        <Link to="/booking/flow">
          <Button>Novo Agendamento</Button>
        </Link>
      </div>
      
      {appointments.length === 0 ? (
        <EmptyState 
          title="Nenhum agendamento hoje" 
          description="Sua agenda está livre por enquanto. Compartilhe seu link de agendamento público!" 
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviço</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horário</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{apt.patientName}</p>
                      <p className="text-xs text-slate-500 font-medium">{apt.patientPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-medium">{apt.service}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{apt.provider}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 font-bold">{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{new Date(apt.date).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                        ${apt.status === 'scheduled' ? 'bg-indigo-100 text-indigo-700' : 
                          apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/appointment/${apt.id}`}>
                        <Button variant="secondary" className="!px-3 !py-1.5 text-xs">Detalhes</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

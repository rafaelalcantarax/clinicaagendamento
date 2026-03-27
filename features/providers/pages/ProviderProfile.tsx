
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const ProviderProfile: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center text-4xl font-bold">
          R
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dr. Ricardo Fontes</h1>
          <p className="text-indigo-600 font-semibold uppercase tracking-widest text-xs">Clínico Geral</p>
          <div className="flex gap-2 mt-3">
             <Button variant="secondary" className="!py-1.5 !px-3 text-xs">Editar Perfil</Button>
             <Button variant="secondary" className="!py-1.5 !px-3 text-xs">Ver Agenda Completa</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 border-b pb-4">Horários de Atendimento</h3>
          <div className="space-y-4">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(day => (
              <div key={day} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <span className="font-medium text-slate-700">{day}</span>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono">08:00 - 12:00</span>
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono">14:00 - 18:00</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl">
            <h4 className="font-bold mb-2">Desempenho</h4>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-[10px] uppercase opacity-60 font-bold">Agendamentos</p>
                <p className="text-2xl font-bold">128</p>
              </div>
              <div>
                <p className="text-[10px] uppercase opacity-60 font-bold">Taxa Comparecimento</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4">Serviços Habilitados</h4>
            <div className="flex flex-wrap gap-2">
               <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Consulta</span>
               <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Retorno</span>
               <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Procedimento</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProviderProfile;


import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const ProviderSchedule: React.FC = () => {
  const { id } = useParams();
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Horários de Atendimento</h1>
        <p className="text-slate-500">Configure as janelas de disponibilidade do profissional.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {days.map(day => (
            <div key={day} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" defaultChecked={day !== 'Domingo'} />
                <span className="font-bold text-slate-700 w-24">{day}</span>
              </div>

              <div className="flex items-center gap-2">
                <input type="time" defaultValue="08:00" className="px-3 py-2 border rounded-lg text-sm bg-slate-50" />
                <span className="text-slate-400">até</span>
                <input type="time" defaultValue="18:00" className="px-3 py-2 border rounded-lg text-sm bg-slate-50" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Intervalo:</span>
                <input type="time" defaultValue="12:00" className="px-2 py-1 border rounded text-xs bg-white" />
                <span className="text-xs text-slate-400">-</span>
                <input type="time" defaultValue="13:00" className="px-2 py-1 border rounded text-xs bg-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary">Descartar</Button>
        <Button>Salvar Escala</Button>
      </div>
    </div>
  );
};

export default ProviderSchedule;

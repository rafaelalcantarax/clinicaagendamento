
import React from 'react';
import { Button } from '../../../components/ui/Button';

const WhatsAppSettings: React.FC = () => {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex gap-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.437 0 12.045c0 2.112.552 4.173 1.6 6.009L0 24l6.115-1.604a11.79 11.79 0 005.932 1.597h.005c6.605 0 12.04-5.437 12.045-12.045a11.813 11.813 0 00-3.535-8.513" /></svg>
        </div>
        <div>
          <h3 className="font-bold text-emerald-900">Integração com WhatsApp</h3>
          <p className="text-sm text-emerald-700">Mantenha seus pacientes informados e reduza faltas em até 40% enviando lembretes automáticos.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">API Provider</label>
          <select className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50">
            <option>Z-API (Recomendado)</option>
            <option>Evolution API</option>
            <option>Twilio Business</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Instance ID</label>
            <input type="text" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: 3B8..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Instance Token</label>
            <input type="password" title="Token da instância" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••••••" />
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">Lembrete de 4 horas</span>
            <div className="w-10 h-5 bg-indigo-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">Confirmação de Agendamento</span>
            <div className="w-10 h-5 bg-indigo-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button className="flex-1">Salvar Configuração</Button>
          <Button variant="secondary">Enviar Teste</Button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettings;

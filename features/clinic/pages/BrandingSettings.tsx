
import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';

const BrandingSettings: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');

  return (
    <div className="max-w-2xl space-y-8">
      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Personalização de Marca</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Cor Primária</label>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-none"
              />
              <input 
                type="text" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg outline-none font-mono"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Esta cor será aplicada nos botões e links da sua página pública.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Logo da Clínica</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <p className="text-sm font-medium text-slate-600">Arraste sua logo ou clique para buscar</p>
              <p className="text-xs text-slate-400 mt-1">SVG, PNG ou JPG (Máx 2MB)</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
          <Button>Salvar Identidade</Button>
        </div>
      </section>

      <section className="bg-slate-900 p-8 rounded-2xl text-white">
        <h4 className="font-bold mb-2">Dica de Especialista</h4>
        <p className="text-slate-400 text-sm">
          Cores sóbrias como Azul Marinho ou Verde Musgo passam maior confiança para ambientes médicos. Evite tons muito vibrantes ou fluorescentes.
        </p>
      </section>
    </div>
  );
};

export default BrandingSettings;

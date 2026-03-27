
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

const JoinClinic: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para validar convite via API
    alert('Buscando clínica...');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Entrar em Equipe</h1>
          <p className="text-slate-500 mt-2">Digite o código que você recebeu do administrador da sua clínica.</p>
        </div>

        <form onSubmit={handleJoin} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Código de Convite</label>
            <input 
              type="text" 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Ex: CLIN-123-XYZ"
              className="w-full px-4 py-4 border-2 border-slate-100 rounded-xl text-center text-2xl font-mono focus:border-indigo-500 outline-none transition-colors"
            />
          </div>

          <Button type="submit" className="w-full py-4 text-lg">Validar e Acessar</Button>
          
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="w-full text-slate-400 text-sm font-medium hover:text-slate-600"
          >
            Voltar para o Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinClinic;

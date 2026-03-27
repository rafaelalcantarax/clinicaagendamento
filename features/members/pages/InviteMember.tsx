
import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useNavigate } from 'react-router-dom';

const InviteMember: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const navigate = useNavigate();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // Chamar API de convite
    alert(`Convite enviado para ${email}`);
    navigate('/members');
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Novo Integrante</h1>
        <p className="text-slate-500 mt-1">Expanda sua equipe enviando um convite por e-mail.</p>
      </div>

      <form onSubmit={handleInvite} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <Input 
          label="E-mail do Convidado" 
          placeholder="exemplo@clinica.com" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nível de Acesso</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`p-4 border rounded-xl text-left transition-all ${
                role === 'staff' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' : 'hover:bg-slate-50'
              }`}
            >
              <p className="font-bold text-slate-900">Colaborador</p>
              <p className="text-xs text-slate-500">Pode ver agenda e marcar consultas.</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-4 border rounded-xl text-left transition-all ${
                role === 'admin' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' : 'hover:bg-slate-50'
              }`}
            >
              <p className="font-bold text-slate-900">Administrador</p>
              <p className="text-xs text-slate-500">Acesso total às configurações e equipe.</p>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/members')}>Cancelar</Button>
          <Button type="submit">Enviar Convite</Button>
        </div>
      </form>
    </div>
  );
};

export default InviteMember;

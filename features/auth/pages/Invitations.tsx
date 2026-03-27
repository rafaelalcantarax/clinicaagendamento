
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Invitation } from '../../../types';
import { Button } from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import Toast from '../../../components/ui/Toast';
import { useAuthStore } from '../../../store/auth.store';

const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user, logout, initialize } = useAuthStore();

  const fetchInvitations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const data = await api.getInvitations(user.id);
      setInvitations(data);
    } catch (err) {
      console.error('Falha ao carregar convites:', err);
      setError(true);
      setToast({ message: 'Erro ao carregar convites. Tente novamente.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [user?.id]);

  const handleResponse = async (id: string, accept: boolean) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await api.respondToInvitation(id, accept);
      
      if (accept) {
        setToast({ message: 'Convite aceito! Atualizando sua conta...', type: 'success' });
        // Em vez de api.login, usamos o refreshSession que não pede senha
        const updatedUser = await api.refreshUserSession(user!.id);
        if (updatedUser) {
          // Inicializa a store para refletir a nova clínica ativa
          initialize();
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          navigate('/login');
        }
      } else {
        setToast({ message: 'Convite recusado.', type: 'success' });
        setInvitations(prev => prev.filter(i => i.id !== id));
      }
    } catch (err: any) {
      console.error("Erro ao processar convite:", err);
      setToast({ message: err.message || 'Erro ao responder convite.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loading />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex p-3 bg-indigo-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Suas Solicitações</h1>
          <p className="text-slate-500 mt-2">Olá {user?.name || 'usuário'}, verifique seus convites de clínicas abaixo.</p>
        </div>

        {error ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
            <p className="text-slate-600 mb-6">Não conseguimos buscar seus convites no momento.</p>
            <Button onClick={fetchInvitations}>Tentar Novamente</Button>
          </div>
        ) : !user ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
            <p className="text-slate-600 mb-6">Sessão expirada. Por favor, faça login novamente.</p>
            <Button onClick={() => navigate('/login')}>Fazer Login</Button>
          </div>
        ) : invitations.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
            <EmptyState 
              title="Nenhum convite no momento" 
              description="Quando uma clínica convidar você pelo seu e-mail, o convite aparecerá aqui." 
            />
            <div className="flex flex-col gap-3 mt-8">
              <Button variant="secondary" onClick={fetchInvitations}>Verificar Novamente</Button>
              <button 
                onClick={handleLogout}
                className="text-slate-400 text-sm hover:underline"
              >
                Sair da Conta
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {invitations.map(inv => (
              <div 
                key={inv.id} 
                className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${processingId === inv.id ? 'opacity-50 pointer-events-none scale-95' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg">
                    {inv.clinic_name?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{inv.clinic_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                        {inv.role === 'staff' ? 'Colaborador' : 'Administrador'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">Pendente</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    className="text-red-500 border-red-50"
                    onClick={() => handleResponse(inv.id, false)}
                    disabled={!!processingId}
                  >
                    Recusar
                  </Button>
                  <Button 
                    onClick={() => handleResponse(inv.id, true)}
                    disabled={!!processingId}
                  >
                    {processingId === inv.id ? 'Aceitando...' : 'Aceitar e Entrar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default Invitations;

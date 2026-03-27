
import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import Toast from '../../../components/ui/Toast';
import { useAuthStore } from '../../../store/auth.store';

const MembersList: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', role: 'collaborator' });

  const fetchMembers = async () => {
    if (!user?.clinicId) return;
    setLoading(true);
    setError(false);
    try {
      const data = await api.getClinicMembers(user.clinicId);
      setMembers(data);
    } catch (err) {
      console.error('Falha ao carregar equipe:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user?.clinicId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clinicId) return;

    setSubmitting(true);
    try {
      await api.inviteMember(user.clinicId, formData.email, formData.role);
      setToast({ message: 'Convite enviado com sucesso!', type: 'success' });
      setIsModalOpen(false);
      setFormData({ email: '', role: 'collaborator' });
      fetchMembers();
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao enviar convite.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRemove = (member: any) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleRemove = async () => {
    if (!memberToDelete) return;
    
    setSubmitting(true);
    try {
      const isInvite = memberToDelete.status === 'pending';
      await api.removeMember(memberToDelete.member_id, isInvite);
      setToast({ message: isInvite ? 'Convite cancelado.' : 'Membro removido.', type: 'success' });
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
      fetchMembers();
    } catch (err) {
      setToast({ message: 'Erro ao processar remoção.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipe da Clínica</h1>
          <p className="text-slate-500 text-sm">Gerencie administradores e colaboradores.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Convidar Membro</Button>
      </div>

      {error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600 mb-4">Ocorreu um erro ao carregar os membros.</p>
          <Button onClick={fetchMembers} variant="secondary">Tentar Novamente</Button>
        </div>
      ) : members.length === 0 ? (
        <EmptyState 
          title="Nenhum membro além de você" 
          description="Convide colaboradores ou administradores para ajudar na gestão da clínica." 
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome / E-mail</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Papel</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map(member => (
                  <tr key={member.member_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                        {['admin', 'administrador'].includes(member.role) ? 'Administrador' : 'Colaborador'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5
                          ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                            member.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                          {member.status === 'pending' && (
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                          )}
                          {member.status === 'active' ? 'Ativo' : 
                           member.status === 'pending' ? 'Pendente' : 'Recusado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.email !== user?.email && (
                        <button 
                          onClick={() => confirmRemove(member)}
                          className="text-red-600 text-xs font-bold hover:underline"
                        >
                          {member.status === 'pending' ? 'Cancelar Convite' : 'Remover'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Convidar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Convidar Novo Membro">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input 
            label="E-mail do Convidado" 
            type="email" 
            placeholder="colaborador@email.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Cargo / Permissão</label>
            <select 
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="collaborator">Colaborador (Agenda)</option>
              <option value="admin">Administrador (Total)</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" type="submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title={memberToDelete?.status === 'pending' ? "Cancelar Convite" : "Remover Membro"}
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 flex gap-3">
             <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             <p className="text-sm">
               {memberToDelete?.status === 'pending' 
                 ? `Deseja cancelar o convite enviado para ${memberToDelete?.email}?`
                 : `Você tem certeza que deseja remover ${memberToDelete?.name || memberToDelete?.email}? Esta ação é imediata.`
               }
             </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Voltar</Button>
            <Button variant="danger" className="flex-1" onClick={handleRemove} disabled={submitting}>
              {submitting ? 'Processando...' : 'Sim, Remover'}
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MembersList;

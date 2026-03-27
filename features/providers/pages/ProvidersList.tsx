
import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Provider, Service, ClinicMember, AvailabilityBlock } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useAuthStore } from '../../../store/auth.store';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import Toast from '../../../components/ui/Toast';

const ProvidersList: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [teamMembers, setTeamMembers] = useState<ClinicMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // Estados para bloqueio/férias
  const [providerBlockages, setProviderBlockages] = useState<AvailabilityBlock[]>([]);
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockType, setBlockType] = useState<'vacation' | 'custom'>('vacation');
  const [blockReason, setBlockReason] = useState('');

  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    memberId: '',
    specialty: '',
    selectedServiceIds: [] as string[]
  });

  const fetchData = async () => {
    if (user?.clinicId) {
      setLoading(true);
      try {
        const [providersData, membersData, servicesData] = await Promise.all([
          api.getProviders(user.clinicId),
          api.getMembersForProvider(user.clinicId),
          api.getServices(user.clinicId)
        ]);
        setProviders(providersData || []);
        setTeamMembers(membersData || []);
        setServices(servicesData || []);
      } catch (err) {
        setToast({ message: 'Erro ao carregar dados.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.clinicId]);

  const loadProviderBlockages = async (providerId: string) => {
    if (!user?.clinicId) return;
    try {
      const all = await api.getAvailabilityBlocks(user.clinicId);
      // Filtra apenas os bloqueios deste profissional específico
      setProviderBlockages(all.filter(b => b.provider_id === providerId));
    } catch (err) {
      console.error("Erro ao carregar bloqueios do profissional:", err);
    }
  };

  const toggleService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServiceIds: prev.selectedServiceIds.includes(id)
        ? prev.selectedServiceIds.filter(sid => sid !== id)
        : [...prev.selectedServiceIds, id]
    }));
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    loadProviderBlockages(provider.id);
    
    const currentServiceIds = provider.service_ids || [];
    
    setFormData({
      memberId: provider.user_id || '',
      specialty: provider.specialty,
      selectedServiceIds: [...currentServiceIds]
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProvider(null);
    setFormData({ memberId: '', specialty: '', selectedServiceIds: [] });
    setProviderBlockages([]);
    setBlockStart('');
    setBlockEnd('');
    setBlockReason('');
  };

  const handleAddBlockage = async () => {
    if (!editingProvider || !blockStart || !blockEnd || !user?.clinicId) return;
    setSubmitting(true);
    try {
      await api.addAvailabilityBlock(
        user.clinicId, 
        blockStart, 
        blockEnd, 
        blockReason || (blockType === 'vacation' ? 'Férias' : 'Ausência'),
        editingProvider.id,
        blockType
      );
      await loadProviderBlockages(editingProvider.id);
      setBlockStart('');
      setBlockEnd('');
      setBlockReason('');
      setToast({ message: 'Bloqueio adicionado!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Erro ao salvar bloqueio.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveBlockage = async (id: string) => {
    // IMPORTANTE: Removido o confirm() nativo pois o sandbox do navegador está bloqueando popups.
    // A ação agora é direta para garantir funcionamento.
    setSubmitting(true);
    try {
      await api.removeAvailabilityBlock(id);
      // Recarrega a lista local imediatamente
      if (editingProvider) {
        await loadProviderBlockages(editingProvider.id);
      }
      setToast({ message: 'Bloqueio removido.', type: 'info' });
    } catch (err) {
      console.error("Erro ao remover:", err);
      setToast({ message: 'Erro ao excluir bloqueio.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clinicId) return;
    
    if (formData.selectedServiceIds.length === 0) {
      setToast({ message: 'Selecione ao menos um serviço para o profissional.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      if (editingProvider) {
        await api.updateProvider(
          editingProvider.id,
          formData.specialty,
          formData.selectedServiceIds
        );
        setToast({ message: 'Profissional atualizado com sucesso!', type: 'success' });
      } else {
        const member = teamMembers.find(m => m.id === formData.memberId);
        if (!member) throw new Error("Selecione um membro da equipe.");

        await api.createProviderFromMember(
          user.clinicId, 
          member, 
          formData.specialty, 
          formData.selectedServiceIds
        );
        setToast({ message: 'Profissional configurado com sucesso!', type: 'success' });
      }
      
      closeModal();
      await fetchData();
    } catch (err: any) {
      console.error("Erro ao salvar profissional:", err);
      setToast({ message: err.message || 'Erro ao processar solicitação.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profissionais da Clínica</h1>
          <p className="text-slate-500 text-sm">Transforme membros da equipe em profissionais habilitados na agenda.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Habilitar Membro</Button>
      </div>

      {providers.length === 0 ? (
        <EmptyState 
          title="Nenhum profissional na agenda" 
          description="Apenas membros da equipe configurados aqui aparecerão no agendamento público." 
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profissional</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Especialidade</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serviços Habilitados</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {providers.map(p => {
                const pServiceIds = p.service_ids || [];
                const isAllServices = services.length > 0 && pServiceIds.length >= services.length;
                
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold uppercase border-2 border-white shadow-sm overflow-hidden">
                        {p.photo_url ? (
                          <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          p.name?.[0] || 'P'
                        )}
                      </div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">{p.specialty}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {isAllServices ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-tighter">
                            Habilitado em Todos
                          </span>
                        ) : (
                          pServiceIds.length > 0 ? (
                            pServiceIds.map(sid => {
                              const s = services.find(serv => serv.id === sid);
                              return s ? (
                                <span key={sid} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">
                                  {s.name}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-xs text-slate-400 italic">Nenhum serviço vinculado</span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <Button 
                           variant="secondary" 
                           className="!px-3 !py-1.5 text-xs"
                           onClick={() => handleEdit(p)}
                         >
                           Configurar
                         </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingProvider ? `Configurar ${editingProvider.name}` : "Configurar Novo Profissional"}
      >
        <div className="max-h-[70vh] overflow-y-auto px-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Informações e Serviços</h3>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Membro da Equipe</label>
              {editingProvider ? (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 font-bold text-sm">
                  {editingProvider.name}
                </div>
              ) : (
                <select 
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                  value={formData.memberId}
                  onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                  required
                >
                  <option value="">Selecione um membro...</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              )}
            </div>

            <Input 
              label="Especialidade Principal"
              placeholder="Ex: Ortodontista, Implantodontista..."
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              required
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviços Habilitados</label>
                <button 
                  type="button" 
                  onClick={() => setFormData(p => ({ ...p, selectedServiceIds: services.map(s => s.id) }))}
                  className="text-[9px] font-black text-indigo-600 uppercase hover:underline"
                >
                  Marcar Todos
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                {services.map(s => {
                  const isSelected = formData.selectedServiceIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold truncate">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" className="w-full py-3 rounded-xl" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>

          {editingProvider && (
            <section className="pt-6 border-t border-slate-100 space-y-4">
              <header>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Férias e Bloqueios do Profissional</h3>
                <p className="text-[10px] text-slate-500">Defina períodos em que o profissional não atende.</p>
              </header>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Início</label>
                    <input type="date" value={blockStart} onChange={e => setBlockStart(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Fim</label>
                    <input type="date" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none" />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select 
                    value={blockType} 
                    onChange={e => setBlockType(e.target.value as any)}
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                  >
                    <option value="vacation">Férias</option>
                    <option value="custom">Ausência Pontual</option>
                  </select>
                  <Button type="button" onClick={handleAddBlockage} disabled={submitting || !blockStart || !blockEnd} className="px-4 py-2 text-xs">Bloquear</Button>
                </div>
              </div>

              {providerBlockages.length > 0 && (
                <div className="space-y-2">
                   {providerBlockages.map(b => (
                     <div key={b.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                       <div className="flex-1">
                         <p className="text-[11px] font-black text-slate-900">
                           {new Date(b.start_at).toLocaleDateString('pt-BR')} - {new Date(b.end_at).toLocaleDateString('pt-BR')}
                         </p>
                         <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{b.block_type === 'vacation' ? 'FÉRIAS' : 'AUSÊNCIA'}</p>
                       </div>
                       <button 
                         type="button"
                         disabled={submitting}
                         onClick={() => handleRemoveBlockage(b.id)} 
                         className="p-2 text-slate-300 hover:text-red-500 transition-colors group disabled:opacity-30"
                         title="Remover Bloqueio"
                        >
                         <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                     </div>
                   ))}
                </div>
              )}
            </section>
          )}

          <div className="flex justify-end pt-2 pb-4">
             <button type="button" onClick={closeModal} className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 tracking-widest">Fechar Janela</button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ProvidersList;

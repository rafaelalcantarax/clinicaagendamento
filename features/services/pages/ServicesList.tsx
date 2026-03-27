
import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Service } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { useAuthStore } from '../../../store/auth.store';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import Toast from '../../../components/ui/Toast';

const ServicesList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    duration: 30,
    price: 0
  });

  const fetchServices = async () => {
    if (user?.clinicId) {
      try {
        const data = await api.getServices(user.clinicId);
        setServices(data || []);
      } catch (err) {
        setToast({ message: 'Erro ao carregar serviços.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clinicId) return;

    setSubmitting(true);
    try {
      await api.createService(user.clinicId, formData);
      setToast({ message: 'Serviço criado com sucesso!', type: 'success' });
      setIsModalOpen(false);
      setFormData({ name: '', duration: 30, price: 0 });
      fetchServices();
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao criar serviço.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Serviços</h1>
          <p className="text-slate-500 text-sm">Defina o que sua clínica oferece.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Novo Serviço</Button>
      </div>

      {services.length === 0 ? (
        <EmptyState 
          title="Nenhum serviço cadastrado" 
          description="Crie seu primeiro serviço para começar a receber agendamentos." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="font-bold text-lg text-slate-900">
                  {s.price > 0 ? `R$ ${Number(s.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Grátis'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{s.name}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Duração: {s.duration} min
              </p>
              <div className="mt-6 flex gap-2">
                <Button variant="secondary" className="flex-1 !py-2 text-sm">Editar</Button>
                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Cadastrar Novo Serviço"
      >
        <form onSubmit={handleCreateService} className="space-y-5">
          <Input 
            label="Nome do Serviço"
            placeholder="Ex: Consulta Odontológica, Limpeza, etc"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Duração (minutos)</label>
              <input 
                type="number"
                placeholder="30"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                required
                min="1"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Preço (R$)</label>
              <input 
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                required
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? 'Salvando...' : 'Criar Serviço'}
            </Button>
          </div>
        </form>
      </Modal>

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

export default ServicesList;

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import Loading from '../../../components/common/Loading';
import Toast from '../../../components/ui/Toast';

const ClinicsManagement: React.FC = () => {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const user = api.getCurrentUser();

  const fetchClinics = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await api.getUserClinics(user.id);
      setClinics(data);
    } catch (err) {
      setToast({ message: 'Erro ao carregar unidades.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newClinicName.trim()) return;

    setSubmitting(true);
    try {
      // Fix: Call createClinic with the correct clinic name and omit user.id as it's handled internally.
      await api.createClinic(newClinicName);
      setToast({ message: 'Unidade criada com sucesso!', type: 'success' });
      setIsModalOpen(false);
      setNewClinicName('');
      fetchClinics();
    } catch (err: any) {
      setToast({ message: err.message || 'Erro ao criar unidade.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitch = (clinicId: string, role: string) => {
    api.switchClinic(clinicId, role);
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Minhas Unidades</h1>
          <p className="text-slate-500 mt-1">Gerencie e alterne entre as clínicas que você administra.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Nova Unidade</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clinics.map(clinic => (
          <div 
            key={clinic.clinic_id} 
            className={`bg-white p-6 rounded-3xl border transition-all ${
              clinic.clinic_id === user?.clinicId 
                ? 'border-indigo-600 ring-4 ring-indigo-50' 
                : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                {clinic.name?.[0]}
              </div>
              {clinic.clinic_id === user?.clinicId && (
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase rounded-full">Ativa Agora</span>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1">{clinic.name}</h3>
            <p className="text-sm text-slate-400 font-medium mb-6">Unidade: {clinic.slug}</p>

            <div className="flex gap-3">
              <Button 
                variant={clinic.clinic_id === user?.clinicId ? 'secondary' : 'primary'}
                className="flex-1"
                onClick={() => handleSwitch(clinic.clinic_id, clinic.role)}
                disabled={clinic.clinic_id === user?.clinicId}
              >
                {clinic.clinic_id === user?.clinicId ? 'Já está ativa' : 'Entrar nesta Unidade'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Unidade de Atendimento">
        <form onSubmit={handleCreateClinic} className="space-y-6">
          <Input 
            label="Nome da Unidade" 
            placeholder="Ex: Unidade Centro, Clínica Filial..."
            value={newClinicName}
            onChange={e => setNewClinicName(e.target.value)}
            required
            autoFocus
          />
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-800 text-xs">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p>A criação de novas unidades pode depender do seu plano atual. Você será definido como **Administrador** desta nova unidade.</p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" type="submit" disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar Unidade'}
            </Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ClinicsManagement;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import Toast from '../../../components/ui/Toast';
import { api } from '../../../lib/api';

const Register: React.FC = () => {
  const [accountType, setAccountType] = useState<'clinic' | 'collaborator'>('clinic');
  const [services, setServices] = useState<{ name: string; duration: number; price: number }[]>([
    { name: 'Consulta Geral', duration: 30, price: 0 }
  ]);
  const [newServiceName, setNewServiceName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    clinicName: '',
    document: '', 
    specialty: '',
    employeeCount: '1',
    phone: '', // Telefone do Gestor/Colaborador
    clinicPhone: '', // Telefone exclusivo da Clínica
    address: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const navigate = useNavigate();

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    setServices([...services, { name: newServiceName, duration: 30, price: 0 }]);
    setNewServiceName('');
  };

  const removeService = (index: number) => {
    if (services.length <= 1) return;
    setServices(services.filter((_, i) => i !== index));
  };

  const handlePhoneFormat = (value: string) => {
    let clean = value.replace(/\D/g, '');
    if (clean === '') return '';
    if (!clean.startsWith('55')) clean = '55' + clean;
    return clean;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'As senhas não coincidem. Por favor, verifique.' });
      return;
    }

    if (accountType === 'clinic' && services.length === 0) {
      setStatus({ type: 'error', message: 'Você precisa cadastrar ao menos um serviço para sua clínica.' });
      return;
    }

    if (formData.phone.length < 12) {
      setStatus({ type: 'error', message: 'Telefone pessoal inválido (55 + DDD + Número).' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      if (accountType === 'clinic') {
        await api.register({
          ...formData,
          services,
          employeeCount: Number(formData.employeeCount) || 1
        });
      } else {
        await api.registerCollaborator(formData);
      }
      
      setStatus({ 
        type: 'success', 
        message: 'Conta criada com sucesso!' 
      });
      
      setTimeout(async () => {
        try {
          await api.login(formData.email, formData.password);
          if (accountType === 'clinic') {
            navigate('/choose-plan');
          } else {
            navigate('/dashboard');
          }
        } catch (err) {
          navigate('/login');
        }
      }, 1500);

    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        message: err.message || 'Erro ao criar conta.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl mb-6 shadow-xl shadow-indigo-100">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Crie sua Conta</h1>
          <p className="text-slate-500 mt-2 font-medium">Preencha os dados abaixo para configurar seu acesso.</p>
        </div>

        <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10">
          <button
            onClick={() => setAccountType('clinic')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              accountType === 'clinic' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sou Gestor de Clínica
          </button>
          <button
            onClick={() => setAccountType('collaborator')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              accountType === 'collaborator' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sou Profissional/Equipe
          </button>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Nome Completo" 
                placeholder="Dr. João Silva" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
              <Input 
                label="E-mail de Acesso" 
                type="email"
                placeholder="seu@email.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Seu WhatsApp (Pessoal)" 
                placeholder="55 + DDD + Número" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: handlePhoneFormat(e.target.value)})}
                required 
              />
              <Input 
                label="Data de Nascimento" 
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                label="Senha" 
                type="password"
                placeholder="Mínimo 6 dígitos" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
              <Input 
                label="Confirmar Senha" 
                type="password"
                placeholder="Repita sua senha" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                error={passwordMismatch ? "As senhas não conferem" : ""}
                required 
              />
            </div>
          </section>

          {accountType === 'clinic' && (
            <>
              <section className="space-y-4 pt-6 border-t border-slate-50">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Informações da Clínica</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Nome da Clínica" 
                    placeholder="Ex: Clínica Sorriso Perfeito" 
                    value={formData.clinicName}
                    onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                    required 
                  />
                  <Input 
                    label="WhatsApp da Clínica (Público)" 
                    placeholder="55 + DDD + Número" 
                    value={formData.clinicPhone}
                    onChange={(e) => setFormData({...formData, clinicPhone: handlePhoneFormat(e.target.value)})}
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Endereço Completo" 
                    placeholder="Rua Exemplo, 123" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required 
                  />
                  <Input 
                    label="Cidade" 
                    placeholder="São Paulo" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="CPF ou CNPJ" 
                    placeholder="00.000.000/0000-00" 
                    value={formData.document}
                    onChange={(e) => setFormData({...formData, document: e.target.value})}
                    required 
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Especialidade Principal</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.specialty}
                      onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                      required
                    >
                      <option value="">Selecione...</option>
                      <option value="Odontologia">Odontologia</option>
                      <option value="Psicologia">Psicologia</option>
                      <option value="Medicina">Medicina Geral</option>
                      <option value="Fisioterapia">Fisioterapia</option>
                      <option value="Estética">Estética</option>
                      <option value="Nutrição">Nutrição</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Serviços Iniciais</h2>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase">Configure o que você oferece</p>
                </div>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: Limpeza, Consulta, Harmonização..." 
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                  />
                  <Button type="button" onClick={handleAddService} variant="secondary">Adicionar</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {services.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl group animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <span className="text-sm font-bold text-indigo-900">{service.name}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeService(idx)}
                        className="text-indigo-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          <div className="pt-6">
            <Button 
              className="w-full py-5 text-lg shadow-2xl shadow-indigo-100 rounded-2xl" 
              type="submit"
              disabled={loading || passwordMismatch}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finalizando cadastro...
                </div>
              ) : 'Criar minha Conta'}
            </Button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Já tem um acesso? <br/>
            <Link to="/login" className="text-indigo-600 font-black hover:underline mt-1 inline-block">
              Entrar agora
            </Link>
          </p>
        </div>
      </div>

      {status && (
        <Toast 
          message={status.message} 
          type={status.type} 
          onClose={() => setStatus(null)} 
          duration={5000} 
        />
      )}
    </div>
  );
};

export default Register;

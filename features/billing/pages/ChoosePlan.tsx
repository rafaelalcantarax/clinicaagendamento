
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import Loading from '../../../components/common/Loading';
import Toast from '../../../components/ui/Toast';

const ChoosePlan: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const user = api.getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchPlans = async () => {
      try {
        const data = await api.getPlans();
        setPlans(data);
      } catch (err) {
        setToast({ message: 'Erro ao carregar planos disponíveis.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = (planId: string) => {
    if (!user?.clinicId) return;
    const checkoutUrl = `https://pay.pepper.com.br/checkout?plan=${planId}&clinic=${user.clinicId}`;
    window.open(checkoutUrl, '_blank');
    setToast({ message: 'Aguardando confirmação de pagamento...', type: 'info' as any });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loading /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-6">
            ✨ Plataforma de Gestão Completa
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
            Escolha o plano ideal
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Assine o <span className="text-indigo-600 font-bold">ClinicaHub</span> e tenha o controle total da sua agenda e equipe.
          </p>
        </div>

        {/* Grid de Planos - 1 col mobile, 2 tablet, 3 desktop (care pro no meio) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {plans.slice(0, 3).map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              isPopular={plan.id === 'plus'} 
              isEntry={plan.id === 'essential'}
              onSubscribe={handleSubscribe} 
            />
          ))}
        </div>

        {/* Planos Premium / Multi-Unidades */}
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-black text-slate-400 uppercase tracking-[0.3em]">Redes e Multi-Unidades</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {plans.slice(3).map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                isPremium={true}
                onSubscribe={handleSubscribe} 
              />
            ))}
          </div>
        </div>

        {/* Suporte e Segurança */}
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black mb-6">ClinicaHub &bull; Gestão Profissional</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Pagamento processado em ambiente seguro via **Asaas ou Pepper**. 
                Após a confirmação, seu acesso será liberado instantaneamente. Dúvidas? Fale com nosso time agora.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m-3-3h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                  <span className="text-sm font-bold">100% Seguro</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm font-bold">Acesso Vitalício aos Dados</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h3 className="font-black text-xl mb-6 uppercase tracking-widest">Suporte Dedicado</h3>
              <div className="space-y-6">
                 <a href="mailto:suporte@clinicahub.com.br" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase opacity-60">E-mail</p>
                       <p className="font-bold">suporte@clinicahub.com.br</p>
                    </div>
                 </a>
                 <a href="https://wa.me/5511999999999" target="_blank" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.437 0 12.045c0 2.112.552 4.173 1.6 6.009L0 24l6.115-1.604a11.79 11.79 0 005.932 1.597h.005c6.605 0 12.04-5.437 12.045-12.045a11.813 11.813 0 00-3.535-8.513" /></svg>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase opacity-60">WhatsApp Oficial</p>
                       <p className="font-bold">+55 (11) 99999-9999</p>
                    </div>
                 </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

// Componente Interno para o Card do Plano
const PlanCard = ({ plan, isPopular, isEntry, isPremium, onSubscribe }: any) => {
  return (
    <div className={`relative flex flex-col p-8 bg-white rounded-[2.5rem] border-2 transition-all hover:scale-[1.03] ${
      isPopular ? 'border-indigo-600 shadow-2xl shadow-indigo-100' : 'border-slate-100 shadow-xl'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          O Mais Vendido 🔥
        </div>
      )}
      {isEntry && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          Melhor Custo Benefício 💎
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{plan.description}</p>
      </div>

      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-4xl font-black text-slate-900">R$ {(plan.price_cents / 100).toFixed(0)}</span>
        <span className="text-slate-400 font-bold text-lg">/mês</span>
      </div>

      <div className="space-y-4 mb-10 flex-1">
        <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
           <div className="flex items-center gap-2 text-xs font-black text-slate-700">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              {plan.max_clinics} {plan.max_clinics > 1 ? 'Clínicas' : 'Unidade'}
           </div>
           <div className="flex items-center gap-2 text-xs font-black text-slate-700">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
              Até {plan.max_professionals} Colaboradores
           </div>
        </div>

        <ul className="space-y-3">
          {plan.features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-3 text-[13px] text-slate-600 font-medium">
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <Button 
        onClick={() => onSubscribe(plan.id)}
        className={`w-full py-5 text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl ${
          isPopular ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-900 hover:bg-black shadow-slate-200'
        }`}
      >
        Assinar plano
      </Button>
    </div>
  );
}

export default ChoosePlan;

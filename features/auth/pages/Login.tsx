
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import Toast from '../../../components/ui/Toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Usamos a store para manter o estado global
      // Note: atualizei a store para receber senha também
      await authStore.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-indigo-100/50 border border-slate-200 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-xl shadow-indigo-100">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo</h1>
          <p className="text-slate-500 mt-2">Acesse o painel da sua clínica</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          
          <div className="space-y-1">
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-4 text-lg mt-2"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entrando...
              </div>
            ) : 'Acessar Painel'}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600 font-medium">
            Ainda não tem uma conta? <br/>
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Crie sua clínica agora
            </Link>
          </p>
          <div className="mt-4">
             <Link to="/booking" className="text-xs text-slate-400 hover:text-slate-600">
                Página de Agendamento Público
             </Link>
          </div>
        </div>
      </div>

      {error && (
        <Toast 
          message={error} 
          type="error" 
          onClose={() => setError(null)} 
          duration={10000} 
        />
      )}
    </div>
  );
};

export default Login;

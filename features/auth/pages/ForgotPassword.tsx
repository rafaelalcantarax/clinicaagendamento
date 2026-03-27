
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import Toast from '../../../components/ui/Toast';
import { api } from '../../../lib/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.resetPassword(email);
      setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recuperar Senha</h1>
          <p className="text-slate-500 mt-2">Enviaremos um link para você redefinir sua senha.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <Input
            label="E-mail Cadastrado"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full py-4" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link'}
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-sm font-bold text-indigo-600 hover:underline">
              Voltar para o Login
            </Link>
          </div>
        </form>
      </div>

      {error && (
        <Toast 
          message={error} 
          type="error" 
          onClose={() => setError(null)} 
          duration={10000} 
        />
      )}

      {message && (
        <Toast 
          message={message} 
          type="success" 
          onClose={() => setMessage(null)} 
          duration={10000} 
        />
      )}
    </div>
  );
};

export default ForgotPassword;


import React from 'react';
import { Link } from 'react-router-dom';

const BookingSuccess: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Agendamento Confirmado!</h1>
      <p className="text-slate-600 mb-8">
        Enviamos todos os detalhes e o link de confirmação para o seu WhatsApp.
      </p>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 text-left space-y-3">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Dica Importante</p>
        <p className="text-sm text-slate-700">
          Caso precise desmarcar, utilize o link enviado no WhatsApp com pelo menos 24h de antecedência.
        </p>
      </div>

      <Link to="/booking" className="text-indigo-600 font-bold hover:underline">
        Voltar para a página inicial
      </Link>
    </div>
  );
};

export default BookingSuccess;

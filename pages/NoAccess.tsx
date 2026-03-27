
import React from 'react';
import { Link } from 'react-router-dom';

const NoAccess: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m-3-3h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Acesso Negado</h1>
      <p className="text-slate-600 mb-8 max-w-md">
        Você não tem permissão para visualizar esta página. Por favor, contate o administrador caso acredite que isso seja um erro.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Voltar para o Início
      </Link>
    </div>
  );
};

export default NoAccess;

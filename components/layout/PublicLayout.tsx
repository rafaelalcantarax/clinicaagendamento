import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Fix: Passed logo prop to satisfy PublicHeader requirement in TypeScript environment. */}
      <PublicHeader clinicName="Centro Médico Vita" logo={null} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-8 bg-white border-t border-slate-100 text-center text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} ClinicaHub. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default PublicLayout;

import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Carregando...</p>
    </div>
  );
};

export default Loading;

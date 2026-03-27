
import React from 'react';
import { Provider } from '../../../types';

interface ProviderPickerProps {
  providers: Provider[];
  selectedProviderId?: string;
  onSelect: (provider: Provider) => void;
}

const ProviderPicker: React.FC<ProviderPickerProps> = ({ providers, selectedProviderId, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {providers.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className={`p-6 text-left border rounded-xl transition-all flex items-center gap-4 ${
            selectedProviderId === p.id 
              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
              : 'hover:border-indigo-400 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 uppercase border-2 border-white shadow-sm">
            {p.name[0]}
          </div>
          <div>
            <p className="font-bold text-slate-900">{p.name}</p>
            <p className="text-sm text-slate-500">{p.specialty}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProviderPicker;

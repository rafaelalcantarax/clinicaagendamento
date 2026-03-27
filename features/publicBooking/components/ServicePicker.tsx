
import React from 'react';
import { Service } from '../../../types';

interface ServicePickerProps {
  services: Service[];
  selectedServiceId?: string;
  onSelect: (service: Service) => void;
}

const ServicePicker: React.FC<ServicePickerProps> = ({ services, selectedServiceId, onSelect }) => {
  return (
    <div className="space-y-3">
      {services.map(s => (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          className={`w-full p-6 text-left border rounded-xl transition-all flex justify-between items-center ${
            selectedServiceId === s.id 
              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' 
              : 'hover:border-indigo-400 hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <p className="font-bold text-slate-900">{s.name}</p>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {s.duration} min
            </p>
          </div>
          <div className="text-indigo-600 font-extrabold text-lg">
            {s.price > 0 ? `R$ ${s.price}` : 'Grátis'}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ServicePicker;


import React, { useState } from 'react';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDate: string) => void;
  currentDate: string;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, onSave, currentDate }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate.split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(currentDate.split('T')[1]?.substring(0, 5) || '09:00');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(`${selectedDate}T${selectedTime}:00`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Remarcar Consulta</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nova Data</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Novo Horário</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="08:00">08:00</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Confirmar Alteração
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;

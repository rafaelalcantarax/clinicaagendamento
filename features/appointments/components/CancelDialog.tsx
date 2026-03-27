
import React from 'react';

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientName: string;
}

const CancelDialog: React.FC<CancelDialogProps> = ({ isOpen, onClose, onConfirm, patientName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Cancelar Agendamento?</h3>
        <p className="text-slate-600 mb-8">
          Tem certeza que deseja cancelar a consulta de <span className="font-semibold">{patientName}</span>? 
          Esta ação enviará uma notificação automática para o paciente.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Não, manter
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg shadow-sm transition-colors"
          >
            Sim, cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelDialog;

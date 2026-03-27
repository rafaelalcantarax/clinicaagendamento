
import React, { useState, useEffect } from 'react';

interface SlotPickerProps {
  selectedDate: Date;
  primaryColor?: string;
  onSlotSelect: (time: string) => void;
  bookedSlots?: string[]; // Novos horários que já estão ocupados
  startTime?: string;
  endTime?: string;
}

const SlotPicker: React.FC<SlotPickerProps> = ({ 
  selectedDate, 
  primaryColor = '#4f46e5', 
  onSlotSelect,
  bookedSlots = [],
  startTime = '08:00',
  endTime = '18:00'
}) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Gera slots de 30 em 30 minutos dinamicamente
  const generateSlots = () => {
    const slots = [];
    let [h, m] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const endTotal = endH * 60 + endM;

    while ((h * 60 + m) < endTotal) {
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const isBooked = bookedSlots.includes(timeStr);
      
      // Validação de horário passado se for hoje
      let isPast = false;
      const now = new Date();
      if (selectedDate.toDateString() === now.toDateString()) {
        const [nowH, nowM] = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(':').map(Number);
        if ((h * 60 + m) <= (nowH * 60 + nowM)) isPast = true;
      }

      slots.push({ 
        time: timeStr, 
        available: !isBooked && !isPast 
      });
      
      m += 30;
      if (m >= 60) {
        h += 1;
        m = 0;
      }
    }
    return slots;
  };

  const slots = generateSlots();

  const handleSelect = (time: string) => {
    setSelectedTime(time);
    onSlotSelect(time);
  };

  const lightBg = `${primaryColor}10`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Horários Disponíveis</h3>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Frequência: 30 min</p>
      </div>

      {slots.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-bold text-sm">Nenhum horário disponível para este dia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {slots.map((slot) => {
            const isSelected = selectedTime === slot.time;
            return (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => handleSelect(slot.time)}
                style={{ 
                  backgroundColor: isSelected ? primaryColor : '',
                  borderColor: isSelected ? primaryColor : '#f1f5f9',
                  boxShadow: isSelected ? `0 8px 15px ${primaryColor}30` : ''
                }}
                className={`
                  py-4 px-2 rounded-2xl text-lg font-black border-2 transition-all active:scale-90
                  ${!slot.available 
                    ? 'bg-slate-50 text-slate-200 border-slate-50 cursor-not-allowed line-through' 
                    : isSelected
                      ? 'text-white'
                      : 'bg-white text-slate-600 hover:border-slate-300 hover:shadow-lg'
                  }
                `}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      )}

      {selectedTime && (
        <div 
          className="mt-6 p-6 rounded-[2rem] border-2 flex items-center gap-5 animate-in zoom-in duration-300 shadow-xl"
          style={{ backgroundColor: 'white', borderColor: `${primaryColor}40` }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white" style={{ backgroundColor: primaryColor }}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-widest" style={{ color: primaryColor }}>Horário Selecionado</p>
            <p className="text-lg font-bold text-slate-900 leading-tight">
              {selectedTime} • {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotPicker;

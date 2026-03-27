
module.exports = {
  formatConfirmation: (patientName, date, clinicName) => {
    return `Olá *${patientName}*, seu agendamento na clínica *${clinicName}* foi confirmado para o dia ${date}. Aguardamos você! ✅`;
  },
  formatReminder: (patientName, time) => {
    return `Lembrete: Você tem uma consulta hoje às *${time}*. Caso precise desmarcar, avise com antecedência. 🔔`;
  }
};

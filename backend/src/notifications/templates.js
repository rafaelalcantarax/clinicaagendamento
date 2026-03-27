
module.exports = {
  appointment_confirmed: (data) => 
    `Olá ${data.patientName}! Seu agendamento na *${data.clinicName}* para o dia ${data.date} às ${data.time} com ${data.providerName} foi confirmado. ✅`,
  
  appointment_reminder: (data) => 
    `Lembrete: Você tem uma consulta hoje às *${data.time}* na ${data.clinicName}. Caso precise desmarcar, avise com antecedência.`,
  
  appointment_cancelled: (data) => 
    `Olá ${data.patientName}. Seu agendamento para o dia ${data.date} foi cancelado. Se desejar reagendar, acesse nosso link: ${data.bookingUrl}`,

  invite_member: (data) => 
    `Olá! Você foi convidado para a equipe da clínica ${data.clinicName}. Use o código *${data.inviteCode}* para acessar o painel.`
};

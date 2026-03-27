
const prisma = require('../../lib/prisma');

class AvailabilityService {
  async getAvailableSlots(providerId, dateStr, serviceDuration) {
    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getDay();

    // 1. Buscar regras de horários do dia
    const rules = await prisma.availabilityRule.findMany({
      where: { providerId, dayOfWeek }
    });

    if (rules.length === 0) return [];

    // 2. Buscar agendamentos existentes no dia
    const startOfDay = new Date(targetDate.setHours(0,0,0,0));
    const endOfDay = new Date(targetDate.setHours(23,59,59,999));
    const appointments = await prisma.appointment.findMany({
      where: {
        providerId,
        status: 'SCHEDULED',
        date: { gte: startOfDay, lte: endOfDay }
      }
    });

    // 3. Gerar slots baseados nas regras
    let allPossibleSlots = [];
    rules.forEach(rule => {
      let current = this.timeToMinutes(rule.startTime);
      const end = this.timeToMinutes(rule.endTime);

      while (current + serviceDuration <= end) {
        allPossibleSlots.push(this.minutesToTime(current));
        current += serviceDuration; // Slots sequenciais ou fixos (pode adicionar buffer aqui)
      }
    });

    // 4. Marcar disponibilidade baseada em conflitos
    return allPossibleSlots.map(time => {
      const isOccupied = appointments.some(appt => {
        const apptTime = new Date(appt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return apptTime === time;
      });

      return { time, available: !isOccupied };
    });
  }

  timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  minutesToTime(min) {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}

module.exports = new AvailabilityService();

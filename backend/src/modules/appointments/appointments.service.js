const prisma = require('../../lib/prisma');

class AppointmentsService {
  // Fix: Added listAll method used by AppointmentsController to fetch all clinic appointments.
  async listAll(clinicSlug) {
    return prisma.appointment.findMany({
      where: { clinic: { slug: clinicSlug } }
    });
  }

  async create(data, clinicSlug) {
    // 1. Validar conflito de agenda
    const hasConflict = await this.checkConflict(data.providerId, data.date);
    if (hasConflict) throw new Error('Horário já ocupado');

    // 2. Criar agendamento
    return prisma.appointment.create({
      data: {
        ...data,
        clinic: { connect: { slug: clinicSlug } }
      }
    });
  }

  // Fix: Added cancel method used by AppointmentsController to update appointment status.
  async cancel(id) {
    return prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
  }

  async checkConflict(providerId, date) {
    const existing = await prisma.appointment.findFirst({
      where: { providerId, date }
    });
    return !!existing;
  }
}

module.exports = new AppointmentsService();

const prisma = require('../../lib/prisma');
const appointmentsService = require('../appointments/appointments.service');

class PublicService {
  async getClinicBySlug(slug) {
    return prisma.clinic.findUnique({
      where: { slug },
      include: { branding: true, services: true, providers: { include: { user: true } } }
    });
  }

  async createPublicBooking(slug, data) {
    const clinic = await prisma.clinic.findUnique({ where: { slug } });
    if (!clinic) throw new Error('Clínica não encontrada');

    return appointmentsService.create(data, clinic.slug);
  }
}

module.exports = new PublicService();


const prisma = require('../../lib/prisma');

class ServicesService {
  async list(clinicSlug) {
    return prisma.service.findMany({
      where: { clinic: { slug: clinicSlug } }
    });
  }

  async create(data, clinicSlug) {
    return prisma.service.create({
      data: {
        ...data,
        clinic: { connect: { slug: clinicSlug } }
      }
    });
  }
}

module.exports = new ServicesService();


const prisma = require('../../lib/prisma');

class ProvidersService {
  async list(clinicSlug) {
    return prisma.provider.findMany({
      where: { clinic: { slug: clinicSlug } }
    });
  }

  async create(data, clinicSlug) {
    return prisma.provider.create({
      data: {
        ...data,
        clinic: { connect: { slug: clinicSlug } }
      }
    });
  }

  async getById(id) {
    return prisma.provider.findUnique({ where: { id } });
  }

  async update(id, data) {
    return prisma.provider.update({ where: { id }, data });
  }
}

module.exports = new ProvidersService();

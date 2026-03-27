
const prisma = require('../../lib/prisma');
const slugify = require('../../utils/slugify');

class ClinicsService {
  async getBySlug(slug) {
    return prisma.clinic.findUnique({ where: { slug } });
  }

  async update(slug, data) {
    if (data.name) {
      data.slug = slugify(data.name);
    }
    return prisma.clinic.update({
      where: { slug },
      data
    });
  }

  async create(data) {
    const slug = slugify(data.name);
    return prisma.clinic.create({
      data: { ...data, slug }
    });
  }
}

module.exports = new ClinicsService();

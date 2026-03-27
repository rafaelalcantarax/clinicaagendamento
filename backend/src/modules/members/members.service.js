
const prisma = require('../../lib/prisma');

class MembersService {
  async listMembers(clinicSlug) {
    return prisma.member.findMany({
      where: { clinic: { slug: clinicSlug } }
    });
  }

  async inviteMember(email, role, clinicSlug) {
    // Lógica de envio de e-mail/convite aqui
    return prisma.member.create({
      data: { email, role, clinicSlug, status: 'invited' }
    });
  }
}

module.exports = new MembersService();

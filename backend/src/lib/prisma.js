// Em um ambiente real: const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// Mock do Prisma para desenvolvimento sem banco real configurado
const prisma = {
  appointment: {
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    findFirst: async () => null,
    findMany: async () => [],
    // Fix: Added update method for appointment status changes
    update: async (query) => ({ id: query.where.id, ...query.data })
  },
  member: {
    findMany: async () => [],
    create: async (data) => data
  },
  clinic: {
    findUnique: async (query) => ({ id: '1', slug: query.where.slug, name: 'Clínica Demo' }),
    // Fix: Added update method for clinic settings
    update: async (query) => ({ id: '1', ...query.data })
  },
  // Fix: Added missing service model mock
  service: {
    findUnique: async (query) => ({ id: query.where.id, duration: 30, name: 'Serviço Mock' }),
    findMany: async () => [],
    create: async (data) => ({ id: Math.random().toString(), ...data })
  },
  // Fix: Added missing provider model mock
  provider: {
    findMany: async () => [],
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    findUnique: async (query) => ({ id: query.where.id, name: 'Profissional Mock' }),
    update: async (query) => ({ id: query.where.id, ...query.data })
  },
  // Fix: Added missing availabilityRule model mock
  availabilityRule: {
    findMany: async () => []
  }
};

module.exports = prisma;
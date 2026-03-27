const availabilityService = require('./availability.service');
// Fix: Added missing prisma import to resolve ReferenceError when accessing prisma.service to find service duration.
const prisma = require('../../lib/prisma');

class AvailabilityController {
  async getSlots(req, res, next) {
    try {
      const { providerId, date, serviceId } = req.query;
      
      // Busca duração do serviço para calcular slots
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      const duration = service ? service.duration : 30;

      const slots = await availabilityService.getAvailableSlots(providerId, date, duration);
      res.json(slots);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AvailabilityController();
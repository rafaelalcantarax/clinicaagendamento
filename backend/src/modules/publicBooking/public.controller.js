
const publicService = require('./public.service');
const availabilityService = require('../availability/availability.service');

class PublicController {
  async getClinicInfo(req, res, next) {
    try {
      const { slug } = req.params;
      const clinic = await publicService.getClinicBySlug(slug);
      if (!clinic) return res.status(404).json({ error: 'Clínica não encontrada' });
      res.json(clinic);
    } catch (error) {
      next(error);
    }
  }

  async getSlots(req, res, next) {
    try {
      const { providerId, date, duration } = req.query;
      const slots = await availabilityService.getAvailableSlots(
        providerId, 
        date, 
        parseInt(duration)
      );
      res.json(slots);
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req, res, next) {
    try {
      const { slug } = req.params;
      const booking = await publicService.createPublicBooking(slug, req.body);
      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PublicController();
